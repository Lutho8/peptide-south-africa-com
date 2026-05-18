
# Plan: EUR-first dual-market + NowPayments

## Heads up on Change 1 (Stripe removal)
A repo-wide search for "stripe" returns **zero hits** in `src/`, `supabase/`, or `public/`. The current `CheckoutPage.tsx` uses placeholder card inputs (no Stripe SDK, no `@stripe/*` packages, no Stripe env vars). **Nothing to remove.** I'll replace the placeholder card fields with the new NowPayments redirect button per Change 2 — that satisfies the intent of Change 1.

If you actually had a Stripe integration on a different branch, let me know before I implement.

## Scope summary
1. Currency layer: EUR base + ZAR toggle (live FX, cached 1h, persisted in localStorage).
2. NowPayments: edge function to create payment, redirect to hosted checkout, IPN webhook to confirm orders.
3. Footer payment-methods banner + checkout copy.
4. Copy updates: age modal, shipping messaging, DE trust signals.

---

## 1. Currency system

**New files**
- `src/context/CurrencyContext.tsx` — provider with `{ currency: 'EUR'|'ZAR', setCurrency, rate, convert(eur), format(eur) }`. Fetches `https://api.exchangerate-api.com/v4/latest/EUR` on mount, caches `{ rate, fetchedAt }` in `localStorage` for 1h, falls back to `19.40` if fetch fails. Persists selection in `localStorage` key `rtt_currency`.
- `src/components/CurrencySwitcher.tsx` — compact dropdown (🇪🇺 EUR € / 🇿🇦 ZAR R), placed in `Header.tsx` right of nav (desktop) and inside the mobile menu.
- `src/lib/price.ts` — helpers `formatEUR(n)`, `formatZAR(n)` (keep existing), and `displayPrice(eurAmount, ctx)` that returns `{ primary, secondary }` — in ZAR mode primary = "R…" with secondary "≈ €23.20"; in EUR mode primary = "€…", no secondary.

**Data model — base prices in EUR**
- `src/data/products.ts`: convert every `price` and `variants[].price` from ZAR → EUR using a one-time divide by **19.40** rounded to 2dp, store as the new canonical `price` (EUR). Add a code comment that prices are EUR base and ZAR is computed. I'll spot-check 2–3 products against current values so nothing looks broken.
- Update `priceRange` strings the same way (or compute at render time).

**Render sites to migrate** (all currently call `formatZAR`):
`ProductCard.tsx`, `ProductPage.tsx`, `CartPage.tsx`, `CartDrawer.tsx`, `CheckoutPage.tsx`, `FeaturedProductRail.tsx`, `HeroShop.tsx`, `admin/AdminDiscountEligibilityPage.tsx`. Each switches to `useCurrency()` + `displayPrice()`. Admin page stays EUR-only (back-office).

**Cart math**
`CartContext` already stores `unitPrice` from product data — once products are EUR, subtotal/total are EUR. No structural change. `CheckoutPage` passes EUR total + selected display currency to the edge function.

**Provider wiring**
Wrap `<App />` in `CurrencyProvider` inside `src/main.tsx` (above `CartProvider`).

---

## 2. NowPayments integration

**Secrets** (request via `add_secret` before deploying):
- `NOWPAYMENTS_API_KEY`
- `NOWPAYMENTS_IPN_SECRET`

**Edge function `supabase/functions/nowpayments-create-payment/index.ts`**
- Auth: requires logged-in user (verifies JWT).
- Body: `{ orderId, amount, currency: 'eur'|'zar', description, successUrl, cancelUrl }`.
- Inserts/updates an `orders` row with `status='pending'`, `currency`, `nowpayments_payment_id` (added via migration).
- Calls `POST https://api.nowpayments.io/v1/payment` with `price_amount`, `price_currency`, `order_id`, `order_description`, `ipn_callback_url=https://<project>.functions.supabase.co/nowpayments-ipn`, `success_url`, `cancel_url`.
- Returns `{ payment_url, payment_id }`.

