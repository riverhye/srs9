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

/admin         author / manage posts (login, owner only) — shared

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
> Large; split read → write so the site can go live without waiting on the editor.

**3a. Read side (go live here)**
- [ ] DB schema (post: title, body, category/tags, date, slug, status…) — D1 + Drizzle ORM
- [ ] Post list / detail on me (`/`, `/[slug]`), tag filtering
- [ ] Markdown rendering (code highlight, TOC, typography)
- [ ] Seed a few posts directly in D1 → verify

**3b. Write side (browser authoring)**
- [ ] Auth — single-admin login (owner only)
- [ ] `/admin` editor (markdown)
- [ ] Image upload → R2 + insert into body
- [ ] Post CRUD API (Route Handlers) + draft/publish states

### ⬜ 4. Velog curation & migration
- [ ] Collect Velog posts → classify (dev/book/exhibition/movie/essay)
- [ ] Prioritize by "job-search signal" → pick 10–20
- [ ] Refine and import into CMS (or bulk-import script into D1)
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
- [ ] Rename GitHub repo `SRS9` → `srs9`? (brand consistency)
- [ ] Work material for the dev page (experience, projects)
