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

/stella        author / manage posts (login, owner only) — shared

Implementation: one Next app + middleware host routing (dev.*→/dev, me.*→/me)
Shared:         design system · CMS · D1 (posts) · R2 (images) · auth
Posts:          stored in D1 with scope (dev|me) + tags, served per host
Local:          dev.localhost:3400 / me.localhost:3400
```

See `docs/CONVENTIONS.md` for coding conventions.

---

## Stages

### ✅ 0. Scaffold
- [x] `create-next-app` (TS, Tailwind v4, App Router, pnpm)
- [x] Lowercase directory `srs9`

### ✅ 1. Foundation UI
- [x] Root layout — fonts, metadata, design tokens (light/dark)
- [x] Host routing middleware (apex → dev; dev.*→/dev; me.*→/me)
- [x] `RootHeader` / `RootFooter` (contact via env)
- [x] dev home (single-page scroll) + me home (feed + filter chips)
- [x] Component structure by UI kind; conventions documented

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
- [x] **Step 1** — `/stella` route scaffold (`app/stella/layout.tsx` + `page.tsx`) + middleware bypass so `/stella` is served on any host (shared, exempt from dev/me rewrite). Verified on dev & me hosts; existing `/` routing intact.
- [x] **Step 2** — Tiptap v3 (`@tiptap/react` · `@tiptap/pm` · `@tiptap/starter-kit` · `@tiptap/extensions`). Base editor in `app/stella/page.tsx` (`"use client"`, `immediatelyRender: false`); shared extension list in `lib/editor/extensions.ts` (StarterKit + Placeholder). Min editor styles in `globals.css`. Fixed Turbopack workspace-root inference via `next.config.ts` `turbopack.root` (parent `package-lock.json`). e2e harness added (`@playwright/test`, `playwright.config.ts`, `e2e/stella.spec.ts`) — 4 passing: render / placeholder / typing / markdown input rules.
- [ ] Step 3 — Toolbar · Step 4 — image + callout · Step 5 — color + highlight · Step 6 — title + temp save · Step 7 — styling

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
