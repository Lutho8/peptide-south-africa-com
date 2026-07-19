## Goal

Centralize the white + light-teal "medical luxury" vial styling into a single shared module, extend it to cart/checkout tiles, and lock the look with Playwright visual regression + expanded snapshots so no future edit can silently regress the branding.

## Scope

### 1. Shared vial-design tokens module (`src/lib/vialDesign.ts`)

A single TS module every vial-adjacent component imports from. Tokens still resolve to the existing CSS variables in `src/index.css` (no new hex/hsl values), so runtime theming stays in one place.

Exports:
- `vialFrameClasses` — the canonical Tailwind class string for the studio-plate frame (`relative overflow-hidden rounded-xl border border-vial-border bg-vial-surface shadow-vial`).
- `vialAccentBarClasses` / `vialAccentDotClasses` — the right-edge teal band + dot used on cards / PDP / cart tiles.
- `vialZoomChipClasses` — the "Hover to zoom" / "Tap to zoom" pill styling.
- `vialLabelClasses` — the white label plate used inside `FloatingVial`.
- `VIAL_TEST_ID = 'vial-frame'` — one constant reused by every component + every visual test.
- Small typed helper `vialFrame({ interactive?: boolean })` returning a class string for the two card variants (static vs. `cursor-zoom-in`).

No changes to `tailwind.config.ts` or `src/index.css` — this module is a thin wrapper over the tokens already shipped.

### 2. Refactor consumers to import from the module

- `src/components/FloatingVial.tsx` — replace hard-coded label / frame class strings with `vialLabelClasses` and shared tokens. No visual change.
- `src/components/ProductCard.tsx` — replace inline frame classes with `vialFrame()` + `vialAccentBarClasses` + `vialAccentDotClasses`; set `data-testid={VIAL_TEST_ID}` for tests.
- `src/components/ProductImageZoom.tsx` — same refactor for mobile lightbox trigger and desktop zoom container; keeps existing `data-testid="vial-frame"`.

### 3. Cart + checkout tile refresh

Apply the studio-plate treatment to the product thumbnail inside cart tiles so the vial keeps its premium framing all the way to payment.

- `src/components/CartDrawer.tsx` — wrap each line-item thumbnail in the shared frame (smaller variant: `rounded-lg`, no zoom chip, thinner accent bar). Preserve current layout, quantity controls, and remove button.
- `src/pages/CartPage.tsx` — same treatment on the full-page cart list.
- `src/pages/CheckoutPage.tsx` — apply to the order-summary line items.

Only the image wrapper changes; pricing, quantity, and copy are untouched.

### 4. Playwright visual regression in CI

New spec `tests/vial-branding.visual.spec.ts` (uses the existing `playwright.config.ts` + `playwright-fixture.ts`):

- **FloatingVial** — navigate to `/`, wait for `[data-testid="floating-vial"]`, `expect(locator).toHaveScreenshot('floating-vial.png')` with `maxDiffPixelRatio: 0.01`.
- **ProductCard** — navigate to `/shop`, snapshot the first `[data-testid="vial-frame"]` on a card.
- **PDP media gallery** — navigate to a stable product route (`/product/ghk-cu-50mg`), snapshot the gallery region (frame + accent bar + purity/COA/batch callouts) as one composed screenshot.
- **Cart tile** — programmatically add one item via `window.dispatchEvent` (or navigate to `/cart` with a seeded item using the existing cart context/localStorage), snapshot the first cart line-item frame.

CI wiring:
- Add `.github/workflows/visual-regression.yml` that installs deps, runs `bun run build && bun run preview` (or the existing dev script the Playwright config already targets), executes `bunx playwright test tests/vial-branding.visual.spec.ts`, and uploads `playwright-report/` + `test-results/` as artifacts on failure.
- Baselines committed under `tests/vial-branding.visual.spec.ts-snapshots/`. First run in build mode will generate them.

### 5. Expanded Vitest snapshot coverage for the PDP

Extend `src/test/vial-branding.test.tsx`:

- Render `ProductPage` for a fixture product inside `MemoryRouter` + required providers (Cart, Currency, Auth mock).
- Serializer snapshot of the media-gallery subtree (image frame, accent bar/dot, zoom chip, purity chip, COA chip, batch/lot line).
- Explicit `toHaveClass('bg-vial-surface')` / `shadow-vial` assertions on the gallery root so a regression to raw hex fails loudly at unit-test time — before the slower Playwright job runs.

## Out of scope

- No new product renders, no changes to product copy/pricing/SKUs.
- No changes to global navy/teal chrome tokens, cart pricing/shipping logic, checkout flow, or auth.
- No changes to `src/index.css` or `tailwind.config.ts` (tokens already exist from the previous turn).

## Technical notes

```text
src/lib/vialDesign.ts
  └── consumed by ──▶ FloatingVial, ProductCard, ProductImageZoom,
                      CartDrawer, CartPage (line item), CheckoutPage (summary)

tests/
  └── vial-branding.visual.spec.ts   ← Playwright, runs in new CI workflow
src/test/
  └── vial-branding.test.tsx         ← extended with PDP gallery snapshot
```

- The shared module exports **strings**, not React components, so tree-shaking and existing markup stay intact — only class attributes change at the call sites.
- Playwright baselines are OS-sensitive; the workflow pins `ubuntu-latest` and uses the pre-installed Chromium from `lovable-agent-playwright-config` to keep diffs stable.
- The `mask` option on `toHaveScreenshot` will hide the scroll-driven transform on `FloatingVial` (screenshot taken at `scrollY=0`, animation disabled via `prefers-reduced-motion` emulation in Playwright context).
