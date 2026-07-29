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
});
