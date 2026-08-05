# srs9 — Build Roadmap

Personal site — **blog-forward**, with a job-search résumé to grow into. Build
one stage at a time, **visible results first**. Defer setup/infra until the
stage that needs it.

---

## Decisions (locked)

| Topic | Decision |
|---|---|
| **Primary goal** | A working custom blog — the full-stack **proof piece** for job search; grow the home into a résumé/portfolio landing once content fills. |
| **Stack** | Next.js 16 (App Router), package manager **pnpm** |
| **Domain** | **Single domain** (srs9.com), section routes — **no subdomains**. Replaces the earlier dev./me. two-subdomain plan. |
| **Blog** | **Custom CMS (DB-based)** ⭐ — log in, write in the browser, upload images, publish. Posts in D1, images in R2. **Comments + threaded replies** on posts. |
| **Editor** | **WYSIWYG (Tiptap v3)** — body stored as **Tiptap JSON**. Owner-only. Admin routes **`/stella`** (dashboard) + `/stella/write` (editor). |
| **Comments / Guestbook** | **Anonymous nickname + password** (Tistory-style): anyone posts with a nickname + password, and that password edits/deletes their own entry. Owner moderates (delete any). Post *writing* stays owner-only. |
| **Deploy** | Cloudflare (Workers + D1 + R2). Migrate to AWS *later* as an infra-learning project. |
| **Design** | "Clean + accent" — minimal/literary (ref: volver.tistory.com), top nav (no sidebar), muted tones with 별·흐름·9 motif accents. **Wider reading max-width** than the reference (readability). |
| **Font** | Noto Sans KR for body (Korean readability) |
| **Content** | ~100 Velog posts → **curate, do not bulk-migrate.** Bring over the 10–20 strongest first. |
| **Privacy** | Contact info (GitHub/Email/LinkedIn) injected via `.env.local` — never in chat or git |

### Site structure — single domain, section routes

```
srs9.com
  /              main — 소개 랜딩. 나중에 이력서/포트폴리오로 확장.
  /blog          글 목록 (태그 필터)
  /blog/[slug]   글 상세 + 댓글/답글
  /guestbook     방명록 (익명 닉네임+비밀번호)
  /stella        대시보드 — 글 관리 (로그인, 소유자 전용)
  /stella/write  작성 (WYSIWYG 에디터)

Shared:  design system · CMS · D1 · R2 (images) · auth
Data:    post (Tiptap JSON body · tags · status) · comment (threaded) · guestbook entry
Local:   localhost:3001
```

See `docs/CONVENTIONS.md` for coding conventions.

---

## Stages

### ✅ 0. Scaffold
- [x] `create-next-app` (TS, Tailwind v4, App Router, pnpm)
- [x] Lowercase directory `srs9`

### ✅ 1. Foundation UI
- [x] Root layout — fonts, metadata, design tokens (light/dark)
- [x] `RootHeader` / `RootFooter` (contact via env)
- [x] Component structure by UI kind; conventions documented
> The original dev./me. two-subdomain layout (proxy host-routing, `SubdomainLink`,
> me interests feed, dev single-page home, `StarRiver`) is **superseded by Stage 2**.
> Design system / tokens / fonts / header-footer carry over.

### ✅ 2. Restructure → single domain
> Pivot 2026-07-20: dropped the dev/me subdomain split and the personal-interests
> feed. Single-domain, blog-forward. Route group `app/(site)` holds chrome
> (header/footer); `/stella` opts out.
- [x] Removed proxy host-routing + `SubdomainLink`; collapsed `app/dev` + `app/me` into `app/(site)`
- [x] Top nav = srs9(logo→/) · Blog · Guestbook (no sidebar; volver.tistory feel)
- [x] `/` intro landing · `/blog` list · `/blog/[slug]` detail · `/guestbook` placeholder
- [x] Trimmed `lib/site.ts` (dropped `SiteKey`, `sites`, `interestTags`); `e2e/nav.spec.ts` added

### ⬜ 3. Blog CMS ⭐ (full-stack proof)
> Build in slices. Editor first (done), then real persistence + CRUD, then read
> side (go live), then comments, then auth.

