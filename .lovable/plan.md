## Goal
Make the site cleanly single-market (South Africa, ZAR-only) by removing every Shopify, Stripe, and EUR/Germany code path, then wiring **PayFast** as the sole payment processor.

---

## 1. Remove Shopify

**Delete files**
- `src/components/shopify/ShopifyCartDrawer.tsx`
- `src/stores/shopifyCartStore.ts`
- `src/hooks/useShopifyCartSync.ts`
- `src/lib/shopify.ts`
- `src/pages/ShopifyStorePage.tsx`
- `src/pages/ShopifyProductPage.tsx`

**Edit**
- `src/App.tsx` — drop `/store` and `/store/:handle` routes, drop Shopify cart sync hook.
- `src/components/Header.tsx` / `Footer.tsx` — remove any Shopify links.
- `package.json` — remove `zustand` only if no other store uses it (check first; keep if used).

**Backend**
- Remove `SHOPIFY_ACCESS_TOKEN` and `SHOPIFY_STOREFRONT_ACCESS_TOKEN` secrets.
- Disconnect the Shopify connector via `standard_connectors--disconnect`.

---

## 2. Remove Stripe & NowPayments (current crypto processor)

- Delete edge functions: `supabase/functions/nowpayments-create-payment/`, `supabase/functions/nowpayments-ipn/`.
- Remove their entries from `supabase/config.toml`.
- Drop `nowpayments_payment_id` column from `orders` (migration) and replace with `payfast_pf_payment_id` + `payfast_m_payment_id`.
- Remove the `protect_subscription_sensitive_cols` Stripe field guards for `stripe_subscription_id` / `stripe_customer_id`; drop those columns from `subscriptions` (migration) and replace with `payfast_token` (for tokenized recurring) + `payfast_subscription_id`.
- Strip any Stripe UI/copy in checkout pages.

---

## 3. Remove EUR / Germany

**Make ZAR the only currency (no EUR base prices, no FX conversion).**

- `src/data/products.ts` — convert all `price` fields from EUR to ZAR using current rate (~19.40) and round to clean ZAR tiers; store ZAR directly.
- `src/context/CurrencyContext.tsx` — simplify: no rate fetch, no EUR; `format(zar)` returns `Rxxx.xx`. Keep API shape so callers don't break, but `convert` becomes identity.
- `src/lib/price.ts`, `src/lib/currency.ts` — remove EUR helpers, keep `formatZAR`.
- `src/lib/shipping.ts` — drop `"Germany"` from the type union, drop the legacy second arg.
- `src/lib/checkoutSchema.ts` — remove `DE_BUNDESLAENDER`, `deSchema`, German postal regex; export only `saSchema` and a single `validateCheckout(input)` (no country arg).
- `src/components/FreeShippingBar.tsx` — drop EUR/rate logic; show ZAR directly.
- `src/components/MarketSwitcher.tsx`, `src/components/CurrencySwitcher.tsx` — delete (already no-ops).
- `src/hooks/useMarket.ts` — collapse to a single ZA constant export; remove `Market` union.
- `src/pages/ImpressumPage.tsx` — DE legal page: remove from routes & nav (keep file only if needed for archived link, otherwise delete).
- `src/lib/marketCopy.ts`, `src/lib/copy.ts` — strip DE strings.
- Tests: update/remove `src/test/market-routing.test.tsx`.
- Sitemap/SEO: remove `de` alternates from `useMarket.buildAlternates`, regenerate `public/sitemap.xml` via `scripts/generate-sitemap.ts`.

---

## 4. Integrate PayFast (primary processor, ZAR)

PayFast supports a **redirect "Process" form** with server-signed fields plus an **ITN (Instant Transaction Notification)** webhook. Both will live in Supabase Edge Functions so credentials never hit the browser.

### Secrets (request via `add_secret` once user confirms)
- `PAYFAST_MERCHANT_ID`
- `PAYFAST_MERCHANT_KEY`
- `PAYFAST_PASSPHRASE` (used in signature)
- `PAYFAST_MODE` = `sandbox` | `live`

