# Conventions

Coding conventions for srs9. Keep these consistent across the codebase.

> Docs are written in **English**. Inline code comments are written in **Korean**.
> UI copy is written in **Korean**.

## 1. File names

- Components: `PascalCase.tsx` (e.g. `RootHeader.tsx`)
- Utilities / config: `camelCase.ts` (e.g. `site.ts`)

## 2. Component structure — grouped by UI kind

Components live in subfolders named by UI kind. The folders below are
**examples**, not a fixed list — add new folders as new kinds appear.

```
components/
  header/       RootHeader.tsx
  footer/       RootFooter.tsx
  link/         SubdomainLink.tsx
  placeholder/  ComingSoon.tsx
  ...           (add more kinds as needed)
```

## 3. Exports

- Components use **named exports** (`export function RootHeader`).
- Next.js route files `page` / `layout` use default exports; `proxy` uses a
  named `proxy` export (Next 16 renamed `middleware` → `proxy`).

## 4. Naming

- Components rendered at the root/global level are prefixed **`Root`**
  (e.g. `RootHeader`, `RootFooter`).
- Names must be specific and unambiguous (e.g. `SubdomainLink`, not `CrossLink`).

## 5. Language

- Identifiers / variables: English
- Inline code comments: Korean
- UI copy: Korean
- Test descriptions (`describe`/`test` titles): Korean
- Docs (`docs/*.md`): English

## 6. Folder structure

- `app/` — routes
- `components/<kind>/` — shared UI, grouped by kind
- `lib/` — logic & config
- `e2e/` — Playwright e2e tests (`*.spec.ts`)

## 7. Styling — tokens (scope a)

- **Colors & fonts: tokens only**, defined as CSS variables in `app/globals.css`.
  No hex literals, no Tailwind palette colors (`text-zinc-*`).
- Spacing / size / radius: use Tailwind's built-in scale (`px-6`, `gap-4`,
  `rounded-2xl`).
- **Avoid arbitrary values** (`h-[3px]`, `leading-[1.15]`); use the scale instead.

## 8. Imports

- Order: external packages → `@/` internal → relative paths.
- (To be auto-sorted by Prettier later.)
