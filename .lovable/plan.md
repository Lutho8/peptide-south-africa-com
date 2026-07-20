## Goal

Lock in the shared `src/lib/vialDesign.ts` tokens so vial styling can't regress — both by static analysis (build fails on hardcoded classes in the three canonical components) and by pixel-level Playwright snapshots covering the PDP gallery and cart/checkout tiles.

## 1. Guardrail: fail the build on hardcoded vial styling

Add a Vitest guard at `src/test/vial-tokens-guard.test.ts` that reads the source of the three components and asserts:

- Each file imports from `@/lib/vialDesign`.
- Each file contains no raw vial class literals — regex bans of `bg-vial-*`, `shadow-vial`, `ring-vial-*`, `border-vial-*`, `text-vial-*`, `bg-vial-accent*`, `bg-vial-liquid`, `bg-vial-glass`, `bg-vial-cap` appearing outside an `import` line.
- Any `data-testid="vial-frame"` uses the `VIAL_TEST_ID` constant, not a string literal.

Files inspected: `src/components/FloatingVial.tsx`, `src/components/ProductCard.tsx`, `src/components/ProductImageZoom.tsx`. `FloatingVial` legitimately uses raw `bg-vial-*` classes inside its 3D markup, so the guard scopes the ban to the two flat components and only enforces the "must import from vialDesign" + "must use VIAL_TEST_ID constant" rules on `FloatingVial`.

Runs under the existing `vitest` command, so CI already picks it up — no new workflow needed.

## 2. Playwright visual snapshots

Add `tests/vial-visual.spec.ts` running against the local dev server (already wired via `playwright.config.ts` / `lovable-agent-playwright-config`). Uses `toHaveScreenshot()` with a small `maxDiffPixelRatio` to avoid font-rendering flake.

Coverage:

1. **PDP media gallery + vial callouts** — navigate to a stable product slug (first product in `src/data/products.ts`), dismiss age gate via `tests/_utils.ts` helpers, snapshot the gallery region locator (the `[data-testid="vial-frame"]` and its surrounding callouts).
2. **Cart drawer tile** — add first product to cart via existing `addFirstProductToCart` helper, open the drawer, snapshot the line-item tile locator.
3. **Cart page tile** — navigate to `/cart` with the item present, snapshot the line-item tile.
4. **Checkout order summary tile** — navigate to `/checkout`, snapshot the summary thumbnail row.

Each snapshot targets the tile locator (not full page) to keep baselines small and stable. Baselines commit under `tests/vial-visual.spec.ts-snapshots/`.

## 3. CI wiring

Playwright already runs in CI via the shared config; the new spec picks up automatically. Add a short note in the spec file header explaining how to update baselines (`bunx playwright test --update-snapshots`) so future contributors know the workflow.

## Files touched

- `src/test/vial-tokens-guard.test.ts` (new)
- `tests/vial-visual.spec.ts` (new)
- `tests/vial-visual.spec.ts-snapshots/*.png` (generated on first run)

## Out of scope

- No changes to `vialDesign.ts` or the three components — they already import correctly.
- No new ESLint rule; the Vitest guard is simpler and runs in the same test pass.
