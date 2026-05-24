## Plan: Legal-page copy sweep + footer hardening

### 1. Copy sweep — remove remaining Germany/EU/DE text

Goal: clean SA-only English copy in every legal page and supporting component.

- **`src/pages/ShippingPolicyPage.tsx`** — Rewrite as SA-only. Drop "Dual-market", "Germany & EU", DHL/EU table rows, German sentences, EU customs section, "€75 free". New copy: same-day dispatch before 14:00 SAST, Aramex/PEP Paxi 1–5 business days, free over R1,500, discreet packaging. Update title/description/`shippingSchema` and `SITE_URL` to `https://www.ridethetide.site`.
- **`src/pages/RefundPolicyPage.tsx`** — Remove section 3 "EU 14-Day Right of Withdrawal · Widerrufsrecht" entirely. Update SEO title/description (drop "EU 14-Day Widerrufsrecht"). Update `SITE_URL`.
- **`src/pages/TermsPage.tsx`** — Section 10 (Payment): drop EUR-default copy, state "Prices in ZAR. Payment via NowPayments (cards, Apple/Google Pay, EFT, crypto)." Section 20 (Governing Law): keep SA paragraph only; remove EU/BGB/Rome I paragraph. Update SEO title/description and `SITE_URL`.
- **`src/pages/PrivacyPolicyPage.tsx`** — Remove GDPR/BDSG references; keep POPIA. Trim section 8 to POPIA rights; section 9 to POPIA cross-border only. Update SEO + `SITE_URL`.
- **`src/pages/ImpressumPage.tsx`** — Already hard-codes `isDe = false`. Keep page (legal-notice content is still useful) but remove the bilingual scaffolding: drop the §5 TMG/§18 MStV wording, leave clean English "Legal Notice" with CIPC company details. Title becomes "Legal Notice".
- **`src/pages/AboutPage.tsx`** — Remove German testimonial (Lisa R. / München), tweak "German Certified Compounds" credential to "Pharmaceutical-Grade Compounds", drop "across South Africa — at prices…" Germany framing in SEO description ("Serving researchers in Germany and South Africa" → "Serving researchers across South Africa").
- **`src/pages/CheckoutPage.tsx`** — Default `marketDefaultCountry` becomes `"South Africa"`; drop Germany branches; remove `Germany` from SHIP_KEY accepted values.
- **`public/sitemap.xml`** — Static file is already SA-only after previous sweep; verify no stale DE entries (none present).

### 2. SEO validation for legal pages

Standardize every legal page's `<SEO>` call so it emits the canonical `en-ZA` + `en` + `x-default` alternates from `buildAlternates(path)` and a Cape Town-correct meta set.

- Pass `alternates={buildAlternates("/impressum" | "/terms" | "/privacy" | "/shipping" | "/refund")}` explicitly.
- Pass `lang="en"`.
- Confirm SEO.tsx already injects geo (ZA-WC, -33.9249/18.4241) and `og:locale=en_ZA` — no change needed.
- Replace stale `SITE_URL = "https://tide-shop-clone.lovable.app"` constants in the JSON-LD with `https://www.ridethetide.site`.

### 3. Footer bottom legal bar — responsive wrapping

Current bar uses `flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs` with `·` separators that are siblings of links — separators can land at line starts and links can break mid-text on narrow screens.

Fix in `src/components/Footer.tsx`:
- Wrap each `Link` + following separator in a single inline-flex group so the dot never wraps to a new line alone.
- Use `whitespace-nowrap` on each link.
- Hide the trailing separator after the last link via `last:hidden` pattern.
- Bump container to `gap-x-3 gap-y-2 px-4` and ensure `max-w` allows wrap on 320px viewports.

### 4. Market-aware routing on legal links

Site is locked to a single market via `useMarket` (always `{market: "default", basePath: ""}`) and `marketPath` is identity. To match the request shape and future-proof, route the footer's Terms/Privacy/Shipping/Refund/Impressum links through `marketPath`:

- Import `useMarket`, `marketPath` in `Footer.tsx`.
- Compute `const mp = (p: string) => marketPath(p, market)` and apply to all 5 legal `<Link to=...>`s.
- Behavior is unchanged today (identity), but the indirection is in place so the contract is honored.

### 5. Regression tests

Add `src/test/footer.test.tsx` (vitest + @testing-library/react). Renders `<Footer />` inside `MemoryRouter` + required providers (Auth + Cart context shims or a minimal wrapper).

Assertions:
- Bottom legal `<nav aria-label="Legal">` exists.
- It contains links in order: Impressum, Terms & Conditions, Privacy Policy, Shipping Policy, Refund Policy.
- Each link points at the expected canonical path (`/impressum`, `/terms`, `/privacy`, `/shipping`, `/refund`).
- The Impressum link is the first child of the legal nav (guards against regression where it gets moved out of the bottom bar).

Also extend `src/test/market-routing.test.tsx` with:
- A case asserting `marketPath("/impressum")`, `/terms`, `/privacy`, `/shipping`, `/refund` all remain identity.
- A case asserting `buildAlternates("/impressum")` includes `en-ZA`, `en`, `x-default` and excludes `de-DE`.

### Files touched

Edited:
- `src/pages/ShippingPolicyPage.tsx`
- `src/pages/RefundPolicyPage.tsx`
- `src/pages/TermsPage.tsx`
- `src/pages/PrivacyPolicyPage.tsx`
- `src/pages/ImpressumPage.tsx`
- `src/pages/AboutPage.tsx`
- `src/pages/CheckoutPage.tsx`
- `src/components/Footer.tsx`
- `src/test/market-routing.test.tsx`

New:
- `src/test/footer.test.tsx`

### Out of scope

- No change to `useMarket`/`CurrencyContext` semantics (still single-market).
- No change to Shopify/checkout business logic.
- No new auth, RLS, or DB work.