**3a. Editor UI ⭐ (writing experience — no infra yet)**
- [x] `/stella` WYSIWYG editor — Tiptap v3, body stored as **Tiptap JSON**
- [x] Formatting: bold · italic · underline · strike, H1–4, code, **blockquote + custom callout**, link, image, text-color, highlight
- [x] Input rules (`**`, `==`, `# `) + shortcuts (`Cmd+B`) + toolbar buttons — all work
- [x] Temporary save (localStorage + JSON output) — DB/auth deferred to 3c
- Structure: `app/stella/`, `components/editor/` (PostEditor · Toolbar · ColorPicker), `lib/editor/` (extensions · callout)

**3a progress** (updated 2026-06-08)
- [x] **Step 1** — `/stella` route scaffold (`app/stella/layout.tsx` + `page.tsx`) + proxy bypass so `/stella` is served on any host (shared, exempt from dev/me rewrite). Verified on dev & me hosts; existing `/` routing intact.
- [x] **Step 2** — Tiptap v3 (`@tiptap/react` · `@tiptap/pm` · `@tiptap/starter-kit` · `@tiptap/extensions`). Base editor in `app/stella/page.tsx` (`"use client"`, `immediatelyRender: false`); shared extension list in `lib/editor/extensions.ts` (StarterKit + Placeholder). Min editor styles in `globals.css`. Fixed Turbopack workspace-root inference via `next.config.ts` `turbopack.root` (parent `package-lock.json`). e2e harness added (`@playwright/test`, `playwright.config.ts`, `e2e/stella.spec.ts`) — 4 passing: render / placeholder / typing / markdown input rules.
- [x] **Step 3** — 상단 고정 Toolbar. `components/editor/Toolbar.tsx`(bold·italic·underline·strike·code, H1–4, blockquote, link) + `PostEditor.tsx`로 에디터/툴바 조합 추출; `page.tsx`는 PostEditor만 렌더. StarterKit v3에 Underline·Link가 이미 포함됨을 확인(별도 익스텐션 불필요). active 강조는 `useEditorState`로 구독, 버튼 `onMouseDown` preventDefault로 선택 유지, 링크는 prompt 토글. e2e 4개 추가(툴바 렌더 / 굵게 적용+active / H2 / 링크) — 총 8개 통과.
- [x] **Route split** (2026-06-10) — editor moved `/stella` → **`/stella/write`** (`git mv`); `/stella` is now the **dashboard** (entry point). proxy bypasses `/stella` + all children on any host. Toolbar icon buttons split visible glyph (B/I/U/…) from descriptive `aria-label` (굵게/기울임/…). e2e repointed + dev/me host-serving + dashboard nav tests, all Given/When/Then — 14 passing.
- [x] **Step 4** (2026-06-11) — image + custom callout. Image via `@tiptap/extension-image` (`inline:false`); toolbar 🖼 button prompts for a URL and inserts it (real R2 upload deferred to 3c). Callout is a custom Node in `lib/editor/callout.ts` (`group:block` / `content:block+` / `defining`, `toggleCallout` = `toggleWrap`); added `@tiptap/core` as a direct dep so the command type can be augmented via `declare module "@tiptap/core"`. The star (✦) marker is drawn with `aside[data-callout]::before` CSS (kept out of the serialized HTML), with a left accent bar + surface background. Toolbar ✦ button subscribes to active state via `useEditorState`. 3 e2e added (image insert / callout wrap+active / typing inside callout) — 16 total (+1 subdomain = 17) passing.
- [x] **Step 5** (2026-07-09) — text color + highlight. `@tiptap/extension-text-style` (TextStyle + Color, stored as inline `style` in Tiptap JSON) and `@tiptap/extension-highlight` (single-color `<mark>`, `==text==` input rule), both pinned to 3.26.0 to match core. `components/editor/ColorPicker.tsx` — 5-swatch palette + reset, outside-click close, selection preserved via `onMouseDown` preventDefault; hex values are content data, not UI tokens (noted in comment). `<mark>` styled via new `--highlight` token (translucent in dark mode to keep contrast). Toolbar 🖍 button with active state. 3 e2e added (highlight apply+active / `==` input rule / palette color apply) — 20 total passing.
- [x] **Step 6** (2026-07-09) — title + temp save. Borderless title input above the toolbar (Enter moves focus to the body, no newline in title). Draft (`{title, content: Tiptap JSON, savedAt}`) auto-saved to localStorage (`stella:draft`) 0.5s debounced on any change; restored on load — body via `onCreate` (client-only, no hydration mismatch), title via mount effect. "임시저장 HH:MM" indicator next to the title. DB persistence replaces this in 3c. 2 e2e added (reload restore / Enter focus handoff — waits for `.ProseMirror` focus since the handoff is async) — 22 total passing.
- [x] **Step 7** (2026-07-09) — body typography. `.prose-stella` now carries the full reading typography (headings h1-h4 one step below the page title, quiet gray blockquote vs accent callout, surface-toned inline code + code blocks, lists, accent links, image margins) and is shared with the read side (3b) — editor-only rules (placeholder, selected-node outline) keep the `.ProseMirror` scope. `---` divider renders as a single ✦ (brand motif) instead of a line. Syntax highlighting deferred to 3b. **3a complete** — 22 e2e passing.

