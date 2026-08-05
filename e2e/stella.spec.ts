import { expect, test } from "@playwright/test";

// /stella/* 는 소유자 전용(3b-5) — 각 테스트 전에 로그인.
test.beforeEach(async ({ page }) => {
  await page.goto("/stella/login");
  await page.getByLabel("code").fill("stella-dev");
  await page.getByRole("button", { name: "In" }).click();
  await expect(page).toHaveURL(/\/stella$/);
});

test.describe("/stella 진입 방식", () => {
  test("대시보드(/stella)가 단일 도메인에서 렌더된다", async ({ page }) => {
    // Given/When: /stella에 접속하면
    await page.goto("/stella");
    // Then: 대시보드가 보인다
    await expect(page).toHaveURL(/\/stella$/);
    await expect(page.getByRole("link", { name: "글쓰기" })).toBeVisible();
  });
});

test.describe("/stella/write 에디터", () => {
  test("에디터가 렌더된다", async ({ page }) => {
    // Given/When: /stella/write에 접속하면
    await page.goto("/stella/write");
    // Then: 에디터가 보인다
    await expect(page).toHaveURL(/\/stella\/write$/);
    await expect(page.locator(".ProseMirror")).toBeVisible();
  });

  test("비어 있을 때 placeholder가 보인다", async ({ page }) => {
    // Given: 빈 에디터에 접속한 상태에서
    await page.goto("/stella/write");
    // When: 첫 문단을 보면
    const empty = page.locator(".ProseMirror p.is-editor-empty").first();
    // Then: placeholder 문구가 표시된다
    await expect(empty).toHaveAttribute(
      "data-placeholder",
      "내용을 입력하세요…",
    );
  });

  test("입력한 텍스트가 반영된다", async ({ page }) => {
    // Given: 에디터에 포커스한 상태에서
    await page.goto("/stella/write");
    const editor = page.locator(".ProseMirror");
    await editor.click();
    // When: 텍스트를 입력하면
    await page.keyboard.type("Hello stella");
    // Then: 본문에 그대로 반영된다
    await expect(editor).toContainText("Hello stella");
  });

  test("마크다운 input rules: 제목과 굵게", async ({ page }) => {
    // Given: 에디터에 포커스한 상태에서
    await page.goto("/stella/write");
    const editor = page.locator(".ProseMirror");
    await editor.click();

    // When: "# "로 시작해 입력하면 → Then: h1로 변환된다
    await page.keyboard.type("# 제목");
    await expect(editor.locator("h1")).toHaveText("제목");

    // When: "**…**"로 감싸 입력하면 → Then: strong으로 변환된다
    await page.keyboard.press("Enter");
    await page.keyboard.type("**굵게** 나머지");
    await expect(editor.locator("strong")).toHaveText("굵게");
  });
});

// 대시보드(/stella): 작성 화면(/stella/write) 진입점.
test.describe("/stella 대시보드", () => {
  test("글쓰기 버튼 클릭 시 /stella/write으로 이동한다", async ({ page }) => {
    // Given: 대시보드(/stella)에 있고
    await page.goto("/stella");
    // When: 글쓰기 버튼을 누르면
    await page.getByRole("link", { name: "글쓰기" }).click();
    // Then: 작성 화면(/stella/write)으로 이동하고 에디터가 보인다
    await expect(page).toHaveURL(/\/stella\/write$/);
    await expect(page.locator(".ProseMirror")).toBeVisible();
  });
});

