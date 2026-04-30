## Goal

Four conversion-focused upgrades:
1. Accordion FAQs on the product detail page
2. CMS-backed customer testimonials (admin-editable via Lovable Cloud)
3. Hero featured product card → cart that opens the cart drawer in place
4. Auto-apply RIDETHETIDE10 (10% off) for first-order, signed-in customers

---

## 1. Product Page — Accordion FAQs

Replace the static FAQ list at the bottom of `src/pages/ProductPage.tsx` with the existing shadcn `Accordion` component (already in `src/components/ui/accordion.tsx`).

- One `<AccordionItem>` per `product.faqs` entry, all collapsed by default, single-open behavior.
- Keep the existing `JsonLd` FAQPage schema for SEO unchanged.
- Add a few global "objection-killer" FAQs (shipping time, COA, returns, payment security, age requirement) appended to every product so even products with sparse FAQ data get strong pre-checkout reassurance.

---

## 2. CMS-backed Testimonials (Lovable Cloud)

### Database (one migration)
- New table `testimonials`: `name`, `location`, `quote`, `rating` (1–5), `photo_url`, `display_order`, `is_published`.
- New storage bucket `testimonial-photos` (public read).
- RLS:
  - Public can read **published** testimonials.
  - Only users with `admin` role can insert/update/delete.
- Add `user_roles` table + `app_role` enum + `has_role()` security-definer function (per project standards).
- Seed the table with the 5 current portraits + Sarah M. quote so nothing visually changes on first load.

### Frontend
- Refactor `src/components/CustomerProofStrip.tsx` to fetch from `testimonials` (ordered by `display_order`, only published). Keep current visual design. Falls back gracefully to a skeleton while loading.
- New admin page `/admin/testimonials`:
  - Auth-gated; redirects non-admins.
  - Table view + add/edit modal (name, location, quote, rating slider, photo upload to bucket, published toggle, display order).
  - Reachable from the footer only when the logged-in user is an admin.

### Auth
- Add lightweight email/password + Google sign-in pages (`/auth`) and `/reset-password` since admin needs to log in. No public-facing profile area.

---

## 3. Hero Card — In-Place Add to Cart

The "Buy Now" button on the hero featured-product card already calls `addToCart(hero)` (which auto-opens the cart drawer). Today the button **also navigates** because of the visible "Buy Now" CTA right next to it doing nothing extra — the experience is fine but the copy is misleading.

Adjustments in `src/components/HeroShop.tsx`:
- Rename the in-card primary button copy to **"Add to Cart — Save 10%"** and keep `addToCart` behaviour (cart drawer slides open).
- Add a secondary in-card link **"View details →"** to `/product/{slug}` for users who want more info.
- Show a small "✓ Added — discount applied" toast confirmation on click via existing `use-toast`.
- No page navigation occurs from the Add action.

---

## 4. Auto-Applied 10% First-Order Discount

### Logic
- Extend `CartContext` with: `discountCode`, `discountAmount`, `discountedTotal`, `isDiscountEligible`.
- Eligibility = signed-in user **AND** they have no prior `orders` row. (We'll add a tiny `orders` table — id, user_id, created_at, total — and write a row on successful checkout completion. Until they have one order, every cart auto-applies `RIDETHETIDE10` at 10% off.)
- When eligible, the context exposes `discountCode = "RIDETHETIDE10"` and computes `discountedTotal = totalPrice * 0.9`.
- Anonymous users see the offer banner ("Sign in to auto-apply 10% off") instead of the discount line.

### UI surfaces updated
- `CartDrawer.tsx` — adds a green "RIDETHETIDE10 applied (−10%)" row above total; total updates live.
- `CartPage.tsx` — same line in the order summary block.
- `CheckoutPage.tsx` — pre-fills the promo field, locks it (read-only), shows discounted total.
- Hero ribbon copy updated: "Sign in to auto-apply 10% off your first order."

### Order tracking
- New `orders` table with RLS (users see their own).
- On successful checkout, insert a row so the discount stops applying to subsequent carts for that user.

---

## Files Touched

**Created**
- `src/pages/AuthPage.tsx`, `src/pages/ResetPasswordPage.tsx`
- `src/pages/admin/AdminTestimonialsPage.tsx`
- `src/hooks/useUserRole.ts`, `src/hooks/useFirstOrderDiscount.ts`
- `src/components/admin/TestimonialForm.tsx`

**Edited**
- `src/pages/ProductPage.tsx` — accordion FAQs
- `src/components/CustomerProofStrip.tsx` — fetch from DB
- `src/components/HeroShop.tsx` — in-place add to cart, copy fix
- `src/context/CartContext.tsx` — discount fields
- `src/components/CartDrawer.tsx`, `src/pages/CartPage.tsx`, `src/pages/CheckoutPage.tsx` — show discount
- `src/components/AnnouncementBar.tsx` — copy update
- `src/App.tsx` — new routes
- `src/components/Footer.tsx` — admin link (conditional)

**Migration**
- `testimonials`, `user_roles`, `app_role` enum, `has_role()` function, `orders` table, RLS policies, `testimonial-photos` storage bucket, seed data.

---

## Open dependency

Implementing #4 requires authentication (email/password + Google). I'll set this up as part of the build. No additional secrets required — Google sign-in works through Lovable Cloud out of the box.

After approval I'll run the database migration first, then implement the frontend in one pass.