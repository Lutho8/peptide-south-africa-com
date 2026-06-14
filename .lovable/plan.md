
# Peptide SA — Conversion + Brand Upgrade Plan

Scope is frontend/presentation and one data file for bundles. No new tables, no auth changes. PayFast checkout stays.

## 1. Brand polish (Whoosh-inspired)

- Refresh `src/index.css` tokens toward Whoosh palette: warm cream `#F5F1EA` background, deep ink `#0E1A1A`, sage accent `#3F5B4A`, soft clay `#C97A5B` for CTAs. Keep teal as secondary.
- Type pair: **Editorial New / Instrument Serif** for display, **JetBrains Mono** for eyebrows/labels (monospace = raw/authentic signal), **Inter Tight** for body.
- Increase H1 scale to `clamp(3rem, 7vw, 6.5rem)`, tighten tracking, add italic serif emphasis on one keyword ("*personalised*").
- Generous editorial whitespace; hairline `1px` dividers in `--ink/12%`.

## 2. Logo — bold and outstanding

- Replace the small wordmark in `Header.tsx` with a larger lockup: serif "Peptide" + monospace small-caps "SOUTH AFRICA" on a second line, total height 44–56px desktop / 36px mobile.
- Add a tiny teal dot mark next to wordmark. Sticky header gets a subtle backdrop blur on scroll only.
- Update `src/assets/logo-peptide-sa.png.asset.json` with a regenerated, higher-contrast wordmark used only for OG/social.

## 3. Hero rebuild (broader, better UX)

In `src/pages/HomePage.tsx` hero section:

- Two-column editorial grid (60/40 desktop, stacked mobile) with `display: grid` + `z-index` layering for depth.
- Left: mono eyebrow "SA'S FIRST PEPTIDE-FORWARD TELEHEALTH" → giant serif H1 "Your personalised health plan. In **60 seconds.**" → one-line supporting sentence (not duplicated) → primary CTA "Take the 60-second assessment" (clay) + secondary "How it works".
- Right: full-bleed portrait using `object-fit: cover` inside a tall card, with a floating monospace label ("PROTOCOL #014 · GLP-1 + BPC-157") positioned `position: absolute` over the image.
- Add a `FloatingProductFollower` style sticky vial that follows down the page (CSS `position: sticky` on a side rail) labelled "Your kit builds as you scroll".
- Trust strip directly under hero: "GP-led · 3rd-party lab tested · Same-day Cape Town dispatch · POPIA compliant" in mono caps.

CSS-only motion first (sticky + transforms). GSAP ScrollTrigger only if already installed; otherwise use `IntersectionObserver` + CSS for the pin effect to avoid new deps.

## 4. Dynamic program recommendation after assessment

In `src/pages/QuizFunnelPage.tsx`:

- Add `src/lib/recommendation.ts` mapping `{ goal, bmi, experience, budget } → { programId, kitId, tierId, healthScore, timelineWeeks, rationale[] }`.
- Final quiz step becomes a **Results screen** (not a redirect):
  - Health Score ring (0–100)
  - "Recommended for you: **[Kit Name]**" card with hero image, peptide list, 12-week timeline, ZAR/month price.
  - Primary CTA: "Start this program — RXXX/mo" → adds the recommended kit + membership tier to cart → `/checkout`.
  - Secondary: "See all programs" → `/shop`.
- Persist result to `localStorage.peptidesa.recommendation` so PDP/checkout can surface "Recommended for your goals" badges.

## 5. Bundled kits

- New `src/data/kits.ts` with 4 starter kits tied to assessment goals:
  - **Lean Kit** (Weight Loss): Retatrutide + B12 + Lipo-Mino
  - **Longevity Kit**: NAD+ + Epitalon + Glutathione
  - **Recovery Kit**: BPC-157 + TB-500 + Collagen peptide
  - **Performance Kit**: CJC-1295/Ipamorelin + Tesamorelin
- Each kit: name, goal, peptides[], single-pack price ZAR, monthly price ZAR, savings vs à la carte, hero image, 12-week protocol summary.
- Surface kits in:
  - `/shop` as a "Bundled Kits" rail above individual vials.
  - Homepage "Choose your goal" cards link to the matching kit, not the quiz, for users who already know.
  - PDP gets a "Frequently bundled" cross-sell using the kit that contains that peptide.

