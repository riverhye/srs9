@AGENTS.md

## Verification policy

- Default check after any change is `tsc --noEmit` (typecheck). Do NOT
  drive the browser (Playwright) manually to confirm changes.
- Features involving user interaction (editor input, forms, clicks,
  navigation) REQUIRE an end-to-end (e2e) test written as part of the
  change — verify behavior with the test, not by hand.

## Commit style

- `type(scope): Korean summary (Stage N)` — Stage tag only when it applies.
- Body is bullets. One bullet per change, with a short why where it is not
  obvious.
- Split unrelated chunks into separate commits. A doc rewrite and a one-line
  style fix do not share a commit.
