import { expect, type Page, test } from "@playwright/test";

// Stage 8: 링크 공유 카드(Open Graph)·검색 색인 태그.
// 태그는 화면에 안 보여서 눈으로는 못 잡는다 — 여기서 지킨다.

const content = (page: Page, selector: string) =>
  page.locator(selector).first().getAttribute("content");

test.describe("공유 카드·검색 색인", () => {
  test("홈 제목에 사이트명이 겹치지 않는다", async ({ page }) => {
    // 루트와 (site) 레이아웃에 title 템플릿이 둘 다 있으면 "srs9 · srs9"가 된다
    await page.goto("/");
    await expect(page).toHaveTitle("srs9");
  });

  test("공통 공유 카드 이미지와 아이콘이 붙는다", async ({ page }) => {
    await page.goto("/");
    // 절대 주소여야 외부 서비스가 읽는다
    expect(await content(page, 'meta[property="og:image"]')).toMatch(
      /^https?:\/\/.+\/opengraph-image\.png/,
    );
    expect(await content(page, 'meta[property="og:image:width"]')).toBe("1200");
    expect(await content(page, 'meta[property="og:image:height"]')).toBe("630");
    expect(await content(page, 'meta[name="twitter:card"]')).toBe(
      "summary_large_image",
    );
    await expect(page.locator('link[rel="icon"]').first()).toHaveAttribute(
      "href",
      /favicon\.ico|icon\.svg/,
    );
  });

  test("글 상세는 그 글의 제목·요약·정본 주소를 싣고 카드 이미지를 물려받는다", async ({
    page,
  }) => {
    expect(
      (
        await page.request.post("/api/auth/login", {
          data: { password: "stella-dev" },
        })
      ).ok(),
    ).toBe(true);
    const res = await page.request.post("/api/posts", {
      data: {
        title: "E2E 메타 확인 글",
        tags: ["meta"],
        status: "published",
        slug: "E2E-메타-확인",
        date: "2025-03-04",
        body: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "첫 문단이 요약으로 쓰인다." }],
            },
          ],
        },
      },
    });
    expect(res.status()).toBe(201);
    const { id, slug } = (await res.json()) as { id: string; slug: string };

    await page.goto(`/blog/${encodeURIComponent(slug)}`);
    await expect(page).toHaveTitle("E2E 메타 확인 글 · srs9");
    expect(await content(page, 'meta[name="description"]')).toContain(
      "첫 문단이 요약으로 쓰인다",
    );
    expect(await content(page, 'meta[property="og:type"]')).toBe("article");
    expect(await content(page, 'meta[property="og:title"]')).toBe(
      "E2E 메타 확인 글",
    );
    // 글이 자체 openGraph를 정의해도 파일 기반 이미지가 빠지지 않아야 한다
    expect(await content(page, 'meta[property="og:image"]')).toContain(
      "opengraph-image.png",
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      new RegExp(`/blog/${encodeURIComponent(slug)}$`),
    );

    // 발행글은 sitemap에 있고, 초안은 없다
    const sitemap = await (await page.request.get("/sitemap.xml")).text();
    expect(sitemap).toContain(encodeURIComponent(slug));

    // 초안으로 되돌리면 목록에서 빠져야 한다(수정은 PUT — PATCH는 405)
    const toDraft = await page.request.put(`/api/posts/${id}`, {
      data: {
        title: "E2E 메타 확인 글",
        tags: ["meta"],
        status: "draft",
        body: {
          type: "doc",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "-" }] },
          ],
        },
      },
    });
    expect(toDraft.ok()).toBe(true);
    const afterDraft = await (await page.request.get("/sitemap.xml")).text();
    expect(afterDraft).not.toContain(encodeURIComponent(slug));

    expect((await page.request.delete(`/api/posts/${id}`)).ok()).toBe(true);
  });

  test("검색엔진 규칙이 관리 화면을 막고 목록을 가리킨다", async ({ page }) => {
    const robots = await (await page.request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /stella");
    expect(robots).toContain("Disallow: /api");
    expect(robots).toMatch(/Sitemap: https?:\/\/.+\/sitemap\.xml/);
  });
});
