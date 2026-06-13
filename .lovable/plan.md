## Goal

Let any visitor buy a single vial (or 3-pack) and check out without a clinician consultation. Simplify the variant set to just **Single Vial** and **3-Pack** everywhere, and show single-vial pricing first on catalog cards.

## Changes

### 1. Remove the 10-pack entirely
**File:** `src/data/products.ts`
- `buildPackVariants()` returns only `Single Vial` and `3-Pack` (drop the 10-pack row and the `p10` stock param).
- Reorder so **3-Pack is first** in the array — this makes it the default selection on the PDP ("leads with 3-pack").
- `rangeFromVariants` still works (now spans 1-vial → 3-pack).

### 2. Catalog cards: show single-vial price only, no pack toggle
**File:** `src/components/ProductCard.tsx`
- Remove the 2-button pack picker grid.
- Always display the **single-vial price** as the headline price (find the variant with `pack === 1`).
- Below it, a small line: `or 3-Pack from R{3-pack price} · save 8%` linking into the PDP.
- "Add To Cart" on the card adds the **single vial** directly (works for both RUO and GP tracks — see #3).
- "View" button keeps secondary role for users who want to pick the 3-pack.

### 3. Allow direct checkout for GP-track products (RT3, etc.)
GP-track products currently force users into `/quiz`. Users who don't want a consultation can't buy.

**File:** `src/pages/ProductPage.tsx`
- Remove the GP-track branch that redirects to `/quiz` from `handleAdd`. GP products now add to cart like any other product.
- Replace the single "Start Clinician Consultation" CTA with **two CTAs stacked**:
  - Primary: `Add to Cart` (gradient, full width)
  - Secondary: `Prefer guidance? Start Clinician Consultation →` (text/outline link to `/quiz?product=...`)
- Keep the Subscribe & Save panel visible for GP products too (it was hidden via `!isGPTrack`).

**File:** `src/components/ProductCard.tsx`
- Same: GP-track cards add to cart instead of routing to quiz. Add a small "or book a consult" link under the CTA for users who want the clinical path.

### 4. PDP variant selector — 3-Pack leads
**File:** `src/pages/ProductPage.tsx`
- Because we reorder variants in `products.ts`, `selectedVariant = 0` will already default to the 3-Pack. No code change needed beyond the data reorder.
- Variant buttons render in order: `[3-Pack] [Single Vial]`, with 3-Pack visually highlighted as the default.

### 5. Sweep references to 10-pack
- `src/components/ProductCard.tsx` comment about "10-pack remains available on the PDP" — remove.
- Quick grep for `10-Pack`, `pack === 10`, `p10` in components/pages and clean stragglers (any copy in `FatLossProtocolPage`, `seo.ts`, etc.). No data migration needed — variants are derived from `data/products.ts` at build time.

## Out of scope
- No backend, RLS, or payment changes.
- No changes to subscription billing or the clinician quiz funnel itself — just removing the forced redirect.
- Cart, checkout, and PayFast flow already work; this only unblocks the entry point.

## Files touched
- `src/data/products.ts`
- `src/components/ProductCard.tsx`
- `src/pages/ProductPage.tsx`
- Small copy sweeps wherever "10-pack" appears in marketing pages.
