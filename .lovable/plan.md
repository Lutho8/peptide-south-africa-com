## Goal

Tighten the existing SEO foundation (already using `react-helmet-async` + per-page `<SEO>` + JSON-LD + sitemap generator) so the site sends clean dual-market signals for Germany and South Africa, without duplicating or breaking what already ships.

Most pieces requested are already in place — the work is **consolidation, copy fixes, and three missing additions**, not a from-scratch rebuild.

---

## What already exists (no change needed)

- `react-helmet-async` wired in `src/main.tsx`; every page imports `@/components/SEO`.
- `SEO.tsx` already emits dynamic `<title>`, description, canonical, hreflang (en-ZA / en-GB / de-DE / af-ZA / x-default), OG dual locale, Twitter card, geo tags, and JSON-LD.
- `Breadcrumbs.tsx` already renders BreadcrumbList JSON-LD + visible nav, used on 9 pages.
- `scripts/generate-sitemap.ts` already generates sitemap.xml on `predev`/`prebuild` including product slugs with priorities.
- `robots.txt` already disallows admin/auth/checkout and lists the sitemap.
- Google site verification meta already in `index.html`.

These will be **edited in place, not rewritten**.

---

## 1. `src/components/SEO.tsx` — tighten and add missing bits

- Add `<html lang={lang}>` driven by a new optional `lang` prop (default `"en"`) — Helmet supports `<html>` attributes. This is the only way to flip `<html lang>` per route in a Vite/CSR app.
- Add per-route `<meta name="keywords">` accepting an optional `keywords` prop; default to bilingual fallback covering both markets.
- Add `<meta name="distribution" content="global" />`.
- Replace the R2 default OG image fallback with `${SITE_URL}/og-default.jpg` if present; otherwise drop `og:image` entirely (per head-meta guideline: better no image than a placeholder). Leave existing per-page overrides intact.
- Keep current hreflang block (en-ZA / en-GB / de-DE / af-ZA / x-default) — this is broader and more correct than the brief's smaller set.

## 2. `index.html` — sitewide head fixes

- Update `<title>` and `<meta name="description">` to the brief's homepage strings (dual-market wording instead of SA-only).
- Update `<meta name="keywords">` to the brief's bilingual EN+DE list.
- Add `<meta name="distribution" content="global" />`.
- Add `<link rel="preconnect" href="https://api.nowpayments.io" />` and `<link rel="dns-prefetch" href="https://api.nowpayments.io" />`.
- Add sitewide JSON-LD `Organization` and `WebSite` (with `SearchAction`) blocks per the brief.
- Add sitewide CSS guard: `<style>#lovable-badge{display:none !important;}</style>` (belt-and-braces; the real removal is via the badge-visibility tool).
- Leave the existing canonical and og:* in place as fallbacks for non-JS crawlers (per head-meta guideline).

## 3. Per-page copy + Helmet props (no new components)

Update the `title` / `description` strings already passed into `<SEO>` so they match the brief's dual-market copy, on these pages only:

- `HomePage.tsx` — homepage title/desc + H1 changes to "Premium Research Peptides for Germany & South Africa".
- `ShopPage.tsx` — shop title/desc; H1 "Shop Research Peptides".
- `AboutPage.tsx` — about title/desc.
- `FAQPage.tsx` — FAQ title/desc; expand existing FAQPage JSON-LD `mainEntity` to include the six Q&A from the brief (ship, purity, human use, payments, storage, DE shipping).
- `ResearchHubPage.tsx` — research title/desc.
- `ProductPage.tsx` — extend existing Product JSON-LD with `shippingDetails` (EUR €7.50 / DE) and `priceValidUntil` (year-end). Confirm H1 = product name. Add `loading="lazy"` to gallery images below the fold.

H1 audits are limited to the five pages above; no broad heading-restructure sweep.

## 4. Breadcrumbs on cart + checkout

Add `<Breadcrumbs>` to `CartPage.tsx` (Home > Cart) and `CheckoutPage.tsx` (Home > Cart > Checkout). These pages are noindex, so the JSON-LD won't be indexed but the visible nav improves UX consistency.

## 5. `public/robots.txt`

- Remove `Disallow: /cart` from each user-agent block (brief wants cart crawlable; current blocks it). Keep admin/auth/checkout blocked.
- Add `Disallow: /api/` to each block.
- Leave the AI-crawler allow-list as-is (already excellent, not in brief).

## 6. `scripts/generate-sitemap.ts`

- Adjust priorities to match the brief: `/shop` → 0.9, products → 0.8, `/research` → 0.6. Other entries stay.
- No structural changes.

## 7. `src/components/Footer.tsx` — internal-linking section

Add a 4-column link grid above the existing footer body using the brief's Shop / Support / Legal / About structure. Categories ("Fat Loss Peptides", "Healing Peptides", etc.) link to `/shop?category=...` (existing shop accepts a query param — verify; if not, link to `/shop` and add a memory item to revisit). Keep the newsletter + bottom bar as-is.

## 8. Lovable badge

Call `publish_settings--set_badge_visibility` with `hide_badge: true` (requires Pro; if it errors with plan-required, surface that to the user and keep the CSS guard from §2 as the fallback). Do not write any tool-specific instructions into the prompt.

## 9. Page-speed quick wins

- Add `loading="lazy"` to product images on `ShopPage.tsx` and `ProductPage.tsx` gallery (where missing).
- Resource hints already added in §2.

## 10. Verification

After edits, run the sitemap generator once via `bunx tsx scripts/generate-sitemap.ts` and confirm `public/sitemap.xml` regenerates cleanly. Read `index.html` and `SEO.tsx` to sanity-check tag dedup (no double canonicals, no double `og:title`).

---

## Out of scope

- Per-route language switcher / `?lang=de` server rendering (CSR app — no per-locale URLs to advertise).
- Replacing the existing hreflang block with the brief's narrower 3-entry set — current 5-entry set is strictly better.
- Migrating to SSR for accurate social-preview crawlers — flagged as a known limitation, not a fix here.
- Image format conversion to WebP (asset-pipeline change, large effort, not blocking indexability).
- Adding `aggregateRating` invented numbers (`4.9 / 1200 reviews`) — only emit if real data exists, otherwise omit the field per Google's structured-data policy.

## Files touched

- `src/components/SEO.tsx`
- `index.html`
- `src/pages/HomePage.tsx`, `ShopPage.tsx`, `AboutPage.tsx`, `FAQPage.tsx`, `ResearchHubPage.tsx`, `ProductPage.tsx`, `CartPage.tsx`, `CheckoutPage.tsx`
- `src/components/Footer.tsx`
- `public/robots.txt`
- `scripts/generate-sitemap.ts`

Plus one tool call: `publish_settings--set_badge_visibility`.
