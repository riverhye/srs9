import { test, expect } from "@playwright/test";

// Step 2 에디터: /stella가 어느 호스트에서도 그대로 서빙되고,
// 타이핑 / placeholder / 마크다운 input rules가 동작하는지 검증.
test.describe("/stella 에디터", () => {
  test("에디터가 렌더된다 (dev/me로 리라이트되지 않음)", async ({ page }) => {
    await page.goto("/stella");
    await expect(page).toHaveURL(/\/stella$/);
    await expect(page.locator(".ProseMirror")).toBeVisible();
  });

  test("비어 있을 때 placeholder가 보인다", async ({ page }) => {
    await page.goto("/stella");
    const empty = page.locator(".ProseMirror p.is-editor-empty").first();
    await expect(empty).toHaveAttribute("data-placeholder", "내용을 입력하세요…");
  });

  test("입력한 텍스트가 반영된다", async ({ page }) => {
    await page.goto("/stella");
    const editor = page.locator(".ProseMirror");
    await editor.click();
    await page.keyboard.type("Hello stella");
    await expect(editor).toContainText("Hello stella");
  });

  test("마크다운 input rules: 제목과 굵게", async ({ page }) => {
    await page.goto("/stella");
    const editor = page.locator(".ProseMirror");
    await editor.click();

    await page.keyboard.type("# 제목");
    await expect(editor.locator("h1")).toHaveText("제목");

    await page.keyboard.press("Enter");
    await page.keyboard.type("**굵게** 나머지");
    await expect(editor.locator("strong")).toHaveText("굵게");
  });
});
