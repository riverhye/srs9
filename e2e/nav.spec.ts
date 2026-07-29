import { expect, test } from "@playwright/test";

// 단일 도메인 재구성(Stage 2): 상단 내비 = 로고(→/) · Blog · Guestbook.
test.describe("단일 도메인 내비게이션", () => {
  test("헤더에 Blog·Guestbook 링크와 로고가 보인다", async ({ page }) => {
    // Given/When: 홈에 접속하면
    await page.goto("/");
    const header = page.locator("header");
    // Then: 로고와 두 내비 링크가 보인다
    await expect(header.getByRole("link", { name: "srs9" })).toBeVisible();
    await expect(header.getByRole("link", { name: "Blog" })).toBeVisible();
    await expect(header.getByRole("link", { name: "Guestbook" })).toBeVisible();
  });

  test("Blog 링크로 이동한다", async ({ page }) => {
    // Given: 홈에서
    await page.goto("/");
    // When: 헤더의 Blog를 누르면
    await page.locator("header").getByRole("link", { name: "Blog" }).click();
    // Then: /blog로 이동한다
    await expect(page).toHaveURL(/\/blog$/);
  });

  test("Guestbook 링크로 이동한다", async ({ page }) => {
    // Given: 홈에서
    await page.goto("/");
    // When: 헤더의 Guestbook을 누르면
    await page
      .locator("header")
      .getByRole("link", { name: "Guestbook" })
      .click();
    // Then: /guestbook으로 이동한다
    await expect(page).toHaveURL(/\/guestbook$/);
  });

  test("사이트 페이지엔 헤더/푸터가 있고 /stella엔 없다", async ({ page }) => {
    // Given: 공개 사이트 페이지에는 크롬이 있다
    await page.goto("/");
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
    // When: /stella(소유자 전용)로 가면
    await page.goto("/stella");
    // Then: 사이트 헤더/푸터가 없다 (자체 레이아웃)
    await expect(page.locator("header")).toHaveCount(0);
    await expect(page.locator("footer")).toHaveCount(0);
  });
});
