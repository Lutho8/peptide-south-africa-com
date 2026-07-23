## Goal

Three deliverables:

1. Developer README documenting the required `vialDesign.ts` token pattern for any new cart, checkout, or product-media vial subcomponent.
2. Add **BAC Water** as a new product category + product (2 variants: 3ml / 10ml).
3. Add **Accessories** category with 4 products (Alcohol Swabs, Glass Cartridge 3ml, Peptide Pen Needles 10x, Syringes 5×1ml U-100) — sourced from kronen-peptide.com's Zubehör list. The one out-of-stock item (Peptide Pen) is omitted for now. Wire accessories into the cart upsell flow.

## 1. Developer README — `docs/vial-design.md` (new)

Short (≈1 page) contributor guide covering:

- **Rule**: any component that renders a vial box (product card, PDP gallery, cart tile, checkout summary, 3D mock) MUST import styling from `@/lib/vialDesign` — never inline `bg-vial-*`, `shadow-vial`, `ring-vial-*`, `border-vial-*`, or `text-vial-*` class literals.
- **Which token to use**:
  - `vialFrame("md")` → product cards
  - `vialFrame("lg")` / `vialZoomFrameClasses` → PDP media
  - `vialFrame("sm")` / `vialTileFrameClasses` → cart drawer, cart page, checkout summary tiles
  - Accent bar + dot: pick the matching size returned by `vialFrame()`
- **Test ID**: always stamp `data-testid={VIAL_TEST_ID}` — never the raw string.
- **Guards that will fail your build**: `src/test/vial-tokens-guard.test.ts` (Vitest) and `tests/vial-visual.spec.ts` (Playwright snapshots). Includes the update-snapshots command.
- **Adding a new consumer**: add its path to `TARGETS` / `FLAT_TARGETS` in the guard test and to the visual spec.
- Link back to `src/lib/vialDesign.ts` as source of truth.

Referenced from the root `README.md` under a new "Design system" bullet.

## 2. BAC Water product

- New category `"BAC Water"` appended to `categories` in `src/data/products.ts`.
- New product `bac-water-bacteriostatic` with:
  - Two variants: `3ml` (R89) and `10ml` (R199) — ZAR pricing calibrated to local reconstitution supply market (kronen EUR prices are irrelevant for ZA; anchor to typical SA pharmacy pricing while keeping premium positioning).
  - Copy: sterile 0.9% benzyl-alcohol bacteriostatic water for reconstitution, sealed vial, research use only.
  - Fields: `casNumber` omitted (not a peptide), `purity` omitted, `track: "Research"`, `inStock: true`, `sku: "BAC-WATER"`.
  - Image: generate one branded vial render matching the white + teal medical-luxury system → `src/assets/vials/bac-water.jpg` (uses standard vial framing via existing `vialDesign` tokens; no new styling required).
- JSON-LD (via existing `src/lib/seo.ts`) picks up automatically because it derives from product data.

## 3. Accessories category (4 SKUs)

- New category `"Accessories"` appended to `categories`.
- Four new products in `src/data/products.ts`:

  ```text
  slug                     name                             price (ZAR)  pack
  alcohol-swabs-20         Alcohol Prep Swabs (20-pack)     R59          20 ct
  glass-cartridge-3ml      Sterile Glass Cartridge 3ml      R39          1 ct
  peptide-pen-needles-10   Peptide Pen Needles (10-pack)    R49          10 ct
  insulin-syringes-5       Insulin Syringes 1ml U-100 (5)   R59          5 ct
  ```

  All flagged `track: "Research"`, `inStock: true`. Each gets a lightweight product image generated into `src/assets/accessories/`. These are simple line-item consumables — they render inside existing `ProductCard` / PDP layouts using the same `vialFrame` tokens, so no new components needed.

- **Cart upsell wiring**: extend `POST_ADD_ACCESSORIES` in `src/data/bundles.ts` to include the four accessory slugs (replacing the current placeholders `ghk-cu-50mg` / `mots-c`). This surfaces them in the existing `FrequentlyBoughtTogether` and post-add-to-cart upsell modal. Also add a per-peptide default suggestion into `BUNDLE_MAP` for every peptide slug so BAC water + swabs always appear as suggested add-ons (implemented via a fallback merge inside `FrequentlyBoughtTogether` rather than duplicating map entries).

- **Checkout accessories rail**: add a compact "Add reconstitution supplies" strip above the checkout order summary showing BAC water + swabs + syringes, one-tap add. Uses existing cart context — no new state.

## Technical details

- No schema/DB changes. All new data is static in `src/data/products.ts` and `src/data/bundles.ts`.
- `getProductsByCategory` already handles new categories; shop page groups by category automatically.
- Update `src/test/shop-catalog.test.ts` to assert the new categories and slugs render.
- Update `src/test/new-peptides-pricing.test.ts` / `new-peptides-jsonld.test.ts` scope only if needed — accessories are non-peptide so likely exempt; add a small new test file `src/test/accessories-catalog.test.ts` covering price + category presence.
- Brand Guard CI already scans new files automatically.

## Files touched

- `docs/vial-design.md` (new)
- `README.md` (link the new doc)
- `src/data/products.ts` (new category + 5 products)
- `src/data/bundles.ts` (update `POST_ADD_ACCESSORIES`)
- `src/components/FrequentlyBoughtTogether.tsx` (fallback accessory suggestions)
- `src/pages/CheckoutPage.tsx` (supplies strip above order summary)
- `src/assets/vials/bac-water.jpg` + `src/assets/accessories/*.jpg` (generated)
- `src/test/shop-catalog.test.ts` (extend)
- `src/test/accessories-catalog.test.ts` (new)

## Out of scope

- No changes to `vialDesign.ts` itself or the guard tests — the README documents the existing rule, it doesn't change it.
- Peptide Pen device (kronen lists it out of stock) — skipped until we source a supplier.
- No new Playwright specs for accessories (they aren't vial-branded surfaces).
