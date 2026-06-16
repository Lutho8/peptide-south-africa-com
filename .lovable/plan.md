# Brand Guard CI + UX Polish

Four scoped changes. No business logic touched outside what's listed.

## 1. CI: fail build on legacy brand strings

New file: `.github/workflows/brand-guard.yml`

- Runs on push + PR.
- Steps:
  1. Checkout.
  2. `rg -i --hidden -g '!node_modules' -g '!dist' -g '!.git' -g '!bun.lockb' -g '!brand-guard.yml' -g '!.lovable/plan.md' 'ride[\s-]?the[\s-]?tide|ridethetide'` — fail if any hit (exit 0 inverted).
  3. Build step: `bun install && bun run build`.
  4. Re-run the same `rg` against `dist/` — fail on any hit.
- Allowlist comment in workflow explaining the two intentional exceptions: the external tracker URL `https://ridethetide.info` and the `rtt-cookie-consent` localStorage key (renamed in step 2 below, so it disappears from the allowlist).

Also add a matching local script `scripts/security/scan-brand.mjs` so devs can run `node scripts/security/scan-brand.mjs` before pushing. Wire it into the existing `security.yml` job as a quick parallel step too.

## 2. Cookie banner — minimal, non-disruptive

Edit `src/components/CookieConsent.tsx`:

- Replace the centered modal-card with a slim bottom-left toast: max-width ~360px, single line of copy + two compact buttons (Accept / Decline), small "Privacy" text link.
- Remove the cookie icon circle, the H3, and the "Cookie Settings" tertiary button.
- Trigger delay 2.5s instead of 1.5s; dismiss on Escape.
- Rename localStorage key `rtt-cookie-consent` → `psa-cookie-consent` (one-time migration: if old key exists, copy value then delete).
- Tokens only (`bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`, `bg-primary`). No hardcoded colors.

## 3. Quiz: drive into the app with a pre-built stack

Edit `src/pages/HomePage.tsx` + `src/pages/QuizFunnelPage.tsx`:

- Homepage: add a dedicated "Find My Protocol" band above the existing fold transition — headline "Not sure where to start?", 60-second promise, single primary CTA `Take the 60-second quiz →` linking `/quiz`. Replaces no existing section; inserted between hero and Featured Products.
- Quiz result screen: after the AI protocol generates, show a **"Your recommended stack"** card with the matched products (already computed) and two CTAs:
  1. `Add stack to cart` — calls `addToCart` for each matched product (uses existing CartContext), opens cart drawer, toasts "Stack added".
  2. `View stack in shop` — links `/shop?stack=<ids>` (existing filter param).
- Persist the quiz result to `localStorage` under `psa-quiz-result` so the StickyMobileCTA + Header can later surface "Resume your protocol" (header pill only if result exists; out of scope to wire elsewhere this round beyond the header pill).

## 4. Tracker: primary nav + hero CTA

- `src/components/Header.tsx`:
  - Remove "Tracker" from the Explore dropdown.
  - Add a dedicated top-level nav button **"Peptide Tracker"** (right side, before Cart) — styled as outline button, opens `https://ridethetide.info` in new tab, `rel="noopener"`, aria-label "Open Peptide Tracker (external)".
  - Mobile menu: same item promoted to top of the list with an external-link icon.
- `src/components/HeroShop.tsx` (the main hero): add a secondary CTA next to the existing primary "Shop" button — **"Open Peptide Tracker →"**, outline style, same external link.
- Footer "Tracker →" stays as-is.

## Technical notes

- All copy uses "Peptide Tracker" (per locked memory rule).
- No new dependencies.
- Existing `EcosystemSection` and `TrackerBridgeCard` already say "Peptide Tracker" — no change.
- Brand-guard regex is case-insensitive and tolerates hyphen/space variants; the external `ridethetide.info` URL must be allowlisted by excluding the specific files that legitimately reference it (Header.tsx, HeroShop.tsx, EcosystemSection.tsx, TrackerBridgeCard.tsx, BlogCTA.tsx, Footer.tsx) OR by matching only the bare word without `.info` — preferred approach: regex `ride[\s-]?the[\s-]?tide(?!\.info)` so the external URL passes but any UI string fails.

## Files touched

- new: `.github/workflows/brand-guard.yml`, `scripts/security/scan-brand.mjs`
- edit: `src/components/CookieConsent.tsx`, `src/components/Header.tsx`, `src/components/HeroShop.tsx`, `src/pages/HomePage.tsx`, `src/pages/QuizFunnelPage.tsx`
