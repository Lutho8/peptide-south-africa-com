## Shipping System: Germany + South Africa Only

Restrict checkout to two destinations with country-specific shipping, dynamic totals, free-shipping progress, blocked-country handling, and order persistence of shipping fields.

### 1. Shipping core lib — `src/lib/shipping.ts` (new)

```ts
export type ShippingCountry = "South Africa" | "Germany";
export const SHIPPING_RULES = {
  "South Africa": { method: "Local courier (The Courier Guy / Ramhis)", flat: 89, freeOver: 1500, currency: "ZAR", days: "1–3" },
  "Germany":      { method: "Deutsche Post / DHL",                       flat: 7.5, freeOver: 120,  currency: "EUR", days: "4–7" },
} as const;

getShippingCost(cartTotalInDestCurrency, country) → 0 | flat
amountToFreeShipping(cartTotalInDestCurrency, country) → number
isSupportedCountry(country) → boolean
```

Shipping is always priced in the **destination currency** (ZAR flat for SA, EUR flat for DE) regardless of the user's display currency toggle. Use `useCurrency().rate` to convert the cart subtotal into destination currency for threshold checks, and to convert the shipping cost into the active display currency for UI only.

### 2. Trilingual copy — extend `src/lib/copy.ts`

Add EN/DE/AF keys: `shipping_country`, `ship_to_sa`, `ship_to_de`, `ship_sa_line`, `ship_de_line`, `free_over_sa` (`R1,500`), `free_over_de` (`€120`), `away_from_free`, `unlocked_free_shipping`, `country_blocked`, `contact_support_region`, `place_order`, `standard_shipping_de`, `local_courier_sa`.

### 3. Checkout page — `src/pages/CheckoutPage.tsx`

- Add **Shipping Country** `<select>` at top of form with exactly two options (🇿🇦 SA, 🇩🇪 DE). Default: ZAR currency → SA, EUR → DE. Persist selection in `useState` (no localStorage needed — country is per-order).
- Replace hard-coded "Country" input with this selector; remove free-text country field.
- Compute `shippingCost` and `grandTotal` from `getShippingCost(...)`. Pass `grandTotal` (in destination currency) to NowPayments instead of `totalPrice`.
- Display "Add X more for free shipping" nudge when `0 < amountToFree ≤ 20%` of threshold.
- If a saved address ever yields an unsupported country (future-proofing), show red alert + disable Pay Now. For now the dropdown prevents this, but keep `isSupportedCountry` guard around the submit handler.
- Update order summary right rail to show: Subtotal, Discount, **Shipping** (with method name + days), Total — all using `useCurrency().format()` for display, but submit amount = destination currency.
- Pay Now button disabled when country unsupported; show "Sorry, we currently only ship to Germany and South Africa. Contact support@ridethetide.site" message.

### 4. Cart page — `src/pages/CartPage.tsx`

- Add **FreeShippingBar** component (new, `src/components/FreeShippingBar.tsx`) using existing `Progress` UI:
  - Picks threshold from currency (EUR → €120, ZAR → R1,500) — uses display currency on cart page since destination isn't chosen yet.
  - Shows "🛒 You're {format(remaining)} away from free shipping!" or "✅ You've unlocked free shipping!" trilingually.
- Keep cart summary numbers unchanged (shipping resolved at checkout).

### 5. Product pages — `src/pages/ProductPage.tsx` + `DeliveryReturnsAccordion.tsx`

Replace ZAR-only badge with one-line dual-market badge:
`🇿🇦 SA: Free over R1,500  |  🇩🇪 DE: Free over €120`

### 6. Footer — `src/components/Footer.tsx`

Update shipping snippet to: "We ship to 🇿🇦 South Africa (1–3 days, free over R1,500) and 🇩🇪 Germany (4–7 days, free over €120)."

### 7. Backend — order persistence + payment

**Migration** (new) — add to `orders`:
- `shipping_country text`
- `shipping_method text`
- `shipping_cost numeric not null default 0`
- `shipping_currency text`
- `free_shipping_applied boolean not null default false`

**Checkout submit** writes these fields on insert. **NowPayments edge function**: `amount` already comes from client; we pass `subtotal + shipping` in destination currency, so no edge-function code change required (just verify it forwards the amount through unchanged).

### 8. Tests — `tests/checkout.spec.ts`

Add cases:
- DE default when EUR; SA default when ZAR.
- SA cart < R1,500 shows R89 shipping; ≥ R1,500 shows free.
- DE cart < €120 shows €7.50; ≥ €120 shows free.
- Cart page progress bar renders and reaches "unlocked" at threshold.

### Out of scope

- Real carrier/rate API integration (flat-rate only as specified).
- Address validation beyond country.
- Tax/VAT calculation changes.
- Admin UI for editing shipping rules.

### Open question

You wrote "Flat Rate: €8.50" but the display string says "€7.50 (Free for orders over €120)" — and the same for SA (R99 vs R89). I'll use the **display values** (€7.50 / R89) since those are what customers see, matching your `getShippingCost` code sample. Confirm if you'd rather use €8.50 / R99.
