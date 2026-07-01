## Findings from investigation

Ran the live shop and PDP against the current code:

- **Shop catalog renders 64 products.** Browse Compounds anchor (`#products`) works and Recovery + Wellness & Longevity buttons are already in the category filter row. No missing catalog bug reproduces in code.
- **JSON-LD Product schema is already emitted on every PDP** via `productSchema()` in `src/lib/seo.ts` — it already sets `priceCurrency: "ZAR"`, `availability: InStock` (when `inStock: true`), and `areaServed: { Country: "ZA" }`. All 8 new peptides have `inStock: true`.
- **ZAR prices computed correctly** — spot-checked Selank: base R740 → 3-Pack R2,042 (740×3×0.92), matches the visible PDP price and range.

So the actual code work needed is small; most of it is verification and locking in the correctness with a test so it can't regress.

## Plan

### 1. Lock ZAR pricing for the 8 new peptides with a unit test
Add `src/test/new-peptides-pricing.test.ts` that asserts for KPV, Thymosin Alpha-1, ARA-290, SS-31, Pinealon, Epitalon, Selank, Semax:
- `variants[0]` is 3-Pack with price `= round(base × 3 × 0.92)`
- `variants[1]` is Single Vial with price `= base`
- `priceRange` string matches `R{single} – R{3pack}` with `en-ZA` grouping

Base prices under test (from `src/data/products.ts`):

```text
KPV      1120  → 3092 / 1120
THA1     1500  → 4140 / 1500
ARA-290  1235  → 3409 / 1235
SS-31    1615  → 4457 / 1615
Pinealon  855  → 2360 /  855
Epitalon  855  → 2360 /  855
Selank    740  → 2042 /  740
Semax     740  → 2042 /  740
```

### 2. Lock JSON-LD Product schema shape with a unit test
Add `src/test/new-peptides-jsonld.test.ts` that iterates the 8 new peptides through `productSchema()` and asserts:
- `offers.priceCurrency === "ZAR"`
- `offers.price` equals the single-vial price stored on the product (`Math.round(product.price)`)
- `offers.availability === "https://schema.org/InStock"`
- `offers.areaServed.name === "ZA"`

### 3. Lock catalog membership with a unit test
Add `src/test/shop-catalog.test.ts`:
- `getProductsByCategory("Recovery")` includes KPV, Thymosin Alpha-1, ARA-290 (slugs `kpv`, `thymosin-alpha-1`, `ara-290`)
- `getProductsByCategory("Wellness & Longevity")` includes SS-31, Pinealon, Epitalon, Selank, Semax (plus existing MOTS-C / KLOW80)
- `categories` array contains both "Recovery" and "Wellness & Longevity"

### 4. No production code changes required
`ProductPage.tsx`, `ShopPage.tsx`, `src/lib/seo.ts`, and `src/data/products.ts` already satisfy the request. If any of the three tests above surface a mismatch when they run, fix the underlying data in `src/data/products.ts` (not the test) so the schema/price stays correct.

### Out of scope (already verified working)
- Adding a Recovery/Wellness filter button — already present in `src/pages/ShopPage.tsx`.
- Adding `<JsonLd data={productSchema(product)} />` to PDPs — already emitted at line 138 of `src/pages/ProductPage.tsx`.
- Currency conversion — site is single-currency ZAR (`src/context/CurrencyContext.tsx`), so displayed price = stored price by construction.
