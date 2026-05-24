
# Targeted updates — keep store standalone, link out to ecosystem, drop Germany

Scope is additive bridges + a full Germany rip-out. No changes to checkout, Shopify, product catalogue, auth, or existing design tokens.

## 1. Tracker bridge on every product page

In `src/pages/ProductPage.tsx`, directly below the Add to Cart button (above the trust line), add a small surface card:

- Heading "Track this protocol free"
- Body "Load into your RTD Tracker and monitor your results from day one."
- CTA "Open Tracker →" linking to `https://ridethetide.info?utm_source=store&utm_medium=product_page&utm_campaign={product.slug}`
- Styled with `bg-card border border-border` + `border-l-[3px]` using an inline `borderLeftColor: "#06b6d4"`, small text, opens in new tab.

Extracted as `src/components/TrackerBridgeCard.tsx` so the product page stays readable.

## 2. Ecosystem section on homepage

New component `src/components/EcosystemSection.tsx`, inserted in `src/pages/HomePage.tsx` between the Research Hub section and the Bottom CTA (this is the slot just above the footer-adjacent CTAs; "between product grid and footer" — placing it as the last content block before the bottom CTA keeps the conversion flow intact).

Layout: full-width section, container, heading "One Ecosystem. Three Properties.", three cards in a `md:grid-cols-3` grid (stacked on mobile).

- **Card 1 — The Club**: title "Cape Town Peptide Club", body as specified, CTA "Join the Club →" → `https://capetownpeptideclub.co.za`. `border-t-[3px]` with `#0ea5e9`.
- **Card 2 — The Tracker (highlighted)**: title "RTD Protocol Tracker", body as specified, CTA "Track Free →" → `https://ridethetide.info`. `border-t-[3px]` with `#06b6d4`. Slightly lighter background (`bg-background` while siblings use `bg-card`, or vice versa depending on which reads lighter — will pick the visibly lighter one against the section background).
- **Card 3 — The Store (muted)**: title "RTD Research Peptides", body as specified, no button, "You're here" in `text-muted-foreground`. `border-t-[3px]` with `#475569`.

All external CTAs `target="_blank" rel="noopener noreferrer"`.

## 3. Floating WhatsApp button

`src/components/WhatsAppButton.tsx` already exists and is already mounted in `App.tsx`. Fix the broken number and update the message:

- Number → `491624747159` (strip the `+`, strip the zero-width space currently in the file).
- Message → `Hi, I'd like to know about RTD Peptides`.
- Keep existing 56px / `#25D366` styling.

## 4. Navigation additions

In `src/components/Header.tsx`, add two external links to the desktop nav and the mobile menu, alongside the existing items (do not remove any):

- "Tracker" → `https://ridethetide.info`
- "Club" → `https://capetownpeptideclub.co.za`

Rendered as `<a>` (not `<Link>`), `target="_blank" rel="noopener noreferrer"`, same text styling as existing nav items. Also mirror them in the footer's main nav columns for parity (small addition under an "Ecosystem" mini-list in the footer; non-disruptive).

## 5. Waitlist section on homepage

