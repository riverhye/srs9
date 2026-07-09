# srs9 — Build Roadmap

Personal site (branding + job search). Build one stage at a time, **visible
results first**. Defer setup/infra until the stage that needs it.

---

## Decisions (locked)

| Topic | Decision |
|---|---|
| **Primary goal** | Polish résumé / portfolio as a developer (branding is secondary) |
| **Stack** | Next.js 16 (App Router), package manager **pnpm** |
| **Blog** | **Custom CMS (DB-based)** ⭐ — log in, write in the browser, upload images, publish. Posts in D1, images in R2. This is the full-stack proof piece. |
| **Editor** | **WYSIWYG (Tiptap v3)** — Notion-style; `**`/buttons/shortcuts all work. Body stored as **Tiptap JSON**. **Build the editor UI first** (before DB/auth) as the core authoring experience. Admin route is **`/stella`** (shared, owner only). |
| **Deploy** | Cloudflare (Workers + D1 + R2). Migrate to AWS *later* as an infra-learning project. |
| **Design** | "Clean + accent" — Brunch-like base with 별·흐름·9 motif accents |
| **Font** | Noto Sans KR for body (Korean readability) |
| **Content** | ~100 Velog posts → **curate, do not bulk-migrate.** Bring over the 10–20 strongest first. |
| **Privacy** | Contact info (GitHub/Email/LinkedIn) injected via `.env.local` — never in chat or git |

### Site structure — 2 subdomains, 1 codebase

```
srs9.com (apex) ──redirect──▶ dev.srs9.com   (root = professional, job search first)

dev.srs9.com  ── résumé / portfolio (single-page scroll)
  /            Hero → #experience → #projects   (nav = anchors)

me.srs9.com   ── personal interests
  /            Hero + one feed
  filter chips: [all] essay · book · movie · exhibition   (category = tag)
  /[slug]      post detail (stage 3)

/stella        dashboard — manage posts (login, owner only) — shared
/stella/write  author (WYSIWYG editor) — shared

Implementation: one Next app + proxy host routing (dev.*→/dev, me.*→/me)
Shared:         design system · CMS · D1 (posts) · R2 (images) · auth
Posts:          stored in D1 with scope (dev|me) + tags, served per host
Local:          dev.localhost:3001 / me.localhost:3001
```

See `docs/CONVENTIONS.md` for coding conventions.

---

## Stages

### ✅ 0. Scaffold
- [x] `create-next-app` (TS, Tailwind v4, App Router, pnpm)
- [x] Lowercase directory `srs9`

### ✅ 1. Foundation UI
- [x] Root layout — fonts, metadata, design tokens (light/dark)
- [x] Host routing proxy (`proxy.ts`; apex → dev; dev.*→/dev; me.*→/me)
- [x] `RootHeader` / `RootFooter` (contact via env)
- [x] dev home (single-page scroll) + me home (feed + filter chips)
- [x] Component structure by UI kind; conventions documented

**Refinements** (updated 2026-06-10)
- [x] `SubdomainLink` — `useEffect`+`setState` → `useSyncExternalStore` (removes the React 19 "setState synchronously within an effect" cascading-render warning). SSR/hydration uses a fallback href, then swaps to the real host-based href after hydration; no hydration mismatch. e2e `subdomain-link.spec.ts` (dev → me navigation) added — passing.

### ⬜ 2. dev content (job-search core)
- [ ] Experience section (real career material — provided by Claire)
- [ ] Projects section (role · stack · outcome · links)

### ⬜ 3. Custom CMS blog ⭐ (full-stack proof)
> Large; build in slices. **Editor UI first** (most visible / the proof piece),
> then the read side to go live, then wire up persistence + auth last.

**3a. Editor UI ⭐ (writing experience — no infra yet)**
- [ ] `/stella` WYSIWYG editor — Tiptap v3, body stored as **Tiptap JSON**
- [ ] Formatting: bold · italic · underline · strike, H1–4, code, **blockquote + custom callout**, link, image, text-color, highlight
- [ ] Input rules (`**`, `==`, `# `) + shortcuts (`Cmd+B`) + toolbar buttons — all work
- [ ] Temporary save (localStorage + JSON output) — DB/auth deferred to 3c
- Structure: `app/stella/`, `components/editor/` (PostEditor · Toolbar · ColorPicker), `lib/editor/` (extensions · callout)