### Edge functions

**`supabase/functions/payfast-create-payment/index.ts`** (auth-required)
1. Verify JWT, load `orders` row, confirm `user_id` matches and `total`/`currency='zar'` match the request.
2. Build PayFast field map: `merchant_id`, `merchant_key`, `return_url`, `cancel_url`, `notify_url` (→ `payfast-itn`), `m_payment_id` = order UUID, `amount` (2dp), `item_name`, `email_address`, `name_first`, `name_last`, optional `subscription_type=1` for tokenized recurring.
3. Compute signature: URL-encode each non-empty field in **field order**, append `&passphrase=…`, md5, lowercase hex.
4. Return either `{ redirectUrl, fields }` for the client to POST, or render a self-submitting HTML form.

**`supabase/functions/payfast-itn/index.ts`** (public, `verify_jwt = false` in `supabase/config.toml`)
1. Parse `application/x-www-form-urlencoded` body.
2. Re-compute signature using passphrase, compare to `signature` field.
3. Validate source IP against PayFast's published ranges (`www.payfast.co.za`, `sandbox.payfast.co.za` resolved).
4. Server-to-server validate by POSTing the raw body back to `https://{sandbox.,}payfast.co.za/eng/query/validate` and expecting `VALID`.
5. Cross-check `amount_gross` against stored `orders.total`.
6. On `payment_status = COMPLETE` → update `orders.status='paid'`, store `pf_payment_id`, write `integration_logs` row, optionally create `subscriptions` row when `token` is returned.
7. Always 200 OK to PayFast.

### Frontend
- `src/pages/CheckoutPage.tsx` — replace NowPayments call with `supabase.functions.invoke('payfast-create-payment')`, then auto-submit the returned form (or `window.location` to PayFast).
- `src/pages/CheckoutSuccessPage.tsx` / `CheckoutCancelPage.tsx` — keep, point `return_url`/`cancel_url` here.
- `src/components/PaymentMethodsBanner.tsx` — show PayFast logo + supported methods (card, Instant EFT, SnapScan, Zapper, Mobicred). Drop Stripe/crypto logos.
- Remove all "EUR", "€", "Germany", "Versand" copy from checkout, footer, FAQ, shipping policy.

### DB migration
```sql
ALTER TABLE public.orders
  DROP COLUMN IF EXISTS nowpayments_payment_id,
  ADD COLUMN IF NOT EXISTS payfast_m_payment_id text,
  ADD COLUMN IF NOT EXISTS payfast_pf_payment_id text,
  ADD COLUMN IF NOT EXISTS payfast_token text;

ALTER TABLE public.subscriptions
  DROP COLUMN IF EXISTS stripe_subscription_id,
  DROP COLUMN IF EXISTS stripe_customer_id,
  ADD COLUMN IF NOT EXISTS payfast_token text,
  ADD COLUMN IF NOT EXISTS payfast_subscription_id text;
```
Plus an updated `protect_subscription_sensitive_cols` trigger guarding the new PayFast columns.

---

## 5. QA checklist
- `rg -i "shopify|stripe|nowpayments|EUR|€|Germany|Bundesland"` returns zero hits in `src/` and `supabase/functions/`.
- Build passes; product cards show `Rxxx.xx`.
- Test order → PayFast sandbox → ITN flips order to `paid`.
- Sitemap has no `/de` URLs.

---

## Open questions before I implement

1. **Tokenized recurring subscriptions** — do you want PayFast's tokenization wired now (for the subscription products), or one-off payments only for v1?
2. **Existing data** — any live `orders`/`subscriptions` rows that need migrating, or is it safe to drop the Stripe/NowPayments columns outright?
3. **EUR → ZAR price conversion** — convert at today's ~R19.40/€ and round, or do you want to set custom ZAR prices per SKU (send me a list)?
4. **Impressum (German legal page)** — delete entirely, or keep as a stub redirect to `/about`?