**Edge function `supabase/functions/nowpayments-ipn/index.ts`** (`verify_jwt=false`)
- Verifies `x-nowpayments-sig` HMAC-SHA512 over alphabetically-sorted JSON body using `NOWPAYMENTS_IPN_SECRET`.
- On `payment_status` in (`finished`, `confirmed`, `partially_paid`), updates the matching `orders` row to `paid`. On `failed`/`expired` → `failed`.
- Logs to `integration_logs` (existing table).

**DB migration**
Alter `orders`: add `status text default 'pending'`, `currency text default 'EUR'`, `nowpayments_payment_id text`, `paid_at timestamptz`. Add new RLS policy allowing users to UPDATE only their own pending order (or keep update server-side via service role from the edge function — preferred, no new policy needed).

**Checkout UX**
- Remove placeholder card fields from `CheckoutPage.tsx`.
- Replace with a "Payment" card showing the required copy: *"Pay securely via PayPal, credit/debit card, Apple Pay, Google Pay, SEPA bank transfer, or cryptocurrency. All payments processed securely through NowPayments."* plus monochrome method icons.
- "Pay Now" button → calls edge function → `window.location.href = payment_url`.
- New routes `/checkout/success` and `/checkout/cancel` (lightweight pages with order summary + CTA). Success page polls `orders.status` once on mount.

---

## 3. Footer payment banner

Update `Footer.tsx` with a "We Accept" strip: PayPal, Visa, Mastercard, Apple Pay, Google Pay, SEPA, Bitcoin, Revolut. Monochrome inline SVGs (no external assets), muted-foreground color, single row that wraps. Small "Powered by NowPayments" line below.

---

## 4. Copy + trust updates

- `AgeVerificationModal.tsx` — new copy from spec, including the SA 18+ / DE 18+ line.
- `AnnouncementBar.tsx` — shipping line → "Free shipping: SA over R1,500 · DE/EU over €75 · SA 1–3 days · DE/EU 4–7 days".
- `HeroShop.tsx` and any other "1–3 day SA dispatch" / "Free shipping…R1,500" strings → new dual-market versions.
- Add a small trust strip (likely in `Footer.tsx` or `CheckoutTrustBar.tsx`): "EU shipping available", "Laborgeprüfte Reinheit", "Questions? We speak English, Deutsch, Afrikaans".

---

## Technical details

**Files created**: `src/context/CurrencyContext.tsx`, `src/components/CurrencySwitcher.tsx`, `src/components/PaymentMethodsBanner.tsx`, `src/lib/price.ts`, `src/pages/CheckoutSuccessPage.tsx`, `src/pages/CheckoutCancelPage.tsx`, `supabase/functions/nowpayments-create-payment/index.ts`, `supabase/functions/nowpayments-ipn/index.ts`, one migration.

**Files edited**: `src/main.tsx`, `src/App.tsx` (routes), `src/data/products.ts` (price conversion), `Header.tsx`, `Footer.tsx`, `AnnouncementBar.tsx`, `AgeVerificationModal.tsx`, `HeroShop.tsx`, `CheckoutPage.tsx`, `CartPage.tsx`, `CartDrawer.tsx`, `ProductCard.tsx`, `ProductPage.tsx`, `FeaturedProductRail.tsx`, `admin/AdminDiscountEligibilityPage.tsx`, `src/lib/currency.ts` (keep `formatZAR`, add EUR helper).

**Out of scope** (call out before I start if you want any of these in):
- Email confirmations from the IPN handler (no transactional email provider configured yet — would need Resend or similar).
- German/Afrikaans UI translation (only trust strings get DE; full i18n is a separate project).
- Tax/VAT handling — NowPayments doesn't compute EU VAT; treating prices as VAT-inclusive for now.
- Per-country shipping cost calculation (still flat free over threshold).

## Open questions
1. Confirm the **conversion divisor** for the one-time EUR base prices: use **19.40** (your spec) even though live FX may drift? I'll round to 2dp and the live rate handles display.
2. Should the **success page** actually wait for IPN confirmation (poll for ~30s) or just say "Payment received, we'll email you"? NowPayments redirects on payment submission, not always on confirmation.
3. Do you already have a transactional email provider, or skip order-confirmation email for now?
