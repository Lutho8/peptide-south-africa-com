## Competitive read

**peptides.co.za** — generic banner ("15 Years Experience"), green/black template, no products above the fold, no urgency, weak typography. Easy to beat on credibility + product visibility.

**vrilpeptides.com** — cinematic black-and-white hero, single "SHOP →" CTA, 4 trust stats (Compounds / Purity / Shipping / Pay), then a clean compound grid with PURITY % on every card. Premium aesthetic, no urgency, no protocols, no clinician.

**Our edge to lean into**: HPLC purity % on every card (matches Vril), ZAR pricing, named clinician, guided protocols, urgency + scarcity, live activity — none of which they have.

## Goal

Replace the current quiz-funnel hero with a **shop-first hero** that puts product, price, purity and a one-click "Add to Cart" above the fold, plus cinematic motion. Conversion elements ship first; creative motion second.

## What the new hero must contain (above the fold, in priority order)

1. **Eyebrow trust bar** — "≥99% HPLC · COA on every batch · Ships from South Africa in 1–3 days"
2. **Hero headline (shop-led, not funnel-led)** — e.g. *"Research-grade peptides. Delivered in 48 hours."* with gradient accent on the differentiator.
3. **Sub-line** — single sentence on third-party testing + ZAR pricing transparency.
4. **Dual CTA** — primary "Shop Peptides →" (to `/shop`), secondary "Find My Protocol" (to `/quiz`). Shop wins visual weight.
5. **Live trust stat strip** (Vril-style, 4 tiles): Compounds (count from `products.ts`), Purity (≥99% HPLC), Shipping (1–3 days SA), Pay (Card · EFT · Crypto).
6. **Featured product rail** — horizontally-scrolling card carousel of 4–6 best-sellers (RT3, BPC-157, GLOW Stack, GHK-Cu, Tirzepatide, Tesamorelin) showing image, purity %, ZAR price, and an inline **Add to Cart** button (uses existing `CartContext`). This is the single biggest conversion lift vs. both competitors.
7. **Urgency ribbon under rail** — "🔥 23 orders in the last 24 hours · Free shipping over R1,500 · Code RIDETHETIDE10 for 10% off first order"
8. **Mini social proof** — compact star rating ("4.9 / 5 from 1,200+ South African researchers") + 1-line testimonial.

## Conversion elements (ship first — P0)

- Featured product rail with inline Add-to-Cart (no extra page view needed).
- Live order count / urgency ribbon.
- Stock-status pill on each featured card ("In stock · ships today" vs "Only 4 left").
- Sticky "Add to Cart" toast confirmation reusing existing toaster.
- Persist quiz CTA but demote it visually — the funnel still exists for high-intent buyers; the shop is now the default path.

## Creative / cinematic layer (ship second — P1, must not delay P0)

- **Cursor-following gradient orb** — soft blurred radial gradient that tracks `mousemove` behind the hero text. Pure CSS transform + `requestAnimationFrame`, no library.
- **Scroll-driven 3D vial** — a single floating peptide vial in the hero corner that rotates and parallax-shifts on scroll. Implementation choice: lightweight CSS 3D transform tied to `scrollY` (no Three.js) to keep bundle small. If user later wants real 3D, swap to `@react-three/fiber@^8.18` + a low-poly vial.
- **Cinematic section transitions** — wrap each homepage section in a Framer-Motion `whileInView` fade + slow upward translate (600ms ease-out). Add Framer Motion (`framer-motion`) — already commonly used in the project's animation tokens.
- **Marquee trust bar** — reuse existing `.marquee` utility for the "AS SEEN IN" / purity claims band right under the hero.
- **Micro-interactions** — product cards lift + glow on hover (already partially present), CTA button has a subtle sheen sweep.

## Files to change

- **Edit** `src/pages/HomePage.tsx` — replace the entire HERO `<section>` (lines ~75–184) with the new shop-first hero. Keep all sections below intact.
- **Create** `src/components/HeroShop.tsx` — the new hero (headline, CTAs, trust stats, urgency ribbon).
- **Create** `src/components/FeaturedProductRail.tsx` — horizontal scroll rail with inline Add-to-Cart, pulls from `products.ts` (filter by `tag === "Best Seller"` or a hand-picked id list).
- **Create** `src/components/CursorOrb.tsx` — cursor-tracking gradient blob, mounted inside HeroShop, `pointer-events-none`, hidden on mobile + when `prefers-reduced-motion`.
- **Create** `src/components/FloatingVial.tsx` — scroll-parallax 3D-transformed vial in hero corner (CSS-only, hidden on mobile).
- **Create** `src/components/SectionReveal.tsx` — reusable Framer-Motion wrapper for cinematic section entrances; apply to existing HomePage sections.
- **Edit** `src/index.css` — add 1–2 keyframes (sheen sweep on primary CTA, slow gradient drift behind hero) and a `prefers-reduced-motion` guard.
- **Add dep** `framer-motion` (latest compatible with React 18).

## Out of scope

- Three.js / @react-three/fiber (defer until user explicitly wants real 3D — CSS approach ships faster and avoids ~150KB bundle).
- Touching ProductCard, CartContext, or any business logic.
- Other pages (Shop, Product, Checkout) — homepage hero only.

## Acceptance

- Above-the-fold on 1090×732 (current viewport) shows: headline, dual CTA, 4 trust stats, and the first 2–3 featured product cards with prices + Add-to-Cart.
- Clicking Add-to-Cart on the rail adds the item via existing CartContext and opens the cart drawer.
- Cursor orb tracks mouse on desktop, disabled on mobile + reduced-motion.
- All sections fade-up on scroll into view.
- No regressions on mobile (rail becomes swipeable, vial + orb hidden, CTAs stack).
