
# Peptide South Africa — ERP, Retention & Operations Plan

Scope locked from your answers:
- **Phase 1 priorities (this build):** Retention/reorder engine • SA payment-processing resilience • Customer DB enrichment
- **SMS:** No outbound automation. WhatsApp click-to-chat only (already on site via floating support). Drips go via email.
- **Inventory:** SKU-level vial counts (not batch/lot FIFO). Batches table already exists for COA — kept separate from sellable stock.

---

## Phase 1 — Retention, SA Payment Resilience, Customer DB (2–3 weeks)

### 1.1 Retention & Reorder Engine
Goal: turn a first order into a 2nd, 3rd, 4th — the highest-ROI lever.

**New tables**
- `email_outbox` — queued emails (`user_id`, `template`, `payload jsonb`, `send_at`, `sent_at`, `status`, `error`). Service-role only; cron drains it.
- `retention_events` — append-only log (`user_id`, `event`, `meta`, `occurred_at`) for "order_paid", "reorder_due", "winback_sent", "subscribe_save_opened". Powers later analytics.
- `subscribe_save_offers` — per-product cadence + discount % (`product_slug`, `interval_weeks`, `discount_pct`, `active`). Editable from admin.

**Extend existing**
- `reorder_reminders` (already exists): add `channel` ('email'), `template` enum, `attempt_count`.
- `loyalty_credits` (already exists): wire to "Earn R50 for each verified review" + "R100 on every 3rd reorder".

**Edge functions**
- `retention-scheduler` — pg_cron every 15 min. Scans `reorder_reminders` where `due_at <= now() and sent_at is null`, enqueues to `email_outbox` with the right template (D-7 nudge, D-0 reorder, D+14 winback). Reads partial usage from variant pack size (3-Pack = ~12 weeks of standard protocol, 1-Pack = ~4).
- `email-sender` — drains `email_outbox` in batches via the **Brevo connector** (already documented; transactional sender). Honors `suppressed_emails`. 429-aware retry.
- `loyalty-credit-issuer` — fires from PayFast ITN on order paid: writes credit rows per the rules above.

**Frontend**
- **Subscribe & Save toggle** on PDP variant card (10% off + free shipping unlocked at any cart size). Writes to existing `subscriptions` table.
- **"Reorder in 1 click"** card on `/account` showing last 3 orders with one-tap re-add to cart.
- **Loyalty balance pill** in header for signed-in users, with `/account/credits` ledger view.
- **Post-purchase upsell email** rendered server-side (BPC + bac-water bundle, 15% off in next 14 days).

**Cron**
```sql
select cron.schedule('retention-tick', '*/15 * * * *',
  $$ select net.http_post('https://…/retention-scheduler', …) $$);
select cron.schedule('email-drain',    '* * * * *',     /* every minute */ ...);
```

### 1.2 SA Payment-Processing Resilience
Goal: never lose a sale to a single processor outage / declined card.

**Multi-rail checkout**
- Keep **PayFast** as primary (already wired).
- Add **Yoco** as a parallel rail (card + Apple/Google Pay, low fees, SA-native). New edge function `yoco-create-payment` + ITN handler mirroring PayFast pattern. Switchable per-order based on a `payment_provider` column added to `orders`.
- Add **EFT/Ozow** fallback for high-value carts (R3k+) — Ozow has the lowest fee and best SA conversion for bigger baskets. New `ozow-create-payment` + webhook.
- Surface all three at checkout as **"Pay by card / Instant EFT / Apple Pay"** tabs. Provider chosen client-side; server signs the right payload.

**Workarounds for declined / 3DS-failing cards (common SA pain)**
- **Retry rail** — if PayFast returns `payment_status = FAILED`, surface a "Try another method" CTA on the return URL that pre-fills an Ozow session for the same `order_id`. No re-entry of address.
- **Saved cards via PayFast tokenization** (already partially captured in `orders.payfast_token`) — extend `subscriptions` table to bill the token directly for reorders, bypassing checkout entirely on Subscribe & Save renewals.
- **Bank-transfer escape hatch** — a manual "Pay by EFT" option that creates a `pending` order, emails the user the banking details + unique reference, and lets admin mark paid from `/admin/orders`. Critical for corporate / clinic buyers.

**New table**
- `payment_attempts` (`order_id`, `provider`, `status`, `external_id`, `raw jsonb`, `created_at`) — full audit trail across rails. Powers retry UX and admin recon.

### 1.3 Customer DB Enrichment
Goal: every order builds the lifetime customer record, not just an `auth.users` row.

