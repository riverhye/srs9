import { expect, test } from "@playwright/test";

// Stage 3 통합: 로그인 → 작성 → 발행 → 읽기 → 댓글 → 답글 → 삭제.
test.describe("블로그 CMS 통합", () => {
  test("비로그인 시 /stella는 로그인으로 리다이렉트된다", async ({ page }) => {
    // Given/When: 로그인 없이 대시보드에 접근하면
    await page.goto("/stella");
    // Then: 로그인 페이지로 보낸다
    await expect(page).toHaveURL(/\/stella\/login$/);
  });

  test("로그인→작성→발행→읽기→댓글→답글→삭제", async ({ page }) => {
    // 로그인
    await page.goto("/stella/login");
    await page.getByLabel("code").fill("stella-dev");
    await page.getByRole("button", { name: "In" }).click();
    await expect(page).toHaveURL(/\/stella$/);

    // 작성 — 제목/태그/본문(제목·굵게)
    await page.goto("/stella/write");
    await page.getByRole("textbox", { name: "제목" }).fill("E2E 통합 글");
    await page.getByRole("textbox", { name: "태그" }).fill("essay, dev");
    const editor = page.locator(".ProseMirror");
    await editor.click();
    await page.keyboard.type("## 소제목");
    await page.keyboard.press("Enter");
    await page.keyboard.type("**굵게** 그리고 일반 문장");

    // 발행 → 상세로 이동
    await page.getByRole("button", { name: "발행" }).click();
    await expect(page).toHaveURL(/\/blog\/.+/);

    // 상세 렌더 확인 — 본문(.prose-stella)으로 스코프(댓글 섹션 h2와 구분)
    await expect(page.locator(".prose-stella h2")).toHaveText("소제목");
    await expect(page.locator(".prose-stella strong")).toHaveText("굵게");

    // 목록에 노출
    await page.goto("/blog");
    await expect(
      page.getByRole("link", { name: /E2E 통합 글/ }).first(),
    ).toBeVisible();

    // 상세로 다시 들어가 댓글 작성
    await page
      .getByRole("link", { name: /E2E 통합 글/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/blog\/.+/);

    await page.getByLabel("닉네임").fill("손님");
    await page.getByLabel("비밀번호").fill("cpw");
    await page.getByLabel("댓글 내용").fill("좋은 글이네요");
    await page.getByRole("button", { name: "등록", exact: true }).click();
    await expect(page.getByText("좋은 글이네요")).toBeVisible();
    await expect(page.getByText("손님")).toBeVisible();

    // 답글 작성
    await page
      .getByRole("button", { name: "답글", exact: true })
      .first()
      .click();
    const replyForm = page
      .locator("form")
      .filter({ has: page.getByRole("button", { name: "답글 등록" }) });
    await replyForm.getByLabel("닉네임").fill("나");
    await replyForm.getByLabel("비밀번호").fill("rpw");
    await replyForm.getByLabel("댓글 내용").fill("답글 내용");
    await replyForm.getByRole("button", { name: "답글 등록" }).click();
    await expect(page.getByText("답글 내용")).toBeVisible();

    // 최상위 댓글 삭제(비번) → 대댓글도 함께 사라짐
    page.once("dialog", (d) => d.accept("cpw"));
    await page.getByRole("button", { name: "삭제" }).first().click();
    await expect(page.getByText("좋은 글이네요")).toHaveCount(0);
    await expect(page.getByText("답글 내용")).toHaveCount(0);

    // 태그로 검색 — 상세의 태그 클릭 → 그 태그로 필터된 목록
    await page.getByRole("link", { name: "#essay" }).click();
    await expect(page).toHaveURL(/\/blog\?tag=essay$/);
    await expect(
      page.getByRole("link", { name: /E2E 통합 글/ }).first(),
    ).toBeVisible();
    // 없는 태그면 비어 있다
    await page.goto("/blog?tag=nope");
    await expect(page.getByText("아직 글이 없습니다.")).toBeVisible();
  });

  // Velog 이관 — 원본 주소·발행일을 그대로 저장할 수 있어야 한다.
  test("주소와 발행일을 지정해 글을 만들면 그 값대로 저장된다", async ({
    page,
  }) => {
    // Given: 소유자로 로그인해
    expect(
      (
        await page.request.post("/api/auth/login", {
          data: { password: "stella-dev" },
        })
      ).ok(),
    ).toBe(true);

    // When: Velog식 주소(대문자·점 포함)와 과거 날짜를 지정해 발행하면
    const slug = "E2E-Next.js-15-이관";
    const res = await page.request.post("/api/posts", {
      data: {
        title: "E2E 이관 글",
        tags: ["nextjs"],
        status: "published",
        slug,
        date: "2024-07-11",
        body: {
          type: "doc",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "본문" }] },
          ],
        },
      },
    });
    expect(res.status()).toBe(201);
    const post = (await res.json()) as {
      slug: string;
      date: string;
      id: string;
    };

    // Then: slugify를 거치지 않고 그대로, 날짜도 지정한 값으로 저장된다
    expect(post.slug).toBe(slug);
    expect(post.date).toBe("2024-07-11");

    // 그 주소로 실제 상세 페이지가 열린다
    await page.goto(`/blog/${encodeURIComponent(slug)}`);
    await expect(page.locator(".prose-stella")).toContainText("본문");

    // 잘못된 값은 거부한다
    const bad = await page.request.post("/api/posts", {
      data: {
        title: "x",
        tags: [],
        status: "draft",
        date: "2024/07/11",
        body: { type: "doc", content: [] },
      },
    });
    expect(bad.status()).toBe(400);

    // 뒷정리
    expect((await page.request.delete(`/api/posts/${post.id}`)).ok()).toBe(
      true,
    );
  });

  // Velog 이관 글의 비교표가 표 모양으로 나와야 한다(PostBody의 table 분기).
  test("본문의 표가 읽기 화면에서 표로 렌더된다", async ({ page }) => {
    // Given: 소유자로 로그인해
    const login = await page.request.post("/api/auth/login", {
      data: { password: "stella-dev" },
    });
    expect(login.ok()).toBe(true);

    // When: 표가 든 본문을 발행하면
    const cell = (text: string, header = false, colspan = 1) => ({
      type: header ? "tableHeader" : "tableCell",
      attrs: { colspan, rowspan: 1 },
      content: [{ type: "paragraph", content: [{ type: "text", text }] }],
    });
    const res = await page.request.post("/api/posts", {
      data: {
        title: "E2E 표 렌더",
        tags: [],
        status: "published",
        body: {
          type: "doc",
          content: [
            {
              type: "table",
              content: [
                {
                  type: "tableRow",
                  content: [cell("구분", true), cell("MVC", true)],
                },
                {
                  type: "tableRow",
                  content: [cell("두 칸 병합", false, 2)],
                },
              ],
            },
          ],
        },
      },
    });
    expect(res.status()).toBe(201);
    const { slug, id } = (await res.json()) as { slug: string; id: string };

    // Then: 상세 페이지에 실제 table 태그와 병합 셀이 나온다
    await page.goto(`/blog/${encodeURIComponent(slug)}`);
    await expect(page.locator(".prose-stella table th").first()).toHaveText(
      "구분",
    );
    await expect(page.locator(".prose-stella table td")).toHaveAttribute(
      "colspan",
      "2",
    );

    // 뒷정리 — 목록에 남지 않게 지운다
    expect((await page.request.delete(`/api/posts/${id}`)).ok()).toBe(true);
  });
});