## 6. Product cards + PDP — single-vial first

`src/components/ProductCard.tsx` and `src/pages/ProductPage.tsx`:

- **Default purchase path = single vial**, single price prominent, big "Add to Cart" (clay, full width on mobile).
- Multi-pack/subscription become a secondary toggle row below ("Save 15% with 3-pack" / "Subscribe & save 20%"), collapsed by default.
- Card layout: full-bleed product photo (`object-fit: cover`, 4:5 aspect), monospace SKU/lot label overlaid bottom-left, price top-right.
- PDP: sticky right-rail buy box on desktop using `position: sticky; top: 96px` — keeps Add to Cart visible while user reads. Already partly exists via `StickyProductCTA`; consolidate.

## 7. Guarantee / certainty badge

New `src/components/GuaranteeBadge.tsx`:

- Bold circular seal: "99% PURITY · 3RD-PARTY LAB TESTED · 30-DAY REFUND" in monospace caps around a center checkmark, clay border, ink fill.
- Placed on:
  - PDP — above Add to Cart and again near reviews.
  - Cart drawer footer.
  - `/checkout` — under order summary and next to the Pay button.
  - Kit cards.

## 8. One-page checkout

Refactor `src/pages/CheckoutPage.tsx` to a single scrollable page, two columns desktop / stacked mobile:

- **Left (form)**: Contact (email + phone), Shipping (name, address, city, postcode, province — autodetect SA), Shipping method (radio: Standard R99 / Express R199 / Free over R1500), Payment = PayFast only (no card fields, single button).
- **Right (sticky summary)**: line items with thumbs, subtotal, shipping, total in big serif, GuaranteeBadge, trust row (POPIA, SSL, PayFast logos), discount code collapsible.
- Remove multi-step navigation. Validate inline with `checkoutSchema`. Single primary CTA "Pay securely — R[total]".
- Keep `cart_snapshots` write on submit; no schema changes.

## 9. Rivo-style testimonials section

Replace existing testimonials block on `HomePage.tsx` with a 3-up grid matching the attached screenshot:

- Card 1 & 3: cream card, 5 stars (serif asterisks), bold title ("Life-changing", "Metabolic Support"), quote, name + result line ("Hannah — lost 22kg"), two before/after thumbs side by side at bottom.
- Card 2 (center): full-bleed video card with rounded corners, play button overlay, name + protocol label centered at bottom (matches the Tati card layout exactly).
- Carousel arrows top-right. Reuses existing testimonial copy/video we already have — only the layout changes.

## 10. Files to touch

- Edit: `src/index.css`, `tailwind.config.ts`, `index.html` (font links), `src/components/Header.tsx`, `src/pages/HomePage.tsx`, `src/pages/QuizFunnelPage.tsx`, `src/pages/ProductPage.tsx`, `src/pages/CheckoutPage.tsx`, `src/pages/ShopPage.tsx`, `src/pages/CartPage.tsx`, `src/components/ProductCard.tsx`, `src/components/CartDrawer.tsx`, `src/components/StickyProductCTA.tsx`, `src/lib/checkoutSchema.ts` (loosen to required minimum).
- Create: `src/data/kits.ts`, `src/lib/recommendation.ts`, `src/components/GuaranteeBadge.tsx`, `src/components/RecommendationResult.tsx`, `src/components/TestimonialsRail.tsx`, `src/components/HeroEditorial.tsx`, `src/components/FloatingKitRail.tsx`.

## Out of scope

- No DB migrations, no RLS changes, no new edge functions.
- No new payment provider — PayFast stays.
- GSAP only if already installed; otherwise CSS sticky + IntersectionObserver.
- Outstanding security findings not touched in this pass.

## Open question

The Whoosh palette I'm proposing is cream + sage + clay. Confirm you want that direction, or stay on the current navy/teal/gold and only adopt Whoosh's *layout/typography* energy? Default if you don't reply: cream/sage/clay.
