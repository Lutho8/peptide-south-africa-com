## Persist shipping country + expand checkout E2E coverage

### 1. Persist shipping country selection

- In `src/pages/CheckoutPage.tsx`, replace the bare `useState<ShippingCountry>(...)` with a localStorage-backed state under key `rtt_ship_country`.
  - On mount: read the key; if it's `"South Africa"` or `"Germany"` use it, otherwise fall back to the currency-derived default (ZAR→SA, EUR→DE).
  - On change: write the new value to localStorage so it survives reloads and a failed/cancelled NowPayments round-trip.
  - Do NOT auto-overwrite when the user toggles currency later — manual selection always wins (matches the spec's "currency and country are independent" rule).
- SSR-safe guard (`typeof window !== "undefined"`) so the initializer doesn't crash tests/build.

### 2. Playwright E2E coverage for shipping

Extend `tests/checkout.spec.ts` (plus tiny helpers in `tests/_utils.ts` if needed) with these cases. Each test starts from a clean cart and adds the first product:

1. **EUR + Germany, under threshold** — shipping line shows `€7.50`, total = subtotal + €7.50.
2. **EUR + Germany, over threshold** — bump quantity until subtotal ≥ €120; shipping line shows "Free / Gratis"; nudge banner not shown.
3. **ZAR + South Africa, under threshold** — switch currency to ZAR, shipping line shows `R89`.
4. **ZAR + South Africa, over threshold** — increase quantity until ≥ R1,500; shipping line shows "Free / Gratis".
5. **Pay Now disabled when blocked** — render the page, then `window.localStorage.setItem("rtt_ship_country", "France")` + reload; expect the red blocked banner, `pay-now-button` disabled, and the `country_blocked` copy visible. (This exercises the future-proofing branch even though the UI selector itself only exposes SA/DE.)
6. **Country selection persists across reload** — click SA, reload `/checkout`, assert SA is still active.

Helpers to add in `_utils.ts`:
- `setShippingCountry(page, "South Africa" | "Germany" | string)` — writes localStorage then reloads.
- `bumpFirstLineQuantity(page, times)` — clicks the `+` button on the cart page N times (used to push the cart above the free-shipping threshold). Cart page already exposes the buttons.

### Out of scope

- Persisting other address fields (name, street, etc.).
- Auth-gated tests for the actual NowPayments redirect.
- Unit tests for `getShippingCost` (already covered indirectly by the E2E suite).

### Files touched

- `src/pages/CheckoutPage.tsx` (state initializer + setter)
- `tests/checkout.spec.ts` (new cases)
- `tests/_utils.ts` (two small helpers)
