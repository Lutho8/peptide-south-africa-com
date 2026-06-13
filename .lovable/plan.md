## Scope

Four focused changes — UI/presentation only, no backend or payment-logic changes.

### 1. Clearer checkout flow

Currently the Header has no cart icon, so users can't see what's in their cart from anywhere on the site. Add a persistent cart entry point:

- **Header (desktop + mobile):** Add a cart icon button with a live item-count badge that opens the existing `CartDrawer`. Sits next to Account on desktop, next to the menu button on mobile.
- **CartDrawer:** Make the primary "Checkout" button more prominent (full-width, bigger) and surface a short progress hint: `Cart → Shipping → Pay`.
- **CheckoutPage:** Add a 3-step progress indicator (Cart · Details · Pay) at the top so users feel oriented.
- **ShopPage / ProductPage:** After "Add to cart", the drawer already opens — add a clearer "Go to Checkout" CTA inside the drawer's success state.

### 2. Remove "Get Started" CTA, keep "Book Consult"

- Remove **Get Started** button from `Header.tsx` (desktop nav, line 124-129) and the mobile "Start" pill (line 133-138).
- Remove **Get Started** CTAs from `AboutPage.tsx`, `FatLossProtocolPage.tsx` (3 instances), `QuizFunnelPage.tsx`.
- Keep **Book Consult** in the header as the single primary nav CTA.
- Leave **Book a Consultation** buttons on FatLossProtocolPage intact.

### 3. Product catalog: only 1-vial and 3-pack

- `ProductCard.tsx`: change variant filter from `pack === 3 || pack === 5` to `pack === 1 || pack === 3`. Default selection becomes 3-pack.
- `data/products.ts`: remove the 5-Pack variant from the generator and update the comment. (10-pack stays available on PDP only.)
- PDP (`ProductPage.tsx`): audit and remove any explicit 5-pack callouts; keep 1, 3, and 10-pack tiers available.

### 4. Mobile video experience

- **Hero video** (`HeroShop.tsx`): keep autoplay but add `poster` fallback display when `prefers-reduced-data` or slow connection — already partially handled, verify it renders on mobile (not hidden by scrim z-index).
- **SupportVideosSection** (the swipeable Tide Talk reels): on mobile the IntersectionObserver threshold of 0.35 + `preload="none"` can prevent the first clip from ever loading. Fix:
  - Eager-set `src` for the first clip so it has a visible frame on load.
  - Lower IO threshold to 0.15 on mobile.
  - Add `poster` images so the tile is never blank.
  - Ensure container `overflow-x-auto` + snap works in iOS Safari (add `-webkit-overflow-scrolling: touch`).

### Broader mobile polish

- Tighten Header height on mobile (reduce padding).
- Verify CartDrawer is full-width on mobile (`w-full sm:w-[420px]`).
- Verify CheckoutPage form stacks cleanly at 375px width; ensure inputs are min 44px tall.
- Verify sticky mobile CTA (`StickyMobileCTA`) doesn't overlap the cart drawer or footer CTAs.

## Out of scope

- No changes to payment processor, edge functions, or order/database schema.
- No changes to product pricing math (only the variant filter on cards).
- No new pages.

## Files touched

`src/components/Header.tsx`, `src/components/CartDrawer.tsx`, `src/components/ProductCard.tsx`, `src/components/SupportVideosSection.tsx`, `src/components/HeroShop.tsx`, `src/data/products.ts`, `src/pages/CheckoutPage.tsx`, `src/pages/AboutPage.tsx`, `src/pages/FatLossProtocolPage.tsx`, `src/pages/QuizFunnelPage.tsx`, `src/pages/ProductPage.tsx`.