// Step 3 툴바: 버튼이 서식을 적용하고 active 상태가 반영되는지 검증.
test.describe("/stella/write 툴바", () => {
  test("툴바가 렌더된다", async ({ page }) => {
    // Given/When: 에디터에 접속하면
    await page.goto("/stella/write");
    // Then: 서식 도구 툴바가 보인다
    await expect(
      page.getByRole("toolbar", { name: "서식 도구" }),
    ).toBeVisible();
  });

  test("굵게 버튼이 선택 텍스트에 적용되고 active로 표시된다", async ({
    page,
  }) => {
    // Given: 텍스트를 입력하고 전체 선택한 상태에서
    await page.goto("/stella/write");
    const editor = page.locator(".ProseMirror");
    await editor.click();
    await page.keyboard.type("hello");
    await page.keyboard.press("ControlOrMeta+a");

    // When: 굵게 버튼을 누르면
    const boldBtn = page.getByRole("button", { name: "굵게" });
    await boldBtn.click();

    // Then: 선택 텍스트가 strong이 되고 버튼이 active로 표시된다
    await expect(editor.locator("strong")).toHaveText("hello");
    await expect(boldBtn).toHaveAttribute("aria-pressed", "true");
  });

  test("제목 버튼이 블록을 H2로 바꾼다", async ({ page }) => {
    // Given: 한 줄을 입력한 상태에서
    await page.goto("/stella/write");
    const editor = page.locator(".ProseMirror");
    await editor.click();
    await page.keyboard.type("소제목");

    // When: 제목 2 버튼을 누르면
    await page.getByRole("button", { name: "제목 2" }).click();
    // Then: 해당 블록이 h2로 바뀐다
    await expect(editor.locator("h2")).toHaveText("소제목");
  });

  test("링크 버튼이 prompt URL로 링크를 설정한다", async ({ page }) => {
    // Given: 텍스트를 입력하고 전체 선택한 상태에서
    await page.goto("/stella/write");
    const editor = page.locator(".ProseMirror");
    await editor.click();
    await page.keyboard.type("anchor");
    await page.keyboard.press("ControlOrMeta+a");

    // When: 링크 버튼을 누르고 prompt에 URL을 입력하면
    page.once("dialog", (dialog) => dialog.accept("https://srs9.com"));
    await page.getByRole("button", { name: "링크" }).click();

    // Then: 선택 텍스트가 해당 href의 링크가 된다
    const link = editor.locator("a");
    await expect(link).toHaveText("anchor");
    await expect(link).toHaveAttribute("href", "https://srs9.com");
  });
});

// Step 4: 이미지(URL) + 커스텀 callout(별 모티프).
test.describe("/stella/write 이미지·콜아웃", () => {
  test("이미지 파일을 업로드해 본문에 삽입하고 서빙된다", async ({ page }) => {
    // Given: 에디터에 포커스한 상태에서
    await page.goto("/stella/write");
    const editor = page.locator(".ProseMirror");
    await editor.click();

    // When: 이미지 파일을 골라 업로드하면 (숨은 file input에 직접 세팅)
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64",
    );
    await page.setInputFiles('input[type="file"]', {
      name: "빌드-용량_비교.png",
      mimeType: "image/png",
      buffer: png,
    });

    // Then: R2에 올라간 이미지가 /api/media/ 경로로 본문에 삽입되고
    const img = editor.locator("img");
    await expect(img).toHaveAttribute("src", /\/api\/media\/.+/);
    // 그 URL이 실제로 서빙된다(200)
    const src = (await img.getAttribute("src"))!;
    const resp = await page.request.get(src);
    expect(resp.status()).toBe(200);
    // 서빙에 붙인 CSP가 <img> 렌더까지 막지는 않는다 — 실제로 그려졌는지 확인
    await expect
      .poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth))
      .toBeGreaterThan(0);
    // 크기가 함께 기록돼야 읽기 화면에서 본문이 밀리지 않는다(CLS). 샘플은 1×1.
    await expect(img).toHaveAttribute("width", "1");
    await expect(img).toHaveAttribute("height", "1");
    // 대체 텍스트는 파일명에서 만든다(확장자 제거, 구분자는 공백)
    await expect(img).toHaveAttribute("alt", "빌드 용량 비교");
  });

  test("콜아웃 버튼이 블록을 callout으로 감싸고 active로 표시된다", async ({
    page,
  }) => {
    // Given: 한 줄을 입력한 상태에서
    await page.goto("/stella/write");
    const editor = page.locator(".ProseMirror");
    await editor.click();
    await page.keyboard.type("중요한 메모");

    // When: 콜아웃 버튼을 누르면
    const calloutBtn = page.getByRole("button", { name: "콜아웃" });
    await calloutBtn.click();

    // Then: 해당 블록이 callout으로 감싸지고 버튼이 active로 표시된다
    const callout = editor.locator("aside[data-callout]");
    await expect(callout).toContainText("중요한 메모");
    await expect(calloutBtn).toHaveAttribute("aria-pressed", "true");
  });

  test("콜아웃 안에서 이어 입력한 텍스트가 박스 안에 반영된다", async ({
    page,
  }) => {
    // Given: 콜아웃으로 감싼 블록에서
    await page.goto("/stella/write");
    const editor = page.locator(".ProseMirror");
    await editor.click();
    await page.keyboard.type("첫 줄");
    await page.getByRole("button", { name: "콜아웃" }).click();

    // When: 이어서 텍스트를 입력하면
    await page.keyboard.type(" 그리고 둘째");

    // Then: 입력이 callout 박스 안에 그대로 들어간다
    await expect(editor.locator("aside[data-callout]")).toContainText(
      "첫 줄 그리고 둘째",
    );
  });
});