**New tables**
- `customer_profiles` (1:1 with `auth.users`): `phone_e164`, `whatsapp_optin`, `marketing_optin`, `province`, `birth_year`, `goals text[]` (from quiz), `acquisition_source`, `first_order_at`, `lifetime_value_zar`, `last_order_at`, `order_count`, `preferred_protocol`, `gp_consult_status`, `notes`.
- `customer_segments` — derived view refreshed nightly: `vip` (LTV > R10k), `at_risk` (no order 90+ days), `new` (<30 days), `quiz_lead_no_purchase`, `subscriber_active`. Drives targeted email campaigns from 1.1.
- `customer_tags` — free-form admin tags (`user_id`, `tag`, `created_by`).

**Auto-enrichment triggers**
- On `orders` insert paid: bump `order_count`, `lifetime_value_zar`, `last_order_at`, set `first_order_at` if null, write `retention_events` row.
- On quiz submit: upsert `goals` + `acquisition_source = 'quiz'`.
- On community-join: set `marketing_optin = true`.

**Admin: `/admin/customers`**
- Searchable list (email, phone, tag, segment).
- Detail view: timeline (orders, quiz, emails sent/opened, retention events), segment chips, tag editor, one-click "send reorder nudge now", "issue R100 loyalty credit", "open WhatsApp chat" (deep-link with pre-filled context).
- CSV export for ad-platform custom audiences (see Phase 3.4).

---

## Phase 2 — Inventory, Fulfilment & Operations (2 weeks, after Phase 1 ships)

### 2.1 SKU-level Inventory
- `inventory` table: `product_slug`, `variant_label`, `qty_on_hand`, `qty_reserved`, `reorder_threshold`, `updated_at`.
- Reserve on order create, decrement on `paid`, release on `cancelled`.
- "Only 3 left" badge on PDP when `qty_on_hand - qty_reserved <= 5`.
- Low-stock email to ops when below threshold.

### 2.2 Fulfilment Workflow
- `shipments` table: `order_id`, `courier` ('the-courier-guy'|'aramex'|'paxi'), `tracking_number`, `status`, `shipped_at`, `delivered_at`, `pod_url`.
- `/admin/fulfilment` Kanban: **Paid → Picking → Packed → Shipped → Delivered**. Drag-to-advance; each transition fires the right transactional email + `retention_events` row.
- Public `/track/:orderId` page reads `shipments` (replaces current placeholder).

### 2.3 SOPs
- New `sops` table + `/admin/sops` markdown editor with version history. Seeded with: pick-and-pack checklist, cold-chain handoff, COA-to-batch reconciliation, refund SOP, POPIA data-request SOP.

---

## Phase 3 — Growth Infrastructure (1–2 weeks)

### 3.1 Ad-Account Integration
- **Meta CAPI** edge function `meta-capi-event` — server-side `Purchase`, `InitiateCheckout`, `Lead` events with hashed email/phone. Avoids iOS 14 / ad-blocker loss.
- **Google Ads Enhanced Conversions** — fires on PayFast ITN paid.
- **TikTok Events API** (already a connector option) — same pattern.
- Single `marketing_events` edge function fan-outs to all three from one ITN webhook.

### 3.2 Email Domain & Templates
- Set up Lovable Emails domain on `notify.peptide-south-africa.com`.
- Branded HTML templates: order_confirmation, shipped, delivered, reorder_d7, reorder_d0, winback_d14, subscribe_save_renewal, loyalty_credit_earned, abandoned_cart_d1.

### 3.3 Admin ERP Dashboard (`/admin`)
- Cards: today's revenue, paid orders, MRR from subs, AOV, repeat rate, low-stock SKUs, pending fulfilment.
- Charts: revenue 30d, cohort retention (% of month-N customers ordering in month N+1).

---

## What's explicitly out of this plan
- Outbound SMS / WhatsApp automation (you chose click-to-chat only — kept as-is).
- Batch/lot FIFO inventory (SKU-level chosen; existing `product_batches` table stays for COA display only).
- Custom ERP UI beyond the admin pages listed.

---

## Build sequencing inside Phase 1
```text
Week 1
  ├─ customer_profiles + triggers + /admin/customers (1.3)
  └─ email_outbox + Brevo email-sender + retention-scheduler cron (1.1)
Week 2
  ├─ Subscribe & Save toggle + token-based renewal billing (1.1 + 1.2)
  ├─ Loyalty credit issuer + /account/credits (1.1)
  └─ Yoco rail + retry UX (1.2)
Week 3
  ├─ Ozow rail for >R3k carts (1.2)
  ├─ EFT escape hatch + admin mark-paid (1.2)
  └─ Post-purchase upsell email + reorder D-7 / D-0 / D+14 (1.1)
```

## Approvals & secrets needed before starting
- **Brevo connector** linked (for transactional email — no SMS).
- **Yoco** merchant API key (request via add_secret after you confirm an account).
- **Ozow** API site code + private key (same).
- **Meta CAPI**, **Google Ads**, **TikTok Events** access tokens (Phase 3 — not needed now).
- Confirm bank-account details + reference format for the EFT escape hatch.

Ready to start Phase 1 when you approve. I'll begin with the customer DB + retention scheduler since those unlock everything else.
