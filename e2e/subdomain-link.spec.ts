import { test, expect } from "@playwright/test";

// SubdomainLink: 현재 host의 첫 라벨만 바꿔 반대 서브도메인으로 이동하는 링크.
test.describe("SubdomainLink", () => {
  test("dev에서 me 링크를 누르면 me 서브도메인으로 이동한다", async ({
    page,
  }) => {
    // Given: dev 서브도메인에 접속 (apex localhost → dev로 리다이렉트됨)
    await page.goto("/");
    await expect(page).toHaveURL(/^http:\/\/dev\.localhost(:\d+)?\//);

    // When: "me ↗" 링크를 클릭
    await page.getByRole("link", { name: /me/ }).click();

    // Then: me 서브도메인으로 이동 (protocol·port 보존, 첫 라벨만 me로 교체)
    await expect(page).toHaveURL(/^http:\/\/me\.localhost(:\d+)?\//);
  });
});
