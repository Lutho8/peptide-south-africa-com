## Goal

Turn `CheckoutSuppliesRail` into a full inline upsell surface (quantity + variant controls, not just one-tap add), document the exact token pattern for accessory tiles, add Playwright visual coverage for the rail's states, and extend the vial-token guard to enforce token usage in the rail.

## 1. Interactive controls on `CheckoutSuppliesRail.tsx`

Today the rail is one-tap add + "Added" disabled state. Upgrade to:

- **Variant selector** for products with multiple variants (BAC Water has 3ml / 10ml). Render a small segmented pill (`3ml` / `10ml`) above the price; selecting a variant updates the displayed unit price. Uses local `useState` keyed by product slug.
- **Quantity stepper** replacing the single Add button once the item is in the cart:
  - Not in cart → `+ Add` button (primary teal, matches existing styling).
  - In cart → `− [qty] +` compact stepper. Uses `updateQuantity(itemId, qty)` / `removeItem` from `CartContext`. Reads current qty by matching product slug + selected variant label from `items`.
- **Line total** shows to the right of the stepper (`format(unit * qty)`), muted.
- Preserve existing `silent: true` add so the post-add modal doesn't retrigger during checkout.
- Keep the `vialFrame("sm")` tile, `VIAL_TEST_ID`, and layout — controls are added inside the existing row.
- No new state stores; everything derives from `CartContext.items`.

## 2. `docs/vial-design.md` — concrete accessory tile example

Add a new section **"Example: Accessory upsell tile"** after the existing minimal example. Show the exact pattern used by `CheckoutSuppliesRail`:

- Required imports: `VIAL_TEST_ID`, `vialFrame` from `@/lib/vialDesign`.
- Destructure `const { frame, bar } = vialFrame("sm")`.
- The three required DOM pieces: outer `<span className={`${frame} block h-12 w-12`} data-testid={VIAL_TEST_ID}>`, the accent `<span aria-hidden className={bar} />`, and the product image.
- Callout that raw `bg-vial-*` / `shadow-vial` classes are forbidden in accessory tiles (same rule as other consumers).
- Link to `CheckoutSuppliesRail.tsx` as the canonical reference implementation.

Also add `CheckoutSuppliesRail.tsx` and any future accessory tile paths to the "Adding a new vial-branded consumer" checklist section.

## 3. Playwright visual coverage — `tests/vial-visual.spec.ts`

Add three new tests to the existing `describe`:

- **`Checkout supplies rail — loaded`**: navigate `/checkout` with a peptide in cart, wait for the rail (locate by its "Add reconstitution supplies" label → `getByText`, then screenshot the parent `.rounded-lg.border` container). Covers default state (no supplies in cart yet, all "Add" buttons visible).
- **`Checkout supplies rail — variant switched`**: click the `10ml` variant pill on the BAC Water row, screenshot the rail. Locks in the variant-selected visual.
- **`Checkout supplies rail — items added`**: click Add on BAC water + swabs so the row switches to the qty stepper, screenshot the rail. Locks in the in-cart quantity-stepper visual.
- **`Checkout supplies rail — empty`**: temporarily mock all supplies as `inStock: false` isn't practical from Playwright. Instead, cover this state with a lightweight Vitest render test in `src/test/checkout-supplies-rail.test.tsx` asserting the component returns `null` when `CHECKOUT_SUPPLIES_SLUGS` resolves to no in-stock products (mocked via `vi.mock` of `@/data/products`). Documented in the plan under this section because the user asked for an "empty" state — Playwright is the wrong tool for a conditional-null render.

All Playwright snapshots use the same `SNAPSHOT_OPTS` (`maxDiffPixelRatio: 0.02`, animations disabled) as existing tests. Baselines regenerate with the documented `--update-snapshots` command.

## 4. Extend `src/test/vial-tokens-guard.test.ts`

- Add `checkoutSuppliesRail: "src/components/CheckoutSuppliesRail.tsx"` to the `TARGETS` map.
- Add `["checkoutSuppliesRail", TARGETS.checkoutSuppliesRail]` to `FLAT_TARGETS` so it is scanned for raw `bg-vial-*` / `shadow-vial` / `ring-vial-*` / `border-vial-*` / `text-vial-*` literals and any raw `data-testid="vial-frame"` string.
- No changes to the regex or the FloatingVial exemption — the rail already conforms, so the guard should pass on first run and lock the file down going forward.
- If future accessory tiles land as new components, the same two lines must be added (documented in the README section referenced above).

## Technical details

- No schema/DB changes. No new context or state store.
- `useCart` already exposes `addToCart`, `updateQuantity`, `removeItem`, `items` — sufficient for the stepper.
- Variant matching: cart items are keyed by `product.slug + variantLabel`; the stepper looks up the matching line via `items.find(i => i.product.slug === slug && i.variantLabel === selectedLabel)`.
- Styling stays within existing Tailwind tokens (`text-primary`, `border-border`, `bg-background`) — no new colours.

## Files touched

- `src/components/CheckoutSuppliesRail.tsx` (add variant selector + qty stepper)
- `docs/vial-design.md` (accessory tile example + checklist entry)
- `tests/vial-visual.spec.ts` (3 new snapshot tests)
- `src/test/checkout-supplies-rail.test.tsx` (new — empty-state render test)
- `src/test/vial-tokens-guard.test.ts` (add CheckoutSuppliesRail to TARGETS + FLAT_TARGETS)

## Out of scope

- No changes to `vialDesign.ts`, `CartContext`, `products.ts`, or `bundles.ts`.
- No new products, no additional accessories from kronen.
- No changes to `PostAddUpsellModal` or `FrequentlyBoughtTogether` — they already handle their own upsell paths.
