## Goal
Turn the homepage into a conversion engine. Strip abstract copy, lead with a clear product offer + "Buy Now" CTAs, add a Vril-style cinematic hero background (light mode), insert the real-people testimonial strip, surface the 10% first-order code prominently, and remove the clinician hero block.

## Reference read
- vrilpeptides.com hero: full-bleed cinematic motion background (subtle slow-pan video / animated gradient), single dominant CTA, minimal copy.
- Uploaded reference image (5 portraits + 5-star testimonial strip): real customers, friendly, builds instant social proof.
- Current hero (uploaded screenshot) is too abstract — "Research-grade peptides delivered in 48 hours" + 4 stat tiles + tiny vial. Needs: clearer offer, dominant Buy CTA, motion, social proof.

## Changes

### 1. New cinematic light-mode hero background
- **Create** `src/components/HeroBackdrop.tsx` — full-bleed light-mode animated layer using:
  - Slow-drifting conic + radial gradients (primary teal + soft sky blue) on a near-white base.
  - A subtle animated SVG molecule / hex grid that slowly pans (CSS `@keyframes` translate, 40s loop).
  - Optional looping muted MP4/WebM (lab/peptide visuals) at 25% opacity behind the gradient — gracefully degrades to gradient-only if asset missing.
  - Respects `prefers-reduced-motion`.
- Forces light surface tones regardless of theme (uses fixed light HSL tokens) so the section feels bright like vrilpeptides but inverted.

### 2. Rebuild `HeroShop.tsx` for conversion
- Drop the 4 stat-tile column on the right. Replace with a **product offer card**:
  - Hero product image (RT3 / best-seller).
  - Name, ≥99% HPLC pill, ZAR price (strike-through original + discounted with code).
  - Primary CTA: **"Buy Now"** (full-width, large, gradient) → adds to cart + opens drawer.
  - Secondary text link: "View all peptides →".
- Left column trimmed:
  - Eyebrow trust pill (kept).
  - Headline shortened: e.g. "Premium Peptides. Shipped in 48h." (less abstract).
  - One-line subhead with the offer: **"Get 10% off your first order — code RIDETHETIDE10"** in a high-contrast ribbon.
  - Dual CTAs become: **"Buy Now"** (primary, scrolls to rail / opens shop) + "Find My Protocol" (ghost, smaller).
  - Compact urgency line (orders/24h + free shipping over R1,500).
  - 5-star micro proof line (kept).
- Remove `FloatingVial` import (visual noise; backdrop replaces it). Keep `CursorOrb` only on desktop.

### 3. Real-people social proof strip (from upload)
- **Create** `src/components/CustomerProofStrip.tsx`:
  - 5 portrait cards in a row (desktop) / horizontal scroll (mobile).
  - Centered overlay card with 5 stars + "This changed everything for me" + "— Sarah M., Johannesburg".
  - Use 5 royalty-free portrait images sourced via `imagegen` (diverse, friendly, SA-relevant) saved to `src/assets/`.
- Inserted on `HomePage` directly under `FeaturedProductRail` (replaces visual gap left by clinician removal).

### 4. 10% offer reinforcement
- **Edit** `AnnouncementBar.tsx` — make the "RIDETHETIDE10" message the first/sticky message (already exists in rotation; pin it as default).
- Hero subhead ribbon (above) repeats the code.
- Add a compact **"Apply 10% off"** chip on every featured product card price row (links to `/shop?code=RIDETHETIDE10`). Edit `FeaturedProductRail.tsx` only — leave shared `ProductCard` untouched.

### 5. "Buy Now" CTAs in key sections
- **HOW IT WORKS** bottom CTA: change "Get Started" → **"Buy Now"** linking to `/shop`.
- **THE OFFER** pricing cards: relabel "Start My Protocol" → **"Buy Now — R4,999"**, secondary card → **"Buy Monthly — R1,999"**.
- **BOTTOM CTA**: change to **"Buy Now"** + keep quiz as secondary tiny link.
- Sticky mobile CTA (already exists) — verify it reads "Buy Now" and links to `/shop`.

### 6. Remove clinician hero block
- **Edit** `src/pages/HomePage.tsx` — delete `<ClinicianHero />` and its import. Page route `/clinician` stays (footer link intact).

### 7. Light-mode safety
- The hero backdrop forces a light palette inline — no theme changes elsewhere.
- Verify text contrast (foreground HSL on near-white) — fall back to navy text inside hero.

## Files
- **Create**: `src/components/HeroBackdrop.tsx`, `src/components/CustomerProofStrip.tsx`, ~5 portrait images in `src/assets/`.
- **Edit**: `src/components/HeroShop.tsx` (major rewrite), `src/pages/HomePage.tsx` (remove clinician, add proof strip, swap CTAs), `src/components/FeaturedProductRail.tsx` (add 10% chip), `src/components/AnnouncementBar.tsx` (pin 10% message).
- **Untouched**: ProductCard, CartContext, business logic, other pages.

## Acceptance
- Above-the-fold shows: short headline, 10% offer ribbon, **Buy Now** primary CTA, hero product card with price + Buy Now, animated light backdrop, 5-star micro proof.
- Real-people testimonial strip appears mid-page, matching the uploaded reference layout.
- "Buy Now" appears as the dominant CTA in hero, pricing, and final CTA sections.
- Clinician hero gone from `/`.
- Light backdrop animates smoothly, disabled under `prefers-reduced-motion`, no mobile jank.
