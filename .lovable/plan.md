## Goal

Regenerate every product vial image so the vial, box, and background all follow one consistent white + light-teal medical/luxury look (as in the uploaded reference), while preserving each compound's logo, label text, dose, and Peptide South Africa branding.

## Visual direction (applied identically to every product)

- Background: soft white / very pale grey studio surface with gentle shadow.
- Box: matte white carton with a light-teal (#B8DDD9 / ~hsl(174 30% 80%)) accent band on the right edge and a small teal dot marker, echoing the reference image.
- Vial: clear glass with silver/aluminum crimp cap, subtle liquid meniscus, white label with navy typography.
- Label: keeps existing "PEPTIDE SOUTH AFRICA" wordmark, compound name, dose, ≥99% HPLC line, lot placeholder. No colour on the label except navy text + a thin teal rule — no navy body, no dark backgrounds.
- Composition: vial front-left, box back-right, soft directional light, long soft shadow — matches reference framing for every SKU so the shop grid reads as one product family.

## Scope — products to regenerate

All vial hero images referenced from `src/data/products.ts`, including but not limited to:
- Retatrutide, Tirzepatide (TZ-2), Semaglutide, BPC-157, TB-500, GHK-Cu, Tesamorelin, CJC-1295/Ipamorelin
- KPV, Thymosin Alpha-1, ARA-290, SS-31, Pinealon, Epitalon, Selank, Semax
- Any bundle hero images that show a vial render

Each image is regenerated at the same dimensions and saved over the current asset path so imports in `src/data/products.ts`, product pages, bundles, and OG cards pick up the new art with no code path changes.

## Implementation steps

1. Read `src/data/products.ts` and `src/data/bundles.ts` to enumerate every vial asset path and the exact label text (name, dose, category) per product.
2. For each product, generate a new image with `imagegen` using one shared prompt template — only the compound name, dose, and category line vary. Preset: premium quality, transparent_background off, white studio background baked in.
3. Overwrite the existing asset files in `src/assets/` at their current paths (same filenames) so no import changes are needed.
4. Update `src/components/FloatingVial.tsx` label preview + any hard-coded navy vial gradients so the on-page 3D vial mock matches the new white/teal palette (label stays navy text on white, body becomes clear glass with teal liquid tint).
5. Spot-check shop grid, product page hero, cart drawer thumbnails, and OG images visually via a Playwright screenshot on `/shop` and one product page.

## Out of scope

- No changes to product copy, pricing, SKUs, categories, or navy/teal site chrome.
- No changes to the site's primary navy brand colour — only the product renders and the FloatingVial mock shift to the white/light-teal presentation.
- Label logo and wordmark stay identical; only the surrounding box/vial/background art changes.