**3a progress** (updated 2026-06-08)
- [x] **Step 1** — `/stella` route scaffold (`app/stella/layout.tsx` + `page.tsx`) + proxy bypass so `/stella` is served on any host (shared, exempt from dev/me rewrite). Verified on dev & me hosts; existing `/` routing intact.
- [x] **Step 2** — Tiptap v3 (`@tiptap/react` · `@tiptap/pm` · `@tiptap/starter-kit` · `@tiptap/extensions`). Base editor in `app/stella/page.tsx` (`"use client"`, `immediatelyRender: false`); shared extension list in `lib/editor/extensions.ts` (StarterKit + Placeholder). Min editor styles in `globals.css`. Fixed Turbopack workspace-root inference via `next.config.ts` `turbopack.root` (parent `package-lock.json`). e2e harness added (`@playwright/test`, `playwright.config.ts`, `e2e/stella.spec.ts`) — 4 passing: render / placeholder / typing / markdown input rules.
- [x] **Step 3** — 상단 고정 Toolbar. `components/editor/Toolbar.tsx`(bold·italic·underline·strike·code, H1–4, blockquote, link) + `PostEditor.tsx`로 에디터/툴바 조합 추출; `page.tsx`는 PostEditor만 렌더. StarterKit v3에 Underline·Link가 이미 포함됨을 확인(별도 익스텐션 불필요). active 강조는 `useEditorState`로 구독, 버튼 `onMouseDown` preventDefault로 선택 유지, 링크는 prompt 토글. e2e 4개 추가(툴바 렌더 / 굵게 적용+active / H2 / 링크) — 총 8개 통과.
- [x] **Route split** (2026-06-10) — editor moved `/stella` → **`/stella/write`** (`git mv`); `/stella` is now the **dashboard** (entry point). proxy bypasses `/stella` + all children on any host. Toolbar icon buttons split visible glyph (B/I/U/…) from descriptive `aria-label` (굵게/기울임/…). e2e repointed + dev/me host-serving + dashboard nav tests, all Given/When/Then — 14 passing.
- [x] **Step 4** (2026-06-11) — image + custom callout. Image via `@tiptap/extension-image` (`inline:false`); toolbar 🖼 button prompts for a URL and inserts it (real R2 upload deferred to 3c). Callout is a custom Node in `lib/editor/callout.ts` (`group:block` / `content:block+` / `defining`, `toggleCallout` = `toggleWrap`); added `@tiptap/core` as a direct dep so the command type can be augmented via `declare module "@tiptap/core"`. The star (✦) marker is drawn with `aside[data-callout]::before` CSS (kept out of the serialized HTML), with a left accent bar + surface background. Toolbar ✦ button subscribes to active state via `useEditorState`. 3 e2e added (image insert / callout wrap+active / typing inside callout) — 16 total (+1 subdomain = 17) passing.
- [ ] Step 5 — color + highlight · Step 6 — title + temp save · Step 7 — styling

**3b. Read side (go live here)**
- [ ] DB schema (post: title, body = Tiptap JSON, category/tags, date, slug, status…) — D1 + Drizzle ORM
- [ ] Render Tiptap JSON → HTML on me (`/`, `/[slug]`), tag filtering (code highlight, TOC, typography)
- [ ] Seed a few posts directly in D1 → verify

**3c. Write side wiring (persist + secure)**
- [ ] Auth — single-admin login (owner only); protect `/stella`
- [ ] Post CRUD API (Route Handlers) + draft/publish states
- [ ] Image upload → R2 + insert into body

### ⬜ 4. Velog curation & migration
- [ ] Collect Velog posts → classify (dev/book/exhibition/movie/essay)
- [ ] Prioritize by "job-search signal" → pick 10–20
- [ ] Refine and import into CMS (or bulk-import script into D1)
  - Note: Velog exports **markdown**, but the CMS stores **Tiptap JSON** → needs an MD → Tiptap JSON conversion step in the import script.
- [ ] (Defer the rest to a later pass)

### ⬜ 5. (optional) View counter
- [ ] Lightweight per-post view count via D1

### ⬜ 6. Polish
- [ ] **Scroll animation** — section transitions feel choppy now; add smooth/scroll motion
- [ ] Metadata / OG images / sitemap / robots
- [ ] Responsive pass, dark mode finish
- [ ] Accessibility (a11y), SEO, performance (Core Web Vitals)
- [ ] Prettier config + format-on-save

### ⬜ 7. Deploy (Cloudflare)
- [ ] `wrangler.jsonc`, `open-next.config.ts`, `next.config.ts` setup
- [ ] Register env (contact) + D1 binding in Cloudflare dashboard
- [ ] Connect custom domain (apex + dev/me subdomains)
- [ ] Ship → portfolio URL

---

## Pending decisions / TODO (Claire)
- [ ] Work material for the dev page (experience, projects)
