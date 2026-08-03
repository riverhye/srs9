/* eslint-disable no-console -- CLI 도구라 진행 상황 출력이 본질 */
// Velog → srs9 이관 도구 (일회성, 배포 때 프로덕션 DB에 한 번 더 돌린다).
//
// 흐름: Velog 공개 GraphQL로 글 수집 → 이미지를 R2로 이전 → 마크다운을 HTML로 →
//       실제 에디터(브라우저)에 흘려 Tiptap JSON을 얻음 → 초안으로 저장.
//
// 에디터를 거치는 이유: 변환 함수(generateJSON)는 DOM이 필요하고, 앱이 쓰는
// 확장 집합(표·callout·형광펜)과 똑같은 규칙으로 파싱해야 화면에서 못 그리는
// 노드가 섞이지 않는다. 에디터는 새 글일 때 localStorage 초안을 setContent로
// 복원하므로, 그 자리에 HTML을 심어 파싱을 태운다.
//
// 사용법:
//   pnpm dev  (다른 터미널에서 먼저 띄운다)
//   node scripts/import-velog.mjs --probe        변환 결과만 출력(저장 안 함)
//   node scripts/import-velog.mjs --limit 1      1편만 실제 저장
//   node scripts/import-velog.mjs                대상 전체 저장
import { readFile, writeFile } from "node:fs/promises";

import { chromium } from "@playwright/test";
import { marked } from "marked";

const BASE = process.env.BASE_URL ?? "http://localhost:3001";
const PASSWORD = process.env.STELLA_PASSWORD ?? "stella-dev";
const USERNAME = "riverhye";
const SINCE = "2024-07-11"; // 이 날짜 이후 발행 글만
const CACHE = "scripts/.velog-cache.json";
const IMAGE_MAP = "scripts/.velog-images.json"; // 원본 URL → R2 주소(재실행 때 재사용)
const DRAFT_KEY = "stella:draft";
// 이 호스트의 이미지만 R2로 옮긴다. 나머지(Tenor·Giphy 등)는 남의 서버라 링크 유지.
const OWN_IMAGE_HOST = "velog.velcdn.com";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36";

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const value = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

// --- 1. 수집 ---

const QUERY = `query($u:String,$c:ID,$l:Int){posts(username:$u,cursor:$c,limit:$l){
  id title url_slug released_at tags body}}`;

async function fetchAllPosts() {
  const out = [];
  let cursor = null;
  for (;;) {
    const res = await fetch("https://v2.velog.io/graphql", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        query: QUERY,
        variables: { u: USERNAME, c: cursor, l: 50 },
      }),
    });
    const json = await res.json();
    if (json.errors) throw new Error(JSON.stringify(json.errors));
    const batch = json.data.posts;
    if (!batch.length) return out;
    out.push(...batch);
    cursor = batch.at(-1).id; // 이어받기 표식 — 없으면 최근 몇 개만 온다
  }
}

// 받아둔 결과가 있으면 재사용한다(재실행 때 Velog를 다시 긁지 않게).
async function loadPosts() {
  try {
    const cached = JSON.parse(await readFile(CACHE, "utf8"));
    console.log(`  캐시 사용: ${cached.length}편 (${CACHE})`);
    return cached;
  } catch {
    const all = await fetchAllPosts();
    await writeFile(CACHE, JSON.stringify(all, null, 1));
    console.log(`  Velog에서 ${all.length}편 수집 → ${CACHE}`);
    return all;
  }
}

// --- 2. 이미지 이전 ---