**3b. Backend, CRUD & comments ⭐** — done 2026-07-20 (3c R2 pending)
> Order: DB → write/CRUD → read (go live) → comments → auth. Local D1 via OpenNext
> (`getCloudflareContext` + `initOpenNextCloudflareForDev`) + Drizzle; migrations
> applied with `wrangler d1 migrations apply --local`. **24 e2e passing.**

**3b-1. D1 + Drizzle** ✅
- [x] Post schema (`lib/db/schema.ts`: slug·title·body=Tiptap JSON·tags·date·status; no `scope`)
- [x] Local D1 (`wrangler.jsonc` `DB` binding) + `getDb()` (`lib/db/index.ts`); `db:generate` / `db:migrate:local` scripts

**3b-2. Write / CRUD** ✅
- [x] Post CRUD Route Handlers (`app/api/posts`) — create / update / delete
- [x] Editor 저장·발행 wired (`PostEditor`), draft/publish; `?id=` edit-load
- [x] `/stella` dashboard lists posts with edit · delete (`DeletePostButton`)

**3b-3. Read side (go live)** ✅
- [x] Render pipeline — Tiptap JSON → HTML (`components/post/PostBody.tsx`, recursive RSC, reuse `.prose-stella`)
- [x] `/blog` lists published posts + `?tag=` filter; `/blog/[slug]` detail (NFC slug normalize for 한글)

**3b-4. Comments + replies** ✅
- [x] Comment schema (postId·parentId·nickname·passwordHash·body·createdAt); Web Crypto PBKDF2 hash
- [x] Anonymous nickname+password: create; delete via password; owner deletes any
- [x] Threaded (1-level) render under each post (`CommentSection` / `CommentThread` / `CommentForm`)

**3b-5. Auth** ✅
- [x] Single-admin login (env `STELLA_PASSWORD`, HMAC-signed cookie); `/stella` + write/moderation endpoints guarded

**3c. Image upload → R2** ✅ — done 2026-07-20
- [x] `POST /api/upload` (owner-only) → R2 `env.BUCKET`; `GET /api/media/[key]` 서빙; 에디터 🖼 = 파일선택 업로드
- [x] 로컬은 miniflare R2 에뮬레이션(계정 불필요); 배포 때 실제 버킷 바인딩. 렌더러(`PostBody`)는 URL만 다뤄 수정 불필요

### ✅ 4. Guestbook — done 2026-07-20
- [x] `/guestbook` — anonymous nickname+password entries (own `guestbook` table, reuses `lib/auth/password`)
- [x] Owner reply (authenticated, `isOwner=true`, no password) + owner moderation (delete any)
- [x] `GuestbookBoard` client component; `e2e/guestbook.spec.ts` (익명 작성 / 소유자 답글·삭제)
> e2e now runs **serial** (`workers: 1`) — multiple specs share one local D1 (SQLite); concurrent writers caused flaky empty reads.

### ⬜ 5. Résumé / portfolio (main expansion)
> Deferred until blog content fills; then `/` grows from blog home → résumé landing.
- [ ] Experience section (real career material — provided by Claire)
- [ ] Projects section (role · stack · outcome · links)

