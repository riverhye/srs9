import { expect, test } from "@playwright/test";

// Stage 4: 방명록 — 방문자 익명 작성 + 소유자 답글/모더레이션.
test.describe("방명록", () => {
  // 로컬 D1은 실행 사이에 유지되므로, 매 테스트 전에 방명록을 비운다.
  test.beforeEach(async ({ page }) => {
    // 로그인이 실패하면 아래 삭제가 조용히 no-op이 되므로 여기서 잡는다.
    const login = await page.request.post("/api/auth/login", {
      data: { password: "stella-dev" },
    });
    expect(login.ok()).toBe(true);
    const entries = (await (
      await page.request.get("/api/guestbook")
    ).json()) as { id: string }[];
    // 부모를 지우면 답글도 함께 지워지므로, 이미 사라진 id는 그냥 통과한다.
    for (const { id } of entries) {
      await page.request.delete(`/api/guestbook/${id}`);
    }
    // 첫 테스트가 익명 상태로 시작하도록 정리용 세션은 닫는다.
    await page.request.post("/api/auth/logout");
  });

  test("익명으로 방명록을 남긴다", async ({ page }) => {
    // Given: 방명록 페이지에서
    await page.goto("/guestbook");
    // When: 닉네임·비밀번호·내용을 채워 남기면
    await page.getByLabel("닉네임").fill("길손");
    await page.getByLabel("비밀번호").fill("gpw");
    await page.getByLabel("방명록 내용").fill("여기 다녀갑니다");
    await page.getByRole("button", { name: "남기기" }).click();
    // Then: 방명록에 표시된다
    await expect(page.getByText("여기 다녀갑니다")).toBeVisible();
    await expect(page.getByText("길손")).toBeVisible();
  });

  test("소유자가 로그인하면 답글·삭제할 수 있다", async ({ page }) => {
    // Given: 익명 방명록이 하나 있고
    await page.goto("/guestbook");
    await page.getByLabel("닉네임").fill("문의자");
    await page.getByLabel("비밀번호").fill("qpw");
    await page.getByLabel("방명록 내용").fill("소유자테스트 항목");
    await page.getByRole("button", { name: "남기기" }).click();
    await expect(page.getByText("소유자테스트 항목")).toBeVisible();

    // 소유자 로그인
    await page.goto("/stella/login");
    await page.getByLabel("code").fill("stella-dev");
    await page.getByRole("button", { name: "In" }).click();
    await expect(page).toHaveURL(/\/stella$/);

    // When: 방명록으로 돌아와 답글을 달면
    await page.goto("/guestbook");
    const item = page.locator("li").filter({ hasText: "소유자테스트 항목" });
    await item.getByRole("button", { name: "답글", exact: true }).click();
    await item.getByLabel("답글 내용").fill("답글 감사합니다");
    await item.getByRole("button", { name: "답글 등록" }).click();
    // Then: 소유자 답글이 표시된다
    await expect(page.getByText("답글 감사합니다")).toBeVisible();

    // When: 소유자가 항목을 삭제하면(확인)
    page.once("dialog", (d) => d.accept());
    await item.getByRole("button", { name: "삭제" }).first().click();
    // Then: 항목과 딸린 답글이 함께 사라진다
    await expect(page.getByText("소유자테스트 항목")).toHaveCount(0);
    await expect(page.getByText("답글 감사합니다")).toHaveCount(0);
  });
});
