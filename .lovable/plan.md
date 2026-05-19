## 1. Impressum page (replaces About Us + Meet Lutho links)

Create `src/pages/ImpressumPage.tsx` at route `/impressum` (plus `/de/impressum`, `/za/impressum`).

Content (per § 5 TMG, EU-friendly):
- **Company:** Jenluko Investments (Pty) Ltd
- **Trading as:** Ride The Tide
- **Owner / Verantwortlich:** Justice Lutho Kote
- **Registered address:** Washington Street, Room 1 Block F, Cape Town, 7455, South Africa
- **Company registration no.:** 2026/105657/07 (CIPC, Republic of South Africa)
- **Contact:** lutho.kote@relicom.de
- Standard disclaimer / liability / copyright blocks (DE + EN side-by-side)
- SEO: title "Impressum | Ride The Tide", market-aware canonical + reciprocal hreflang via `buildAlternates("/impressum")`.

Update `Footer.tsx`:
- Remove the **About Us** link and the **Meet Lutho (Clinician)** link.
- Add **Impressum** link to the Legal column.

Update `src/App.tsx`:
- Remove `/about` and `/clinician` route registrations and their imports (`AboutPage`, `ClinicianPage`).
- Add `/impressum`, `/de/impressum`, `/za/impressum` → `ImpressumPage`.

Update header nav (`Header.tsx`) and any inline links to `/about` or `/clinician` — repoint or drop. Leave the page files in place (unreferenced) to avoid touching unrelated logic, or delete if cleanly unreferenced after search.

Sitemap (`scripts/generate-sitemap.ts` + regenerate `public/sitemap.xml`):
- Drop `/about` and `/clinician`.
- Add `/impressum` with the three market variants and reciprocal hreflang entries.

## 2. Market-aware SEO on cart / checkout / success / cancel

Audit + fix each page so deep links to `/de/cart`, `/za/cart`, `/de/checkout`, `/za/checkout`, `/de/checkout/success`, `/za/checkout/success`, `/de/checkout/cancel`, `/za/checkout/cancel` emit:
- correct `<html lang>` (de for `/de`, en otherwise)
- canonical pointing to the active market URL
- reciprocal `hreflang` alternates (`en`, `en-ZA`, `de-DE`, `x-default`) built via `buildAlternates(genericPath)`
- `noindex` retained where it already is (cart/checkout funnel pages should stay noindex per SEO best practice, but still ship correct canonical + hreflang)

Files: `CartPage.tsx`, `CheckoutPage.tsx`, `CheckoutSuccessPage.tsx`, `CheckoutCancelPage.tsx`. Use the existing `useMarket()` + `buildAlternates()` helpers, mirroring the pattern already in `HomePage`/`ShopPage`.

## 3. Vitest regression tests for market routing + SEO

Add `src/test/market-routing.test.tsx` covering:

| Component | Asserts |
|---|---|
| `ProductCard` under `/de` | "View" + image link href is `/de/product/:slug`; multi-variant "Add" navigates to `/de/product/:slug#variants` |
| `ProductCard` under `/za` | Same as above with `/za` prefix |
| `Footer` under `/de` & `/za` | Shop / category / Impressum links carry the active market prefix |
| `CartDrawer` under `/de` & `/za` | "View cart" / "Checkout" CTAs point to `/{market}/cart` and `/{market}/checkout` |
| `CartPage` under `/de` & `/za` | "Continue shopping" + "Checkout" link to market-prefixed paths |
| `CheckoutPage` under `/de` & `/za` | Default shipping country matches market; back-to-cart link is market-prefixed |

Add `src/test/market-seo.test.tsx` covering canonical + hreflang emission for Home, Shop, Product, Cart, Checkout, CheckoutSuccess, CheckoutCancel, Impressum under both `/de` and `/za`. Render via `MemoryRouter` + `HelmetProvider`, then read `Helmet.peek()` (server-side helmet API) to assert canonical href and the four `hreflang` entries.

Test infra:
- Use existing `vitest` + `@testing-library/react` + `jsdom` setup.
- Add a small `renderWithMarket(ui, path)` helper wrapping `MemoryRouter` + required providers (`HelmetProvider`, `CurrencyProvider`, `CartProvider`).
- Mock `supabase` client and any network calls used by the heavier pages (Checkout/Cart) to keep tests pure render assertions.

## 4. Out of scope

- Translating Impressum body copy beyond the bilingual header/labels.
- Adding `/impressum` to header nav (footer-only, matching standard practice).
- Server-side hreflang (sitemap already carries `xhtml:link` entries from the prior step).

## Files touched

- New: `src/pages/ImpressumPage.tsx`, `src/test/market-routing.test.tsx`, `src/test/market-seo.test.tsx`, `src/test/_marketHelpers.tsx`
- Edit: `src/App.tsx`, `src/components/Footer.tsx`, `src/components/Header.tsx` (if About/Clinician linked), `src/pages/CartPage.tsx`, `src/pages/CheckoutPage.tsx`, `src/pages/CheckoutSuccessPage.tsx`, `src/pages/CheckoutCancelPage.tsx`, `scripts/generate-sitemap.ts`, `public/sitemap.xml`, `public/sitemap-meta.json`