// 마크다운 문법과 <img src> 두 형태 모두 찾는다(둘 다 실제로 쓰였다).
function imageUrls(md) {
  const urls = [
    ...md.matchAll(/!\[[^\]]*\]\(\s*([^)\s]+)/g),
    ...md.matchAll(/<img[^>]+src=["']([^"']+)/g),
  ].map((m) => m[1]);
  return [...new Set(urls)];
}

// Velog 저장소 이미지를 내려받아 이 사이트 업로드 창구로 올리고 새 주소를 준다.
// velcdn은 HEAD를 거부하고 브라우저 표시가 없으면 403이라 UA를 붙인다.
async function migrateImages(md, request, seen) {
  let out = md;
  let moved = 0;
  for (const url of imageUrls(md)) {
    if (!url.includes(OWN_IMAGE_HOST)) continue; // 외부 링크는 그대로
    if (!seen.has(url)) {
      const res = await fetch(url, { headers: { "user-agent": UA } });
      if (!res.ok) {
        console.warn(`    ! 이미지 내려받기 실패 ${res.status}: ${url}`);
        continue;
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      const type = res.headers.get("content-type") ?? "image/png";
      const name = url.split("/").pop()?.split("?")[0] || "image.png";
      const up = await request.post(`${BASE}/api/upload`, {
        multipart: { file: { name, mimeType: type, buffer } },
      });
      if (!up.ok()) {
        console.warn(`    ! 업로드 실패 ${up.status()}: ${url}`);
        continue;
      }
      seen.set(url, (await up.json()).url);
      moved++;
    }
    out = out.split(url).join(seen.get(url));
  }
  return { md: out, moved };
}

// 이미 올린 이미지는 다시 올리지 않는다(probe를 여러 번 돌려도 R2가 안 불어남).
async function loadImageMap() {
  try {
    return new Map(
      Object.entries(JSON.parse(await readFile(IMAGE_MAP, "utf8"))),
    );
  } catch {
    return new Map();
  }
}

async function saveImageMap(map) {
  await writeFile(IMAGE_MAP, JSON.stringify(Object.fromEntries(map), null, 1));
}

// --- 3. 변환 ---

// 마크다운 → HTML. gfm으로 표·취소선을 살린다.
function toHtml(md) {
  return marked.parse(md, { gfm: true, breaks: false, async: false });
}

// HTML → Tiptap JSON. 에디터의 초안 복원 경로에 HTML을 심어 파싱시키고,
// 자동저장이 되돌려 놓은 JSON을 꺼낸다.
async function toTiptapJson(page, html) {
  // localStorage는 오리진이 있어야 접근되므로 페이지를 먼저 띄운다.
  if (!page.url().startsWith(`${BASE}/stella/write`)) {
    await page.goto(`${BASE}/stella/write`);
  }
  await page.evaluate(
    ([key, content]) => {
      localStorage.setItem(
        key,
        JSON.stringify({ title: "", content, savedAt: Date.now() }),
      );
    },
    [DRAFT_KEY, html],
  );
  await page.reload(); // onCreate가 심어둔 초안을 setContent로 흘려준다
  await page.waitForSelector(".ProseMirror");
  // 자동저장은 debounce라 JSON으로 덮이기를 기다린다. 편집을 한 번 일으켜
  // onUpdate를 확실히 트리거한다(setContent만으로는 안 붙는 경우가 있다).
  await page.locator(".ProseMirror").click();
  await page.keyboard.press("End");
  await page.keyboard.type(" ");
  await page.keyboard.press("Backspace");
  const json = await page.waitForFunction(
    (key) => {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const draft = JSON.parse(raw);
      return typeof draft.content === "object" ? draft.content : null;
    },
    DRAFT_KEY,
    { timeout: 15_000 },
  );
  const content = await json.jsonValue();
  await page.evaluate((key) => localStorage.removeItem(key), DRAFT_KEY);
  return content;
}

// 본문에서 사라진 덩어리를 눈치채기 위한 대략적 지표.
function summarize(doc) {
  const count = {};
  let chars = 0;
  const walk = (n) => {
    count[n.type] = (count[n.type] ?? 0) + 1;
    if (n.type === "text") chars += (n.text ?? "").length;
    n.content?.forEach(walk);
  };
  doc.content?.forEach(walk);
  return { count, chars };
}

// 마크다운에서 문법 기호를 걷어낸 대략적 본문 글자수 — 변환 전후 비교용.
function plainLength(md) {
  return md
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/```\w*\n?|```/g, ""))
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/[#>*_`|~\-]/g, "")
    .replace(/\s+/g, "").length;
}

// --- 실행 ---

const only = value("--slug", null); // 한 편만 다룰 때(확인용)
const posts = (await loadPosts())
  .filter((p) => p.released_at.slice(0, 10) >= SINCE)
  .filter((p) => !only || p.url_slug === only)
  .sort((a, b) => a.released_at.localeCompare(b.released_at));
const limit = Number(value("--limit", posts.length));
const targets = posts.slice(0, limit);
console.log(`대상 ${targets.length}편 (전체 ${posts.length}편 중)\n`);

const browser = await chromium.launch();
const context = await browser.newContext({ baseURL: BASE });
const page = await context.newPage();

const login = await context.request.post(`${BASE}/api/auth/login`, {
  data: { password: PASSWORD },
});
if (!login.ok()) {
  await browser.close();
  throw new Error(`로그인 실패 ${login.status()} — dev 서버와 비밀번호 확인`);
}

const uploaded = await loadImageMap(); // 같은 이미지는 한 번만 올린다
const done = [];
const skipped = [];
const lossy = []; // 변환 후 본문이 크게 줄어든 글 — 사람이 봐야 한다

// 이미 들어간 글은 건너뛴다 — slug는 유일해야 하므로 그대로 저장하면 -2가 붙어
// 같은 글이 두 개 생긴다. 초안까지 보려면 소유자 목록을 쓴다.
const existing = new Set(
  ((await (await context.request.get(`${BASE}/api/posts`)).json()) ?? []).map(
    (p) => p.slug,
  ),
);

for (const [i, post] of targets.entries()) {
  const date = post.released_at.slice(0, 10);
  console.log(`[${i + 1}/${targets.length}] ${date} ${post.title}`);

  if (existing.has(post.url_slug) && !flag("--probe")) {
    console.log("    이미 있음 — 건너뜀");
    skipped.push(`${post.title} (이미 있음)`);
    continue;
  }

  const { md, moved } = await migrateImages(
    post.body ?? "",
    context.request,
    uploaded,
  );
  if (moved) {
    console.log(`    이미지 ${moved}개 이전`);
    await saveImageMap(uploaded); // 중간에 끊겨도 올린 것은 잃지 않게
  }

  const doc = await toTiptapJson(page, toHtml(md));
  const { count, chars } = summarize(doc);
  const before = plainLength(md);
  const kept = before ? Math.round((chars / before) * 100) : 100;
  console.log(`    노드: ${JSON.stringify(count)}`);
  console.log(`    글자: ${before} → ${chars} (${kept}%)`);
  if (kept < 90) {
    lossy.push(`${post.title} — 글자 ${kept}%만 남음`);
    console.log("    ! 손실 의심");
  }

  if (flag("--probe")) continue;

  const res = await context.request.post(`${BASE}/api/posts`, {
    data: {
      title: post.title,
      body: doc,
      tags: post.tags ?? [],
      // Velog 백업이라 원본 그대로 공개 상태로 들어간다(발행일도 원본 유지).
      status: "published",
      slug: post.url_slug,
      date,
    },
  });
  if (res.status() === 201) {
    const saved = await res.json();
    // 지정한 slug가 그대로 쓰였는지 — 중복이면 -2가 붙는다
    if (saved.slug !== post.url_slug) {
      skipped.push(`${post.title} (주소 충돌 → ${saved.slug})`);
    }
    done.push(saved.slug);
  } else {
    skipped.push(`${post.title} (저장 실패 ${res.status()})`);
  }
}

await browser.close();

await saveImageMap(uploaded);
console.log(`\n저장 ${done.length}편 · 이미지 ${uploaded.size}개 이전`);
if (skipped.length) {
  console.log("건너뜀:");
  skipped.forEach((s) => console.log(`  - ${s}`));
}
if (lossy.length) {
  console.log("본문 손실 의심 — 직접 확인:");
  lossy.forEach((s) => console.log(`  - ${s}`));
}
