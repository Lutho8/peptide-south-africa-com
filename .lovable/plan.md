## Goal

Three deliverables:
1. Audit cart + checkout UI so every price label and trust strip respects the active currency (EUR/ZAR) and uses consistent EN/DE/AF micro-copy.
2. Add automated Playwright E2E tests for the cart→checkout flow in both currency modes, including `/checkout/success` and `/checkout/cancel`.
3. Build an order status/receipt page that surfaces Paid / Pending / Cancelled with localized copy.

---

## Part 1 — Cart & checkout copy/currency audit

Apply `src/lib/copy.ts` (already exists with `trilingual()` / `bilingualDE()`) consistently. Where space allows, render EN as the primary label with DE + AF beneath in muted text.

Files to update:

- **`src/pages/CheckoutPage.tsx`**
  - Replace hard-coded shipping line (line 127) with `trilingual("shipping_free")` + window lines via `shipping_sa_window` / `shipping_eu_window`.
  - "Pay Now — {total}" button → `COPY.pay_now` trio + total.
  - Payment-unavailable toast → `COPY.payment_unavailable[locale]` fallbacks.
  - Order summary "Free" / "Shipping" labels: add DE (`Versand` / `Gratis`) and AF (`Versending` / `Gratis`) as tooltips/secondary.
  - Default country select: keep currency-driven default but expose both options as `<select>` (DE/AT/CH for EUR; ZA for ZAR).
  - Use `display(eur)` (returns `{primary, secondary}`) for the line-item and total rows so ZAR mode also shows the `≈ €X` reference everywhere (currently only `format()` is used in the summary).

- **`src/pages/CartPage.tsx`**
  - Same `display()` swap for line items, subtotal, total.
  - "🔒 Secure checkout · Free shipping" → trilingual using `secure_checkout` + `shipping_free`.
  - Empty-cart copy gets EN/DE/AF.

- **`src/components/CartDrawer.tsx`**
  - Drawer subtotal/total → `display()` so ZAR shows EUR reference.
  - "Free!" shipping pill → bilingual per currency (EUR → "Gratis", ZAR → "Gratis (Versending)").

- **`src/components/CheckoutTrustBar.tsx`**
  - Replace hard-coded R/€ strings with `trilingual("shipping_free")` and tighten dispatch line to use `shipping_sa_window` + `shipping_eu_window`.

- **`src/components/CartCountdown.tsx`** (quick audit) — ensure any "R…" / "€…" labels go through `useCurrency().format()`.

- **`src/lib/copy.ts`** — extend with new keys: `order_summary`, `subtotal`, `shipping`, `total`, `free`, `tax`, `paid`, `pending`, `cancelled`, `view_order`, `back_to_shop`, `processing_payment`, `order_number`. Add a small `<TrilingualLabel keys="…" />` helper that renders EN primary + DE/AF muted under it (or inline `· ` separated for compact strips).

Acceptance: toggling EUR↔ZAR in the header updates every visible amount on `/cart`, `/checkout`, the drawer, and the trust strip; all trust copy reads naturally in EN with DE/AF visible.

---

## Part 2 — Playwright E2E checkout tests

The repo already has `playwright.config.ts` and `playwright-fixture.ts`. Add a new spec file:

- **`tests/checkout.spec.ts`** with cases:
  1. `EUR mode — cart → checkout renders EUR totals`: visit `/`, dismiss age modal, ensure currency is EUR (default), add a product via the shop card, open cart drawer, assert `€` price visible and matches expected formula. Navigate to `/checkout`, assert "Pay Now — €…" button label.
  2. `ZAR mode — totals convert and show EUR reference`: same flow but click `CurrencySwitcher` first. Assert `R` primary and `≈ €` secondary visible on cart line items, summary, and Pay Now button.
  3. `Checkout success page renders pending state`: direct-navigate to `/checkout/success?order_id=00000000-0000-0000-0000-000000000000`, assert headline + "Continue Shopping" link (uses pending fallback when DB row missing).
  4. `Checkout cancel page renders and links back`: `/checkout/cancel`, assert "Payment cancelled" + both CTAs (`/cart`, `/shop`).
  5. `Pay Now without auth redirects to /auth`: in EUR mode click Pay Now; expect toast + URL to become `/auth`.
  6. `Pay Now in authed dev session shows graceful error toast when NowPayments key absent`: skip if no test user available — guard with `test.skip()`.

