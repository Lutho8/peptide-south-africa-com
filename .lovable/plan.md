## Goal

Tighten conversion across five touchpoints: standardize CRM tagging, send a single, personalized abandoned-cart reminder, surface stock urgency honestly, treat product variants as distinct cart lines, and reinforce trust on checkout.

---

## 1. Nocobase tagging & lifecycle rules

Centralize tag/stage logic in `src/lib/nocobase.ts` so every call site sends consistent data.

- Add `LeadSource` type: `"newsletter" | "discount_popup" | "quiz" | "signup" | "cart_abandoned" | "order"`.
- Add `tagsForSource(source)` and `stageForSource(source)`:
  - newsletter → stage `subscriber`, tags `["newsletter"]`
  - discount_popup → stage `lead`, tags `["discount_popup", "first_order_discount"]`
  - quiz → stage `quiz_completed`, tags `["quiz", "<quiz.goal>"]`
  - signup → stage `account_created`, tags `["signup"]`
  - cart_abandoned → stage `cart_abandoner`, tags `["cart", "abandoned_24h"]` (+ `"discount_eligible"` when applicable)
  - order → stage `customer` (or `repeat_customer` if `is_repeat`), tags `["purchase"]`
- New helper `captureLead({ email, source, extra })` that wraps `syncToNocobase("lead.upsert", …)` with the canonical stage + tags merged with `extra`.
- Update Footer, DiscountPopup, QuizFunnelPage, useAuth signup hook, CheckoutPage, and the abandoned-cart edge function to call the helper instead of building payloads inline.
- In `nocobase-sync` edge function: stop overwriting `stage` when caller already sent one; only fill defaults when missing. Keep collection routing as-is.

## 2. Abandoned-cart: once per cart + personalized offer

- Add `cart_signature` (text) to `cart_snapshots` (sha-1 of sorted product_id+qty list) and `discount_pct` (numeric, default 0). Migration only — no data backfill needed.
- In `CartContext`, compute the signature client-side and include it in the upsert. When items change, if signature differs from last snapshot, the upsert resets `notified_at` to null so a new cart triggers a new reminder; if signature is the same, leave `notified_at` untouched (prevents repeat reminders for the same cart).
- In `nocobase-abandoned-cart` edge function:
  - Filter only `notified_at IS NULL` and `updated_at < now() - 24h` (already done).
  - For each snapshot, check eligibility: count `orders` for that user. If zero → set `discount_pct = 10` and tag `discount_eligible`; else `0` and tag `repeat_customer_recovery`.
  - Push to Nocobase with `{ discount_code: "RIDETHETIDE10" | null, discount_pct, items, subtotal, projected_total }`.
  - Always stamp `notified_at` after push so the same cart never fires twice.

## 3. Stock levels with low-stock messaging

- Extend `Product` interface in `src/data/products.ts`:
  - `stock?: number` (units remaining; omit/`null` means "in stock, no count shown").
  - Keep existing `inStock` for pre-order vs in-stock state.
- Seed realistic stock counts on each in-stock product (e.g. RT3 12, GHK-Cu 8, Tesamorelin 5, GLOW70 18). Pre-order items keep `inStock: false` and no stock number.
- New `<StockBadge product />` component with three states:
  - `inStock === false` → "Pre-Order — Reserve Yours"
  - `stock <= 5` → orange/amber "Only {n} left in stock" (urgency, but truthful).
  - `stock > 5` or undefined → existing green "In Stock" pill.
- Use it in `ProductCard` (replaces current pill) and on `ProductPage` (above the Add-to-Cart button).
- No fake countdowns; no decreasing stock on view. Numbers come from the product data file so the user can edit them.

## 4. Variant-aware cart & checkout

Variants currently mutate `product.price` before adding, so two different MG sizes of the same product collapse into one cart row. Fix by keying cart items on a composite id.

- Change `CartItem` in `CartContext`:
  ```ts
  interface CartItem {
    product: Product;
    variantLabel?: string;    // e.g. "10mg"
    unitPrice: number;        // resolved at add-time
    quantity: number;
    lineId: string;           // `${product.id}::${variantLabel ?? "default"}`
  }
  ```
- `addToCart(product, { variantLabel, unitPrice })`: dedupe by `lineId`. Update all callers:
  - `ProductPage` passes the selected variant.
  - `ProductCard` and `HeroShop` pass `undefined` for products without variants, or the first variant if one exists (with a "Select size" link to the PDP for multi-variant items, instead of silently picking).
  - `removeFromCart`/`updateQuantity` switch from `productId` to `lineId`.
- Show variant label in `CartDrawer`, `CartPage`, `CheckoutPage` order summary, and the order payload sent to Nocobase + `orders` table (extend the items JSON with `variant_label`).
- Subtotal/discount math uses `unitPrice * quantity` instead of `product.price`.

## 5. Checkout trust badges & guarantees

- New `<CheckoutTrustBar />` component placed directly above the Place Order button:
  - Row of badges: Visa / Mastercard / Amex / Discover icons (lucide `CreditCard` placeholder + simple SVG marks), "Secured by 256-bit SSL", "PCI-DSS Compliant".
  - Three guarantee tiles below: "Free Shipping over R1000", "Same-Day Dispatch (orders before 2pm)", "30-Day Money-Back Guarantee".
- Keep the existing `SecurityChecklist` in the right column; the new bar reinforces inside the form where the eye lands before submit.
- Add "Discreet packaging" + "Tracked courier (Aramex/Pep)" microcopy under shipping address block.

---

## Technical details

- **Migration**: `ALTER TABLE cart_snapshots ADD COLUMN cart_signature text, ADD COLUMN discount_pct numeric NOT NULL DEFAULT 0;` plus an index on `(notified_at, updated_at)` to keep the hourly sweep cheap.
- **Edge function update**: `nocobase-abandoned-cart` queries `orders` via service-role client (already does) to determine eligibility before push.
- **No DB schema needed** for stock — data file is the single source of truth so the user can edit without migrations. (If they later want CMS-managed stock we can move it to Lovable Cloud.)
- **Cart line keying** is the trickiest change; we'll keep one `addToCart` signature with an optional second arg so existing single-product calls keep working at the type level.

## Files

**Edit**
- `src/lib/nocobase.ts` — add helper, source/stage/tag maps
- `src/components/Footer.tsx`, `src/components/DiscountPopup.tsx`, `src/pages/QuizFunnelPage.tsx`, `src/hooks/useAuth.tsx`, `src/pages/CheckoutPage.tsx` — switch to helper
- `src/data/products.ts` — add `stock` field + seed values
- `src/components/ProductCard.tsx`, `src/pages/ProductPage.tsx` — use `StockBadge`, pass variant on add
- `src/context/CartContext.tsx` — variant-aware lines, signature snapshot
- `src/components/CartDrawer.tsx`, `src/pages/CartPage.tsx`, `src/pages/CheckoutPage.tsx` — show variant + line keying
- `src/components/HeroShop.tsx` — multi-variant products link to PDP instead of silent add
- `supabase/functions/nocobase-abandoned-cart/index.ts` — eligibility + once-only logic
- `supabase/functions/nocobase-sync/index.ts` — preserve caller-supplied stage

**Create**
- `src/components/StockBadge.tsx`
- `src/components/CheckoutTrustBar.tsx`
- `supabase/migrations/<timestamp>_cart_snapshots_signature.sql`