### ✅ 6. Velog curation & migration — 19편 published, done 2026-08-04
- [x] Collect — Velog has no bulk export; its public GraphQL (`v2.velog.io/graphql`) paginates by `cursor` and returns the raw markdown `body`. All 90 posts collected, cached under `scripts/`
- [x] Curation — kept 2024-07-11 이후 19편 (실무 글 구간). 71편 제외: 2023년~2024 상반기는 부트캠프 학습 기록 비중이 큼
- [x] MD → Tiptap JSON — `generateJSON` ships in the installed `@tiptap/core` but needs a DOM, and the app's extension set is TS. Solved by piping HTML through the real editor in a browser (`scripts/import-velog.mjs`): it lands in the same schema the renderer knows, so no unrenderable nodes slip in
- [x] Images — 50 velcdn images moved to R2 (`/api/media/…`, all serving 200); 4 third-party links (Tenor·Giphy·Pinterest) left pointing at their origin rather than re-hosting someone else's asset
- [x] Original slug + published date preserved (`PostInput.slug`/`date`); all 19 verified against source
- [x] Published — 백업 이관이라 원본 그대로 공개 상태. 대시보드도 `updatedAt` 대신 발행일 기준으로 표시·정렬(이관 글은 수정 시각이 전부 이관일이라 쓸모가 없음)
- [x] 태그 정리 — 빈 3편 채움(`backend` / `frontend`+`architecture` / `setup`). 태그 표기는 영어로 통일: 시리즈 두 편이 Velog에서 영어·한글로 갈려 있어 `빌드`→`build`, `프론트엔드`→`frontend`로 합침(`최적화`는 짝이 없어 한글 유지). 17종
- [ ] (Remaining 71편 — later pass, if ever)
> Table support (Stage 6 선행) — 2편에 비교표가 있어 `TableKit` + renderer/CSS 추가.
> Re-running the tool is safe: existing slugs are skipped and uploaded images are cached.
> e2e가 만든 발행글이 로컬 D1에 쌓여 실제 목록에 섞였다 — `blog.spec.ts`가 뒷정리하도록 고침.

### ⬜ 7. (optional) View counter
- [ ] Lightweight per-post view count via D1

### ⬜ 8. Polish
- [x] Code block syntax highlighting — done 2026-08-04. `highlight.js/lib/common`을 서버(PostBody는 RSC)에서 돌려 색칠된 마크업을 내보낸다 → 클라 JS 0. shiki 대신 고른 이유: async라 동기 재귀 렌더러를 바꿔야 했다. hljs 기본 테마는 안 쓰고 클래스에 사이트 팔레트를 매핑(색은 키워드·문자열·주석·이름 네 갈래, 다크모드 별도). 이관 글의 코드블록 130개 중 언어가 붙은 107개가 대상
- [x] Scroll animation — done 2026-08-05. `.reveal` 클래스가 CSS 스크롤 타임라인(`animation-timeline: view()`)으로 기존 `fade-up` 키프레임을 재생 → JS 0, 서버 컴포넌트 그대로. `/blog` 목록 카드에만 적용(긴 본문은 애니메이션이 읽기를 방해해서 제외). 시작 상태(`opacity: 0`)를 `@supports` 안에만 두는 게 핵심 — 미지원 브라우저에서 이걸 빼면 콘텐츠가 영구히 안 보인다. `prefers-reduced-motion: reduce`면 규칙 자체가 적용되지 않음
  > e2e에서 만든 글은 `finally`로 지운다 — 실패 시 뒷정리에 도달하지 못해 로컬 D1에 24편이 쌓였다.
  > 스크롤 측정은 `behavior: "instant"` — `html`에 `scroll-behavior: smooth`가 걸려 있어 기본값으로는 이동 전에 측정된다.
- [x] Metadata / OG images / sitemap / robots — done 2026-08-05
  - `metadataBase`(기본 `https://srs9.com`, `NEXT_PUBLIC_SITE_URL`로 덮어쓰기) — 공유 카드 이미지는 절대 주소여야 외부 서비스가 읽는다
  - 제목·설명·OG·Twitter 기본값은 **루트 레이아웃 한 곳**. `(site)/layout.tsx`에도 title 템플릿이 있어 홈 제목이 `srs9 · srs9`가 됐다 → 중복 제거
  - 글 상세: 제목·발췌(160자)·발행일·태그·canonical. 자체 `openGraph`를 정의하면 파일 기반 이미지가 자동으로 안 붙어서 `parent`의 images를 물려받는다(공식 패턴)
  - `getPublishedPostBySlug`를 React `cache`로 — `generateMetadata`와 본문이 같은 글을 두 번 읽고 있었다
  - `app/sitemap.ts`(발행글만, 한글 slug 인코딩) · `app/robots.ts`(`/stella`·`/api` 제외)
  - 이미지 자산은 Claire 제작: `opengraph-image.png`(1200×630) · `favicon.ico`(16·32·48) · `icon.svg` · `apple-icon.png`(180) · alt 텍스트
  - `e2e/meta.spec.ts` — 태그는 화면에 안 보여서 눈으로 못 잡는다. 위 두 실수(제목 중복·og:image 누락)를 여기서 막는다
  - 글별 동적 OG 이미지는 보류: 글자 그리는 엔진이 폰트를 내장하지 않아 한글 폰트를 매 요청 읽어야 하고, Workers에서 되는지 확인하려면 `open-next.config.ts`(Stage 9)가 먼저 필요하다