New `src/components/WaitlistSection.tsx`, inserted in `HomePage.tsx` just above the Bottom CTA (so it's the last block before the footer-adjacent CTA — true "above the footer" position).

- Heading "Launching Cape Town — October 2025"
- Subheading "Founding members receive 15% off their first order, permanently."
- Form: email (required), WhatsApp number (optional), submit button "Join the Waitlist".
- On submit: `POST` JSON to `MAKE_WEBHOOK_URL_PLACEHOLDER` constant defined at top of file. On success: show success toast, increment counter, clear form.
- Counter: read `rtd_waitlist_count` from `localStorage` (default `1`), show "{X} researchers already waiting" below the form. Increment + persist on each successful submission.
- All client-side; no backend, no Supabase table. Uses shadcn `Input` + `Button` + existing toast.

## 6. Full Germany / EUR / DE rip-out

This is the biggest change. Site becomes single-market: South Africa, English, ZAR.

**Routing (`src/App.tsx`)**: delete all `/de/...` and `/za/...` duplicate routes. Keep only the canonical single set. The market switcher and prefix scheme go away.

**Market system (`src/hooks/useMarket.ts`)**: simplify to a stub that always returns `{ market: "default", lang: "en", currency: "ZAR", basePath: "" }`, `marketPath` becomes identity, `stripMarket` becomes identity, `buildAlternates` returns just the canonical en-ZA. This keeps existing imports working without touching every consumer.

**Components removed from render tree**:
- `MarketSwitcher` — removed from `Header.tsx` (desktop + mobile).
- `CurrencySwitcher` — removed from `Header.tsx`.
- The `CurrencyProvider` wrapper in `App.tsx` stays for now (cart code reads from it); the provider will hard-default to ZAR with no toggle UI. `src/context/CurrencyContext.tsx` updated so `currency` is always `"ZAR"`, `rate` always `1`, no setter UI but the existing `format` / `display` API still works so product pages don't break.

**Copy sweep** — files containing user-visible Germany/EUR/DE strings to update:
- `src/pages/HomePage.tsx`: remove the German "Anja R." testimonial; change `Free shipping over R1,500 (SA) or €75 (DE / EU)…` to `Free shipping over R1,500 across South Africa. Same-day dispatch from Cape Town.`; remove "German Certified Quality" → "Pharmaceutical-Grade Quality".
- `src/pages/ProductPage.tsx`: shipping/trust line "🇿🇦 SA: Free over R1,500 | 🇩🇪 DE: Free over €120" → "🇿🇦 Free shipping over R1,500 across South Africa".
- `src/lib/marketCopy.ts`, `src/lib/copy.ts`, `src/lib/shipping.ts`, `src/lib/currency.ts`, `src/lib/price.ts`: strip DE/EUR branches, keep ZA logic only.
- `src/components/AnnouncementBar.tsx`, `src/components/FreeShippingBar.tsx`, `src/components/PaymentMethodsBanner.tsx`, `src/components/DeliveryReturnsAccordion.tsx`, `src/components/CheckoutTrustBar.tsx`: remove DE / EUR / "Germany" phrasing; rewrite to Cape Town / SA only.
- `src/pages/ShippingPolicyPage.tsx`, `src/pages/RefundPolicyPage.tsx`, `src/pages/ImpressumPage.tsx`, `src/pages/TermsPage.tsx`, `src/pages/PrivacyPolicyPage.tsx`, `src/pages/FAQPage.tsx`, `src/pages/AboutPage.tsx`, `src/pages/CheckoutSuccessPage.tsx`, `src/pages/CheckoutCancelPage.tsx`: remove Germany/EUR/DHL-to-Germany phrasing. Keep Impressum page (it doesn't hurt) but rewrite as a South African legal/imprint page.
- `src/lib/seo.ts` (`localBusinessSchema`, entity clusters): replace any German address/coords with Cape Town `-33.9249, 18.4241`, currency `ZAR`, country `ZA`.

**SEO & meta**:
- `index.html`: replace any geo meta (`geo.region`, `geo.position`, `ICBM`) with Cape Town coords. Remove `hreflang` alternates for `de-DE`. Strip German `og:locale:alternate`.
- `src/components/SEO.tsx` + every `buildAlternates(...)` call site: `buildAlternates` now returns one entry (en-ZA + x-default) so consumers don't need refactoring.
- `public/sitemap.xml` + `public/sitemap-meta.json` + `scripts/generate-sitemap.ts`: drop all `/de/...` URLs, drop hreflang alternates referencing `de`. Single-market sitemap only.
- `public/robots.txt` + `public/llms.txt`: scrub Germany copy.

**Tests**: `src/test/market-routing.test.tsx` currently asserts `/de` behaviour — rewrite to assert single-market routing (root only, no prefix), and confirm `marketPath("/shop")` returns `/shop`.

## Technical notes

- All new copy and components stick to existing semantic tokens (`bg-card`, `text-foreground`, `text-muted-foreground`, etc.); the only hardcoded colors are the three hexes the brief mandates for borders (`#06b6d4`, `#0ea5e9`, `#475569`) and `#25D366` for WhatsApp.
- No new dependencies, no migrations, no edge functions.
- `MAKE_WEBHOOK_URL_PLACEHOLDER` lives as a top-level const in `WaitlistSection.tsx` — clearly marked TODO so swapping it is a one-line edit later.
- The two memory files about markets/currency and DE shipping will need an update after build to reflect the ZAR-only posture, but no memory writes happen during plan mode.

## Files touched (summary)

```text
new:    src/components/TrackerBridgeCard.tsx
new:    src/components/EcosystemSection.tsx
new:    src/components/WaitlistSection.tsx
edit:   src/components/WhatsAppButton.tsx
edit:   src/components/Header.tsx
edit:   src/components/Footer.tsx
edit:   src/pages/ProductPage.tsx
edit:   src/pages/HomePage.tsx
edit:   src/App.tsx
edit:   src/hooks/useMarket.ts
edit:   src/context/CurrencyContext.tsx
edit:   src/lib/{marketCopy,copy,shipping,currency,price,seo}.ts
edit:   src/components/{AnnouncementBar,FreeShippingBar,PaymentMethodsBanner,
        DeliveryReturnsAccordion,CheckoutTrustBar,SEO}.tsx
edit:   src/pages/{ShippingPolicy,RefundPolicy,Impressum,Terms,PrivacyPolicy,
        FAQ,About,CheckoutSuccess,CheckoutCancel}Page.tsx
edit:   index.html
edit:   public/{sitemap.xml,sitemap-meta.json,robots.txt,llms.txt}
edit:   scripts/generate-sitemap.ts
edit:   src/test/market-routing.test.tsx
```
