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

### ⬜ 6. Velog curation & migration
- [ ] Collect Velog posts → classify by topic → prioritize by "job-search signal" → pick 10–20
- [ ] Import into CMS — Velog exports **markdown**, CMS stores **Tiptap JSON** → needs an MD → Tiptap JSON conversion step
- [ ] (Defer the rest to a later pass)

### ⬜ 7. (optional) View counter
- [ ] Lightweight per-post view count via D1

### ⬜ 8. Polish
- [ ] Code block syntax highlighting (deferred from 3b-3)
- [ ] Scroll animation / smoother section transitions
- [ ] Metadata / OG images / sitemap / robots
- [ ] Responsive pass, dark mode finish
- [ ] Accessibility (a11y), SEO, performance (Core Web Vitals)
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
