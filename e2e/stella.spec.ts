import { test, expect } from "@playwright/test";

test.describe("/stella 진입 방식", () => {
  for (const host of ["dev", "me"]) {
    test(`${host} 호스트에서 /stella(대시보드)가 그대로 서빙된다`, async ({
      page,
    }) => {
      // Given: dev/me 서브도메인 호스트로
      // When: /stella(대시보드)에 접속하면
      await page.goto(`http://${host}.localhost:3001/stella`);
      // Then: /dev·/me로 리라이트되지 않고 대시보드가 그대로 보인다
      await expect(page).toHaveURL(
        new RegExp(`^http://${host}\\.localhost:3001/stella$`),
      );
      await expect(page.getByRole("link", { name: "글쓰기" })).toBeVisible();
    });

    test(`${host} 호스트에서 /stella/write(에디터)가 그대로 서빙된다`, async ({
      page,
    }) => {
      // Given: dev/me 서브도메인 호스트로
      // When: /stella/write(에디터)에 접속하면
      await page.goto(`http://${host}.localhost:3001/stella/write`);
      // Then: 리라이트되지 않고 에디터가 그대로 렌더된다
      await expect(page).toHaveURL(
        new RegExp(`^http://${host}\\.localhost:3001/stella/write$`),
      );
      await expect(page.locator(".ProseMirror")).toBeVisible();
    });
  }
});

test.describe("/stella/write 에디터", () => {
  test("에디터가 렌더된다 (dev/me로 리라이트되지 않음)", async ({ page }) => {
    // Given/When: /stella/write에 접속하면
    await page.goto("/stella/write");
    // Then: 호스트 라우팅에 걸리지 않고 에디터가 보인다
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
  test("이미지 버튼이 prompt URL로 본문에 이미지를 삽입한다", async ({
    page,
  }) => {
    // Given: 에디터에 포커스한 상태에서
    await page.goto("/stella/write");
    const editor = page.locator(".ProseMirror");
    await editor.click();

    // When: 이미지 버튼을 누르고 prompt에 URL을 입력하면
    page.once("dialog", (dialog) =>
      dialog.accept("https://srs9.com/sample.png"),
    );
    await page.getByRole("button", { name: "이미지" }).click();

    // Then: 해당 src의 이미지가 본문에 삽입된다
    await expect(editor.locator("img")).toHaveAttribute(
      "src",
      "https://srs9.com/sample.png",
    );
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
