
## Goal

1. Validate the checkout contact + shipping address against rules specific to Germany and South Africa, showing inline errors before NowPayments is called.
2. Add a live free-shipping progress bar on the checkout page that updates as the cart subtotal changes (mirrors the cart page bar, but pinned to the selected shipping country).

Scope is frontend only — no DB or edge-function changes. Order persistence stays as-is.

---

## 1. Address validation

### Schema (`src/lib/checkoutSchema.ts`, new)

Use `zod` (already in project). Build a discriminated schema keyed by `country`:

- **Shared fields** (trimmed, with max lengths to prevent abuse):
  - `firstName`: 1–60 chars, letters/spaces/hyphens/apostrophes only
  - `lastName`: 1–60 chars, same charset
  - `email`: valid email, ≤ 120 chars
  - `address1`: 3–120 chars
  - `city`: 2–80 chars
  - `region`: 2–80 chars (label flips Province ↔ Bundesland)

- **Germany (`country = "Germany"`)**:
  - `postalCode`: exactly 5 digits (`/^\d{5}$/`)
  - `region` must match one of the 16 Bundesländer (case-insensitive list constant in the same file)

- **South Africa (`country = "South Africa"`)**:
  - `postalCode`: exactly 4 digits (`/^\d{4}$/`)
  - `region` must match one of the 9 SA provinces (case-insensitive)

- **Unsupported country**: schema rejects with `country_blocked` message — `handlePay` already blocks, validation just reinforces.

Export `validateCheckout(input, country)` returning `{ ok: true, data } | { ok: false, errors: Record<field,string> }` with localized messages keyed off `currency`/locale (EN + DE + AF strings via `COPY` keys added to `src/lib/copy.ts`).

### Copy additions (`src/lib/copy.ts`)

Add trilingual keys: `err_required`, `err_email`, `err_postal_de`, `err_postal_sa`, `err_region_de`, `err_region_sa`, `err_name_chars`, `err_address_short`.

### Form refactor (`src/pages/CheckoutPage.tsx`)

- Convert the currently uncontrolled `<input>`s for contact + address into controlled state (`form` object + `setField`), plus an `errors` state map.
- On `handlePay` first run `validateCheckout(form, country)`:
  - If invalid: set `errors`, scroll/focus the first invalid field, toast a generic "Please fix the highlighted fields" message, abort before calling Supabase / NowPayments.
  - If valid: continue with current flow.
- Render inline errors under each input (`<p className="mt-1 text-xs text-destructive" role="alert">`), and add `aria-invalid` + `aria-describedby` on inputs.
- Show province/Bundesland helper text when the country changes (e.g. "z. B. Bayern" / "e.g. Gauteng").
- Persist the form values in `sessionStorage` under `rtt_checkout_form` so a failed payment / reload keeps what the user typed (parallel to the existing `rtt_ship_country` persistence).

### Tests (`tests/checkout.spec.ts`)

Add Playwright cases:
- DE: invalid postal `1234` → inline error, Pay Now does not navigate.
- DE: invalid Bundesland "Foo" → inline error.
- SA: invalid postal `12` → inline error.
- Valid SA submit reaches the Supabase call (mock-friendly: assert no inline errors visible and button enters busy state).

---

## 2. Free-shipping progress bar on checkout

Reuse the existing `src/components/FreeShippingBar.tsx` (already trilingual, used on the cart page).

### Integration in `src/pages/CheckoutPage.tsx`

- Place it directly above the "Order Summary" totals block in the right column, so the bar updates as soon as quantity changes elsewhere (cart drawer / line edits) recompute `totalPrice`.
- Feed it the destination-currency subtotal and country so the threshold matches checkout's shipping math:

  ```tsx
  {shippingMath.supported && (
    <FreeShippingBar
      country={country as ShippingCountry}
      subtotalInDest={shippingMath.destSubtotal}
    />
  )}
  ```

- Update `FreeShippingBar` props if needed to accept `country` + `subtotalInDest` directly (today it likely derives from cart context). If the existing API already covers this, just import and use. Verify by reading the component before editing; only extend the API additively (new optional props) to keep cart-page usage intact.
- Remove the ad-hoc `showFreeNudge` block in `CheckoutPage` (replaced by the bar).

### Reactivity

`totalPrice` comes from `useCart()` which already re-renders on quantity change, so the bar updates live with no extra wiring. The destination-currency conversion uses `rate` from `useCurrency()` — already a dependency of `shippingMath`'s `useMemo`.

---

## Files

- **New**: `src/lib/checkoutSchema.ts`
- **Edited**: `src/pages/CheckoutPage.tsx`, `src/lib/copy.ts`, `src/components/FreeShippingBar.tsx` (only if props need extending), `tests/checkout.spec.ts`

## Out of scope

- Server-side re-validation (no edge-function changes requested).
- Address autocomplete / Google Places.
- Phone number field (not currently collected).
- Other markets — schema stays restricted to DE + SA per existing shipping rules.
