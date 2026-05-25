## Goal
Wire your store to Shopify so products you add in Shopify admin appear live on the site, with a real Shopify cart + checkout. Currency stays ZAR; payment methods (Peach Payments, Manual EFT) are configured inside Shopify admin — not in code.

## Scope
- **New live storefront** at `/store` (and `/store/:handle`) that fetches products from Shopify in real time. Empty-state message until you add products in Shopify admin.
- **Existing pages stay untouched** (`/shop`, `/product/:slug`, existing CartContext) so nothing breaks while you migrate. Once Shopify is populated, we can swap `/shop` to the live one.
- **No mock products** — the 5 products (BPC‑157, TB‑500, CJC‑1295 + Ipamorelin, GHK‑Cu, Recovery Protocol Bundle) get created by you in Shopify admin; the site renders whatever's there.

## Files to add
- `src/lib/shopify.ts` — Storefront API constants (store domain, token, API `2025-07`), GraphQL queries (products, product-by-handle), cart mutations, `storefrontApiRequest` helper.
- `src/stores/shopifyCartStore.ts` — Zustand cart store with real-time Shopify cart sync (`cartCreate`, `cartLinesAdd`, `cartLinesUpdate`, `cartLinesRemove`), persisted to localStorage, `getCheckoutUrl()` returning the Shopify-hosted checkout URL.
- `src/hooks/useShopifyCartSync.ts` — clears local cart after checkout completes (visibilitychange listener).
- `src/components/shopify/ShopifyCartDrawer.tsx` — slide-out cart, qty controls, "Checkout with Shopify" button that opens the real `checkoutUrl` in a new tab with `channel=online_store`.
- `src/pages/ShopifyStorePage.tsx` — grid of live Shopify products, "Add to cart" buttons, cart drawer in header. Empty-state when no products.
- `src/pages/ShopifyProductPage.tsx` — `/store/:handle` detail page.

## Files to edit
- `src/App.tsx` — register `/store` + `/store/:handle` routes, mount `useShopifyCartSync()`.

## Dependencies
- `zustand` (already installed during planning).

## Payment methods (manual step in Shopify admin)
These cannot be enabled from code — they're configured inside Shopify admin once you claim the store:
1. **Peach Payments** — Settings → Payments → Add provider → search "Peach Payments" → install + connect (covers EFT + PayFlex in SA).
2. **Manual EFT** — Settings → Payments → Manual payment methods → "Custom" → name "EFT bank transfer" + your bank details.
3. **Currency** — Settings → General → Store currency → ZAR. (Your dev store currently defaults to DE/EUR — change it after claiming.)

## Make webhook
You sent `MAKE_SHOPIFY_WEBHOOK_PLACEHOLDER` — that's a placeholder, not a real URL. After you give me the actual Make webhook URL, I'll wire the Shopify "Order created" webhook in admin → Settings → Notifications → Webhooks → format JSON → URL = your Make webhook. (No code change needed — it's an admin-side setting.)

## What you'll do after approval
1. Approve this plan → I implement the code.
2. Add the 5 products in Shopify admin (titles + tagline subtitles you listed → "BPC‑157 | The Healing Compound" etc., prices in ZAR).
3. Visit `/store` — products render live.
4. Claim the store when ready to sell, then enable Peach Payments + Manual EFT + change currency to ZAR.
5. Send me the real Make webhook URL.