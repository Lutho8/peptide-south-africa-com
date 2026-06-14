# Plan: Peptide South Africa — Conversion-First Telehealth Rebrand

A full rebrand + funnel restructure focused on the single KPI: **Assessment → Checkout**. No new backend tables are required; this is presentation, copy, routing, and conversion plumbing on top of the existing shop + quiz + Cloud stack.

---

## 1. Brand & Identity

- **Name everywhere:** "Ride The Tide" → **Peptide South Africa**
  - Files: `src/components/Header.tsx`, `Footer.tsx`, `src/lib/copy.ts`, `src/lib/marketCopy.ts`, `index.html` (title, OG, meta), `public/sitemap-meta.json`, `SECURITY.md`, `README.md`, blog signatures.
- **Logo:** new wordmark "Peptide South Africa" with a small RX/peptide-chain glyph. Generated via imagegen (premium, transparent), saved to `src/assets/logo-peptide-sa.png` + asset pointer.
- **Tagline:** "South Africa's First Peptide-Forward Telehealth Platform."
- **Design tokens (`src/index.css`, `tailwind.config.ts`):** refine current navy/teal into a luxury telehealth palette:
  - `--bg`: warm off-white #FAF8F4
  - `--ink`: deep navy #0A1B2E
  - `--accent`: medical teal #008C7A (slightly desaturated)
  - `--gold`: #B8945A (luxury accent, used sparingly on CTAs/dividers)
  - Type pair: **Instrument Serif** (display) + **Inter Tight** (UI/body) — distinct from current Inter/default.
  - Generous whitespace, hairline dividers, soft shadows, 1px gold rules.
- **Favicon + OG image** regenerated.

## 2. Domain

- Update SEO canonical + sitemap base URL → `https://peptide-south-africa.com`.
- Files: `src/lib/seo.ts`, `src/components/SEO.tsx`, `public/sitemap.xml`, `public/sitemap-meta.json`, `scripts/generate-sitemap.ts`, `index.html` canonical.
- Tell the user to attach `peptide-south-africa.com` (already on Cloudflare) in Lovable → Project Settings → Domains (A → 185.158.133.1 with Cloudflare proxy mode enabled). I'll provide the exact steps in chat — Lovable issues the cert automatically.

## 3. Homepage Restructure (`src/pages/HomePage.tsx`)

Replace current sections with the prescribed 7:

1. **Hero** — H1 "Get Your Personalised Health Plan in 1 Minute" • sub "Complete a quick assessment and discover the peptides designed for your goals." • single primary CTA **Take Assessment** → `/assessment`. Secondary muted link: "Browse programs". Trust strip below: SAHPRA-aligned · GP-led · POPIA. Full-bleed editorial visual right side.
2. **Choose Your Goal** — 5 large cards (Lose Weight, Improve Recovery, Increase Energy, Age Better, Improve Performance). Each card deep-links into the assessment with `?goal=` prefilled.
3. **How It Works** — 5 numbered steps (Assess → Recommend → Join → Clinical Review → Start).
4. **Programs** — keep existing program rail (`FeaturedProductRail` reskinned as "Programs" with membership framing, not vials).
5. **Success Stories** — keep current testimonials.
6. **FAQ** — keep, retitle questions around programs + clinical review.
7. **Final CTA** — full-width band, "Get Peptide Plan" → `/assessment`.

Remove from homepage: discount popup competing with assessment CTA (keep but delay to 30s and only if no quiz interaction), age-gate stays.

## 4. Assessment Funnel (`src/pages/QuizFunnelPage.tsx` → `/assessment`)

- Add route alias `/assessment` (keep `/quiz` as redirect).
- Tighten to **9 questions**, ≤3 min, progress bar, one question per screen:
  Goal → Age → Gender → Weight → Height → Activity → Primary Challenge → Medical Conditions → Current Medications.
- Output screen: **Health Score** (0–100, computed client-side from inputs), **Program Recommendation** (maps to existing programs in `src/data/products.ts`), **Estimated Timeline**, **Recommended Membership tier**.
- Primary CTA on results: **Start Program — RXXX/mo** → adds membership to cart → `/checkout`. Secondary: "See what's included".
- Persist answers to `localStorage` + (if logged in) the existing `cart_snapshots` table so clinical review has context post-purchase. No new tables.

## 5. Checkout-Before-Review Flow

- Checkout (`/checkout`) unchanged in mechanics (PayFast). Reframe copy:
  - Order summary header: "Your Program Membership".
  - Below totals: subtle one-liner — *"Where clinically required, a licensed physician will review your eligibility before treatment activation."*
  - Remove any "book consultation / schedule doctor / wait for approval" wording (audit `src/lib/copy.ts`, `CheckoutPage.tsx`, `CheckoutSuccessPage.tsx`, `ClinicianPage.tsx`).
- Success page becomes **Activation page**: "You're in. Complete your clinical verification →" with the medical intake form (existing onboarding), framed as activation, not gating.

## 6. Header / Nav / Mobile

- Nav: Programs · How It Works · Science · About · **Take Assessment** (primary button, gold).
- Sticky mobile CTA → "Take Assessment" (replaces current cart-centric CTA on non-product pages).
- Remove "Book consultation" entry points sitewide.

## 7. Copy Audit

Single pass through `src/lib/copy.ts`, `marketCopy.ts`, all page headers, and FAQ entries to remove consultation-first language and reframe around outcomes (Weight Loss, Longevity, Recovery, Energy, Performance). Peptides = engine, outcomes = product.

## 8. Analytics / KPI Instrumentation

- Add lightweight event helper `src/lib/analytics.ts` wrapping `window.dataLayer.push` (GA4 already loaded):
  - `assessment_start`, `assessment_complete`, `program_recommended`, `checkout_start`, `checkout_complete`, `activation_complete`.
- Primary funnel report: assessment_complete → checkout_complete.

## 9. Out of Scope (this plan)

- Payment provider changes (PayFast stays).
- New database tables or RLS changes.
- Open security findings in the More panel (PayFast realtime, generate-protocol auth, etc.) — tracked separately; flag at the end so you can approve a follow-up.
- Building a physician dashboard.

---

## File-Level Summary

**Edit:** `index.html`, `src/index.css`, `tailwind.config.ts`, `src/lib/copy.ts`, `src/lib/marketCopy.ts`, `src/lib/seo.ts`, `src/components/Header.tsx`, `Footer.tsx`, `SEO.tsx`, `StickyMobileCTA.tsx`, `DiscountPopup.tsx`, `src/pages/HomePage.tsx`, `QuizFunnelPage.tsx`, `CheckoutPage.tsx`, `CheckoutSuccessPage.tsx`, `ClinicianPage.tsx`, `App.tsx` (route alias), `public/sitemap.xml`, `sitemap-meta.json`, `scripts/generate-sitemap.ts`, `README.md`, `SECURITY.md`.

**Create:** `src/assets/logo-peptide-sa.png(.asset.json)`, new OG image, `src/components/home/ChooseYourGoal.tsx`, `HowItWorks.tsx`, `FinalCTA.tsx`, `src/lib/analytics.ts`, `src/lib/healthScore.ts`.

**Delete:** none.

---

## Confirm before I build

1. Domain: I'll wire canonical/sitemap to `peptide-south-africa.com` and give you Cloudflare DNS steps — OK?
2. Type pair **Instrument Serif + Inter Tight** with **navy + teal + gold** palette — OK or want options?
3. Keep PayFast as the only checkout (no Stripe added) — OK?
4. Defer the open security findings to a follow-up turn — OK?