Helpers in `tests/_utils.ts`:
- `acceptAgeGate(page)` clicks the modal "I am 18+" CTA if present.
- `addFirstProduct(page)` navigates `/shop`, clicks first product card "Add to cart".
- `switchCurrency(page, "ZAR" | "EUR")` clicks the header `CurrencySwitcher`.

Tests run against the live preview via the existing Lovable Playwright config — no new infra. Storage state for auth is **not** required (most tests are unauthenticated).

Acceptance: `bunx playwright test tests/checkout.spec.ts` passes locally in the sandbox; CI integration is out of scope.

---

## Part 3 — Order status / receipt page

Goals:
- Replace the bespoke `CheckoutSuccessPage` polling with a real receipt route reusable from email links and the account area.
- Show `Paid` / `Pending` / `Cancelled` with localized headline + body and the correct CTA.

Changes:

- **New route `/order/:id`** → `src/pages/OrderStatusPage.tsx`
  - Loads the order via `supabase.from("orders").select("id,status,total,currency,paid_at,order_description,created_at")`.
  - Computes status badge (paid → trust green CheckCircle, pending → primary Loader2 spinner, cancelled/failed → destructive XCircle).
  - Subscribes to realtime updates (`supabase.channel("order:"+id)` on `postgres_changes` for that row) so the page flips from Pending → Paid automatically when the IPN fires. (Requires adding `orders` to `supabase_realtime` publication via migration.)
  - Renders EN headline + DE + AF lines using new `copy.ts` keys `paid`, `pending`, `cancelled`, `thank_you`.
  - Shows order #, line description, total in original currency, and "Continue Shopping" + "Track Order" buttons.
  - SEO `noindex`.

- **`src/pages/CheckoutSuccessPage.tsx`**: redirect (replace) to `/order/:id` once order id is known; if no `order_id` query param, fall back to current copy.

- **`src/pages/CheckoutCancelPage.tsx`**: if `?order_id=` is present, optimistically POST a status update via a new edge function `mark-order-cancelled` (user-owned RLS UPDATE policy needed) — otherwise leave order pending and let IPN reconcile. Simpler alternative: only the IPN flips status; the cancel page is purely informational. **Chosen approach: keep IPN-only writes** — no new edge function. The cancel page just links the user to `/order/:id` so they can see Pending until NowPayments confirms.

- **Routing**: add `<Route path="/order/:id" element={<OrderStatusPage />} />` in `src/App.tsx`.

- **Migration** `supabase/migrations/<ts>_orders_realtime.sql`:
  ```sql
  alter publication supabase_realtime add table public.orders;
  alter table public.orders replica identity full;
  -- Allow users to UPDATE only their own order status to 'cancelled' (for cancel-page UX, optional)
  -- skipped per chosen approach; IPN-only writes via service role.
  ```

- **Copy**: extend `src/lib/copy.ts` with:
  ```ts
  paid:     { en: "Payment received", de: "Zahlung erhalten", af: "Betaling ontvang" }
  pending:  { en: "Waiting for payment confirmation", de: "Warten auf Zahlungsbestätigung", af: "Wag vir betalingsbevestiging" }
  cancelled:{ en: "Payment cancelled", de: "Zahlung abgebrochen", af: "Betaling gekanselleer" }
  ```

Acceptance: visiting `/order/<existing-id>` while signed in shows the correct status badge + trilingual headline; flipping `orders.status` in the DB pushes the new state into the page within a couple of seconds via realtime.

---

## Out of scope
- Long-form translation of legal pages.
- Adding a full language switcher / i18n routing.
- Email receipts (separate task).
- Admin-side order management UI.

---

## Deliverables
- Updated checkout/cart components with consistent currency + trilingual labels.
- `tests/checkout.spec.ts` + `tests/_utils.ts` Playwright suite, green run report.
- New `/order/:id` page with realtime status, success page now redirects to it, migration enabling `orders` realtime, extended `copy.ts`.
