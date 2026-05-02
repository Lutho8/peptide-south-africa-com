## Goal

Add a reusable, collapsible **Delivery & Returns** section to both the checkout and product pages, with locked-in microcopy. Then fire a final CRM lead capture event when an order is confirmed, including order id, items, and applied discount code.

## 1. New component: `DeliveryReturnsAccordion`

Create `src/components/DeliveryReturnsAccordion.tsx` using the existing shadcn `Accordion` primitive so it stays on-brand and matches existing PDP accordions.

Three collapsible items, all closed by default (or "shipping" open by default on checkout):

- **Shipping & Timing**
  - Same-day dispatch on orders placed before 14:00 SAST (Mon–Fri).
  - Delivered nationwide in South Africa via Aramex / PEP Paxi.
  - Estimated delivery: **1–3 business days** to major metros, **2–5 business days** to regional/rural addresses.
  - Tracking link emailed as soon as the courier collects.

- **Discreet, Unbranded Packaging**
  - Plain, unmarked outer box — no Ride The Tide branding, logos, or product references on the exterior.
  - Sealed, temperature-stable inner packaging with a silica desiccant.
  - Sender shown on the waybill as a neutral fulfilment name.

- **Returns & Guarantee**
  - **30-day satisfaction guarantee** on unopened, sealed vials.
  - Damaged-in-transit or incorrect items: replaced free of charge, reported within 48 hours of delivery.
  - For health and safety reasons, opened or reconstituted vials are non-returnable (industry standard).
  - Refunds processed to the original payment method within 5–7 business days of receiving the return.

Props:
- `defaultOpen?: "shipping" | "packaging" | "returns" | null`
- `className?: string`

Visual: navy/teal accents already used on the trust bar; small lucide icons (`Truck`, `PackageCheck`, `RotateCcw`) per row.

## 2. Wire it into Checkout

In `src/pages/CheckoutPage.tsx`:
- Add `<DeliveryReturnsAccordion defaultOpen="shipping" />` directly under the Shipping Address card.
- Remove the now-duplicated one-line "Discreet, unbranded packaging…" microcopy (it lives in the accordion).

## 3. Wire it into Product pages

In `src/pages/ProductPage.tsx`:
- Add `<DeliveryReturnsAccordion />` (all closed) in the right-hand column under the existing trust/CTA block, above the FAQ accordion. This keeps PDP scannable while making the policy one click away.

## 4. Final lead capture on order confirmation

Currently `CheckoutPage.handleSubmit` sets `submitted=true` after inserting the order, but the inserted order's id isn't captured and no `lead.upsert` is fired with the final order context.

Changes in `src/pages/CheckoutPage.tsx`:
- Change the order insert to `.insert({...}).select("id").single()` so we get `orderId`.
- Store `orderId` in component state so the confirmation screen can show it.
- After the existing `order.created` sync, also fire a final `captureLead` with `source: "order"` carrying:
  - `order_id`
  - `email`
  - `user_id`
  - `subtotal`, `discount_code`, `discount_amount`, `total`
  - `items` (same shape as the order payload: product_id, name, variant_label, quantity, price)
  - `extraTags`: `["order_confirmed"]` plus `"first_order_discount_used"` when `discountCode === "RIDETHETIDE10"`
- Render `Order #<short-id>` on the confirmation screen for user reassurance.

Guardrails:
- Both syncs remain fire-and-forget (already non-throwing in `lib/nocobase.ts`).
- Guest checkout (no `user`) still works — lead capture is skipped, matching today's behaviour.

## Technical notes

- No schema changes; `captureLead` already accepts arbitrary `extra` and `extraTags`.
- The `nocobase-sync` edge function already routes `lead.upsert` → `leads` collection and stamps stage when missing; passing `stage` via `captureLead` ("customer") keeps lifecycle correct.
- All copy is centralised in the new component so future edits are one-file.

## Files

- **Create:** `src/components/DeliveryReturnsAccordion.tsx`
- **Edit:** `src/pages/CheckoutPage.tsx`, `src/pages/ProductPage.tsx`
