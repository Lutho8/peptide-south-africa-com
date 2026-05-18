
# Revised plan — proceed without NowPayments secrets (defer to tomorrow)

NowPayments approval is pending, so I'll build everything except the live API call. The edge functions and UI will be wired up and ready; they just won't have valid credentials until you add `NOWPAYMENTS_API_KEY` and `NOWPAYMENTS_IPN_SECRET` tomorrow.

## What I'll build now

### 1. Currency layer (EUR base + ZAR toggle)
- `src/context/CurrencyContext.tsx` — EUR/ZAR state, live rate from `exchangerate-api.com` cached 1h in localStorage, fallback 19.40, persists user choice.
- `src/components/CurrencySwitcher.tsx` — compact 🇪🇺/🇿🇦 dropdown, mounted in `Header.tsx` (desktop + mobile menu).
- `src/lib/price.ts` — `formatEUR`, `displayPrice(eur, ctx)` returning primary + optional secondary line.
- `src/data/products.ts` — convert all `price`, `variants[].price`, `priceRange` from ZAR → EUR (÷19.40, 2dp). Comment that EUR is canonical.
- Migrate all `formatZAR` call sites to `useCurrency()` + `displayPrice()`: `ProductCard`, `ProductPage`, `CartPage`, `CartDrawer`, `CheckoutPage`, `FeaturedProductRail`, `HeroShop`. Admin page stays EUR-only.
- Wrap app in `CurrencyProvider` from `main.tsx`.

### 2. NowPayments scaffolding (built, dormant until keys land)
- Edge function `nowpayments-create-payment` — full implementation reading `NOWPAYMENTS_API_KEY`. Returns clear error if env var missing.
- Edge function `nowpayments-ipn` — full HMAC-SHA512 signature verification using `NOWPAYMENTS_IPN_SECRET`, updates order status, logs to `integration_logs`. `verify_jwt = false`.
- DB migration: add `status`, `currency`, `nowpayments_payment_id`, `paid_at` columns to `orders`.
- Checkout page: remove placeholder card inputs, add "Payment" card with the required copy + monochrome method icons + "Pay Now" button that calls the edge function and redirects to `payment_url`. When the secret isn't configured yet, the function returns a friendly 503 and the UI shows "Payments come online tomorrow — try again then."
- New routes `/checkout/success` and `/checkout/cancel`.

### 3. Footer payment-methods banner
- New `src/components/PaymentMethodsBanner.tsx` — monochrome inline SVGs: PayPal, Visa, Mastercard, Apple Pay, Google Pay, SEPA, Bitcoin, Revolut. "Powered by NowPayments" line.
- Mounted in `Footer.tsx`.

### 4. Copy + trust updates
- `AgeVerificationModal.tsx` — new dual-jurisdiction text.
- `AnnouncementBar.tsx` + `HeroShop.tsx` — "SA: 1–3 days | DE/EU: 4–7 days", "Free shipping: SA over R1,500 · DE/EU over €75".
- `Footer.tsx` — append DE trust strip: "EU shipping available", "Laborgeprüfte Reinheit", "Questions? We speak English, Deutsch, Afrikaans".

## What's deferred until tomorrow
- I will **not** call `add_secret` now. When you confirm NowPayments approval, I'll add the two secrets and the edge function goes live immediately — no code change needed.
- No transactional email on payment confirmation (no provider configured; out of scope).

Proceeding now.
