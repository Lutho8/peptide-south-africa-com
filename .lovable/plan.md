## Add 8 new peptide products to the catalog

### Category updates (`src/data/products.ts`)
Add a new **Recovery** category. Rename **Longevity** display label to **Wellness & Longevity** (internal value stays `Longevity` to avoid touching existing MOTS-C / KLOW80 records and URLs). Updated `categories` array:
`["All", "GLP", "Growth Hormone", "Healing", "Recovery", "Skin & Hair", "Wellness & Longevity"]`

### New products (all RUO track, ≥99% HPLC, ZAR)
Pricing derived from directpeptides.com (USD × ~19 = ZAR, matching existing catalog markups). Where the compound isn't listed on directpeptides, I've used prevailing market rates from the same tier.

**Recovery**
| Name | Size | Single vial (ZAR) | 3-Pack (−8%) | Source |
|---|---|---|---|---|
| KPV | 10 mg | R1,120 | R3,091 | directpeptides $59 |
| Thymosin Alpha-1 | 5 mg | R1,500 | R4,140 | directpeptides $79 |
| ARA-290 | 16 mg | R1,235 | R3,409 | market rate $65 |

**Wellness & Longevity**
| Name | Size | Single vial (ZAR) | 3-Pack (−8%) | Source |
|---|---|---|---|---|
| SS-31 | 10 mg | R1,615 | R4,458 | market rate $85 |
| Pinealon | 10 mg | R855 | R2,360 | market rate $45 |
| Epitalon | 10 mg | R855 | R2,360 | market rate $45 |
| Selank | 10 mg | R740 | R2,042 | directpeptides $39 |
| Semax | 10 mg | R740 | R2,042 | directpeptides $39 |

Each entry gets the full `Product` shape used today: `id`, `slug`, `shortDescription`, `description`, `image`, `category`, `purity: "≥99%"`, `storage`, `sku` (e.g. `RTT-KPV-10`), `casNumber`, `compoundClass`, `track: "RUO"`, `variants` via `buildPackVariants(...)`, `priceRange`, `benefits` (4), `whatsIncluded` (4), `whoItsFor` (3), `howItWorks` (4), `faqs` (1–2), `inStock: true`, `stock`.

CAS numbers used: KPV 67247-12-5 · TA-1 62304-98-7 · ARA-290 1208243-50-8 · SS-31 (Elamipretide) 736992-21-5 · Pinealon 1220646-64-1 · Epitalon 307297-39-8 · Selank 129954-34-3 · Semax 80714-61-0.

### Product vial images
Generate 8 images matching the attached MOTS-C reference (silver-capped clear vial + navy box, teal accent band, white lyophilized powder, "Peptide South Africa" wordmark, compound name in large white sans-serif, spec strip: `{size} • ≥99% HPLC • LOT PSA-{code}-2026 • Store 2-8°C • Research Use Only – South Africa`). Premium quality tier for legible label text. Save to:
- `src/assets/vials/kpv.jpg`
- `src/assets/vials/tha1.jpg`
- `src/assets/vials/ara290.jpg`
- `src/assets/vials/ss31.jpg`
- `src/assets/vials/pinealon.jpg`
- `src/assets/vials/epitalon.jpg`
- `src/assets/vials/selank.jpg`
- `src/assets/vials/semax.jpg`

Import each directly (no CDN pointer) so they ship in the Vite bundle — same pattern we fixed the other vials to after the custom-domain CDN issue.

### Files touched
- `src/data/products.ts` — 8 new products, updated `categories`, 8 new image imports
- `src/assets/vials/*.jpg` — 8 new generated images

No changes to `ShopPage`, filters, PDP, cart, schema, or routing — the existing category filter and product grid pick these up automatically.

### Out of scope
- No new blog posts, no PDP copy variants, no bundle updates. Ask if you want related-content or bundle inclusion for any of these.