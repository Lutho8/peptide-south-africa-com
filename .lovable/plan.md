## Goal
1. Smoke-test checkout end-to-end in EUR and ZAR (incl. success/cancel redirects).
2. Sweep remaining pages for ZAR-only / South-Africa-only wording and make them dual-market (DE/EU + ZA), with copy available in German, English, and Afrikaans where it's user-facing.

---

## Part 1 — Checkout smoke test (browser)

Run through the live preview:
1. Load `/`, accept age modal, toggle currency EUR ↔ ZAR — verify prices update everywhere (PDP, cards, cart drawer).
2. Add 1–2 products → `/cart` → verify totals match selected currency and free-shipping threshold (€75 / R1,500) renders correctly.
3. `/checkout` in **EUR**: click "Pay Now" → expect the Edge Function call. Since `NOWPAYMENTS_API_KEY` is not yet set, the function returns 503 — confirm the UI surfaces a friendly error toast instead of crashing. Fix the error handler if needed.
4. Repeat in **ZAR** — confirm `currency: "ZAR"` is sent in the request body and totals are converted correctly.
5. Manually visit `/checkout/success` and `/checkout/cancel` — confirm both routes render, link back to `/shop`, and pull the right copy.
6. Record findings (screenshots + any console/network errors) and patch only what breaks.

Note: a true end-to-end payment cannot be completed today (keys arrive tomorrow). The test verifies UI, routing, currency wiring, and graceful 503 handling.

---

## Part 2 — Dual-market copy sweep

Audit & update the files below. Add EU/Germany equivalents next to existing SA copy; keep tone clinical.

**Hard ZAR / SA-only references to fix:**
- `src/components/DeliveryReturnsAccordion.tsx` — add DE/EU shipping window + DHL.
- `src/components/CheckoutTrustBar.tsx` — add EU trust signals (SEPA, GDPR).
- `src/components/LiveActivity.tsx` — mix DE cities (Berlin, München, Hamburg) into the rotation alongside Joburg/Cape Town.
- `src/pages/ShippingPolicyPage.tsx` — dual table: ZA (1–3d, R1,500 free) vs DE/EU (4–7d, €75 free).
- `src/pages/RefundPolicyPage.tsx` — add EU 14-day Widerrufsrecht clause.
- `src/pages/TermsPage.tsx` / `PrivacyPolicyPage.tsx` — note dual jurisdiction (SA POPIA + DE/EU GDPR).
- `src/pages/FAQPage.tsx` — add "Shipping to Germany / EU" Q&A.
- `src/pages/AboutPage.tsx`, `HomePage.tsx`, `ClinicianPage.tsx`, `FatLossProtocolPage.tsx`, `QuizFunnelPage.tsx`, `ResearchHubPage.tsx`, `TrackOrderPage.tsx` — replace any "South Africa only" / Rand-only phrasing with dual-market wording.
- `src/components/ProductReviews.tsx` — diversify reviewer locations.
- `src/components/SEO.tsx`, `src/lib/seo.ts` — add `de-DE` + `en-ZA` hreflang alternates; OG locale alternates.
- `src/data/products.ts` — scrub any leftover ZAR-only blurbs in descriptions/badges.

**Trilingual strings (DE + EN + AF):**
- Centralize the small set of marketing micro-copy that needs translation (announcement bar, hero subline, age modal, trust strip, footer trust, shipping line, checkout CTA, success/cancel pages) into a tiny `src/lib/copy.ts` map: `{ en, de, af }` per key.
- Default to English; render German alongside English on EU-facing strips (already the pattern in `Footer.tsx` "Laborgeprüfte Reinheit"). Afrikaans appears next to English on SA-facing strips (e.g., shipping note "Versending 1–3 dae").
- Not introducing i18n routing or a language switcher in this pass — just static side-by-side trilingual labels where appropriate. (Flag for follow-up if the user wants a full switcher.)

**Out of scope here:** translating long-form legal pages (Terms/Privacy/Refund) into all three languages — that needs a separate translation pass. We'll add a banner noting "Deutsche Übersetzung folgt" on those pages.

---

## Technical notes
- No DB or edge-function changes required.
- No new dependencies.
- All copy changes use existing semantic tokens; no color/typography drift.
- After edits, re-run the smoke test in both currencies to confirm nothing regressed.

---

## Deliverables
- Smoke-test report (pass/fail per step, with any fixes applied).
- Updated pages/components listed above with dual-market + trilingual micro-copy.
- `src/lib/copy.ts` as the single source for translatable strings.