import { expect, test } from "@playwright/test";

// Stage 8: 대비·가로 넘침. 눈으로는 "좀 흐리네" 정도로 지나치는 것들을 수치로 잡는다.
// WCAG AA 본문 기준 4.5:1. 코드 주석 색이 실제로 2.67:1이라 여기서 걸렸다.
const MIN_CONTRAST = 4.5;

// 페이지 안에서 도는 대비 계산기(WCAG 상대휘도).
// 함수로 넘겨야 인자가 전달된다 — 문자열로 주면 표현식만 평가되고 인자는 버려진다.
function measureContrast(selectors: [string, string][]) {
  const lum = (c: string) => {
    const [r, g, b] = (c.match(/[\d.]+/g) ?? [])
      .slice(0, 3)
      .map(Number)
      .map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (fg: string, bg: string) => {
    const l1 = lum(fg);
    const l2 = lum(bg);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };
  return selectors.map(([sel, label]) => {
    const el = document.querySelector(sel);
    if (!el) return { label, missing: true };
    const s = getComputedStyle(el);
    // 투명 배경이면 실제로 칠해진 조상까지 올라간다
    let bg = s.backgroundColor;
    let node: Element = el;
    while (bg === "rgba(0, 0, 0, 0)" && node.parentElement) {
      node = node.parentElement;
      bg = getComputedStyle(node).backgroundColor;
    }
    return {
      label,
      ratio: Math.round(ratio(s.color, bg) * 100) / 100,
      fg: s.color,
      bg,
    };
  });
}

// 코드 색칠 네 갈래를 한 글에서 전부 보려면 언어별 요소가 다 있어야 한다.
const CODE_SAMPLE = [
  "// 주석 한 줄",
  "const name: string = 'value';",
  "function run(arg) { return arg; }",
].join("\n");

const TARGETS: [string, string][] = [
  [".prose-stella p", "본문"],
  [".prose-stella h2", "제목"],
  [".hljs-keyword", "코드 키워드"],
  [".hljs-string", "코드 문자열"],
  [".hljs-comment", "코드 주석"],
  [".hljs-title", "코드 이름"],
];

for (const scheme of ["light", "dark"] as const) {
  test(`대비가 WCAG AA를 넘는다 — ${scheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    expect(
      (
        await page.request.post("/api/auth/login", {
          data: { password: "stella-dev" },
        })
      ).ok(),
    ).toBe(true);

    let id: string | undefined;
    try {
      const res = await page.request.post("/api/posts", {
        data: {
          title: `E2E 대비 ${scheme}`,
          tags: [],
          status: "published",
          body: {
            type: "doc",
            content: [
              {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "소제목" }],
              },
              {
                type: "paragraph",
                content: [{ type: "text", text: "본문 문장." }],
              },
              {
                type: "codeBlock",
                attrs: { language: "ts" },
                content: [{ type: "text", text: CODE_SAMPLE }],
              },
            ],
          },
        },
      });
      expect(res.status()).toBe(201);
      const post = (await res.json()) as { id: string; slug: string };
      id = post.id;

      await page.goto(`/blog/${encodeURIComponent(post.slug)}`);
      const rows = await page.evaluate(measureContrast, TARGETS);

      // 선택자가 안 잡히면 검사가 조용히 통과해버린다 — 그걸 먼저 막는다
      const missing = rows.filter((r) => r.missing).map((r) => r.label);
      expect(missing, `측정 대상이 없다: ${missing.join(", ")}`).toEqual([]);

      const failed = rows
        .filter((r) => (r.ratio ?? 0) < MIN_CONTRAST)
        .map((r) => `${r.label} ${r.ratio}:1 (fg=${r.fg} bg=${r.bg})`);
      expect(failed, `대비 미달: ${failed.join(" / ")}`).toEqual([]);
    } finally {
      if (id) await page.request.delete(`/api/posts/${id}`);
    }
  });
}

test("좁은 화면에서 페이지가 가로로 넘치지 않는다", async ({ page }) => {
  // 표·코드블록은 자기 안에서 스크롤되어야 하고, 페이지 자체는 넘치면 안 된다.
  await page.setViewportSize({ width: 360, height: 640 });
  for (const path of ["/", "/blog", "/guestbook"]) {
    await page.goto(path);
    const { doc, client } = await page.evaluate(() => ({
      doc: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(doc, `${path}가 가로로 넘친다`).toBeLessThanOrEqual(client + 1);
  }
});