// Step 5: 글자색(ColorPicker) + 형광펜(Highlight).
test.describe("/stella/write 색상·형광펜", () => {
  test("형광펜 버튼이 선택 텍스트에 적용되고 active로 표시된다", async ({
    page,
  }) => {
    // Given: 텍스트를 입력하고 전체 선택한 상태에서
    await page.goto("/stella/write");
    const editor = page.locator(".ProseMirror");
    await editor.click();
    await page.keyboard.type("중요");
    await page.keyboard.press("ControlOrMeta+a");

    // When: 형광펜 버튼을 누르면
    const highlightBtn = page.getByRole("button", { name: "형광펜" });
    await highlightBtn.click();

    // Then: 선택 텍스트가 mark가 되고 버튼이 active로 표시된다
    await expect(editor.locator("mark")).toHaveText("중요");
    await expect(highlightBtn).toHaveAttribute("aria-pressed", "true");
  });

  test("마크다운 input rule: ==텍스트==가 형광펜으로 변환된다", async ({
    page,
  }) => {
    // Given: 에디터에 포커스한 상태에서
    await page.goto("/stella/write");
    const editor = page.locator(".ProseMirror");
    await editor.click();

    // When: "==…=="로 감싸 입력하면
    await page.keyboard.type("==형광== 나머지");

    // Then: mark로 변환된다
    await expect(editor.locator("mark")).toHaveText("형광");
  });

  test("글자색 팔레트에서 고른 색이 선택 텍스트에 적용된다", async ({
    page,
  }) => {
    // Given: 텍스트를 입력하고 전체 선택한 상태에서
    await page.goto("/stella/write");
    const editor = page.locator(".ProseMirror");
    await editor.click();
    await page.keyboard.type("컬러");
    await page.keyboard.press("ControlOrMeta+a");

    // When: 글자색 버튼으로 팔레트를 열고 빨강을 고르면
    await page.getByRole("button", { name: "글자색", exact: true }).click();
    await page.getByRole("button", { name: "글자색 빨강" }).click();

    // Then: 선택 텍스트가 해당 색의 span이 된다 (#ef4444 = rgb(239, 68, 68))
    const colored = editor.locator("span[style*='color']");
    await expect(colored).toHaveText("컬러");
    await expect(colored).toHaveCSS("color", "rgb(239, 68, 68)");
  });
});

// Step 6: 제목 + 임시저장(localStorage).
test.describe("/stella/write 제목·임시저장", () => {
  test("제목과 본문이 새로고침 후에도 복원된다", async ({ page }) => {
    // Given: 제목과 본문을 입력해 임시저장이 표시된 상태에서
    await page.goto("/stella/write");
    const titleInput = page.getByRole("textbox", { name: "제목" });
    await titleInput.fill("임시 제목");
    const editor = page.locator(".ProseMirror");
    await editor.click();
    await page.keyboard.type("임시 본문");
    await expect(page.getByText(/임시저장/)).toBeVisible();

    // When: 페이지를 새로고침하면
    await page.reload();

    // Then: 제목과 본문이 draft에서 복원된다
    await expect(page.getByRole("textbox", { name: "제목" })).toHaveValue(
      "임시 제목",
    );
    await expect(page.locator(".ProseMirror")).toContainText("임시 본문");
  });

  test("제목에서 Enter를 누르면 본문으로 포커스가 이동한다", async ({
    page,
  }) => {
    // Given: 제목을 입력한 상태에서
    await page.goto("/stella/write");
    const titleInput = page.getByRole("textbox", { name: "제목" });
    await titleInput.click();
    await page.keyboard.type("제목만");

    // When: Enter로 포커스가 본문에 넘어간 뒤 이어서 입력하면
    await page.keyboard.press("Enter");
    await expect(page.locator(".ProseMirror")).toBeFocused();
    await page.keyboard.type("본문 시작");

    // Then: 이어 입력한 내용은 본문에 들어가고 제목은 그대로다
    await expect(page.locator(".ProseMirror")).toContainText("본문 시작");
    await expect(titleInput).toHaveValue("제목만");
  });
});