- [x] Responsive pass, dark mode finish — done 2026-08-05
  - 반응형은 손댈 게 없었다: 360·768·1280에서 홈·목록·글(표+코드)·방명록 모두 가로 넘침 0. 표·코드블록은 자기 컨테이너에서 스크롤된다
  - 색은 전부 토큰 사용(하드코딩 없음). `ColorPicker`의 hex 5개는 사용자가 본문에 고르는 팔레트라 예외
  - **코드 주석 색이 WCAG AA 미달이었다** — 라이트 2.67:1 / 다크 3.51:1. `#6b6b6b`·`#8a8a94`로 고쳐 5.1:1·5.4:1. 주석은 이탤릭이라 여유를 뒀다
  - `e2e/a11y.spec.ts` — 본문·제목·코드 4갈래 대비를 라이트/다크 양쪽에서 재고, 360px 가로 넘침을 확인. 선택자가 안 잡히면 조용히 통과하는 것도 막는다
  > dev 서버가 CSS 변경을 부분만 반영한 적이 있다(라이트는 새 값, 다크는 옛 값). 색 수치가 안 맞으면 서버 재시작부터.
- [x] Accessibility (a11y), performance — done 2026-08-05
  - 진단 결과 이미 정상이던 것: 랜드마크(header·main·footer), 페이지마다 h1 1개, 헤딩 순서 건너뜀 0, 라벨 없는 입력 0, 이름 없는 링크 0, `lang="ko"`
  - **본문 이미지에 width·height가 없어 로드될 때 본문이 밀렸다(CLS)** → 렌더러가 크기·`loading="lazy"`·`decoding="async"`를 내보내고, 이관 도구 `--fix-dims`로 기존 14편 52개 이미지에 크기를 기록(브라우저에 띄워 실측). 에디터 업로드도 파일 크기를 재서 함께 저장 — 안 그러면 새 글마다 보정을 다시 돌려야 한다
  - `--fix-dims`는 PUT을 쓰므로 slug·발행일을 건드리지 않고 태그도 그대로 넘겨 유지한다
  - 새 글의 이미지 alt는 **파일명에서 만든다**(확장자 제거, `-`·`_`→공백). 파일명이 무의미하면 alt도 무의미해지는 건 감수 — Claire 결정
  - 남은 것: **이관 글 이미지 alt 53개가 빈 값** — Velog가 업로드 때 파일명을 `image.png`로 통일해서 파일명 전략이 통하지 않고, 원본 md에도 alt가 2개뿐이었다. 채우려면 이미지를 보고 직접 쓸 수밖에 없다
  - 남은 것: **alt 수정 UI** — 이미지를 눌러 alt를 고치는 기능. 위 53개를 채우려면 필요하다. 나중에 판단하기로 함
- [ ] Prettier config + format-on-save

### ⬜ 9. Deploy (Cloudflare)
- [ ] `wrangler.jsonc`, `open-next.config.ts`, `next.config.ts` setup
- [ ] Register env (contact) + D1 + R2 bindings in Cloudflare dashboard
- [ ] Connect single custom domain (srs9.com)
- [ ] Ship → portfolio URL

---

## Later / tech debt
- [ ] API 클라이언트 유틸 (`lib/api.ts`) — fetch/axios 래퍼로 라우트 호출 DRY (지금 `PostEditor`·`CommentForm`·`CommentThread`·`DeletePostButton`·`LogoutButton`·login이 각자 raw `fetch`)
- [ ] 타입 정리 — 흩어진 타입(`PostInput`·`InitialPost`·`PublicComment`·렌더러 Mark 등) 공용 모듈로 정돈

## Pending decisions / TODO (Claire)
- [ ] Career material for the résumé/portfolio expansion (Stage 5 — experience, projects)
