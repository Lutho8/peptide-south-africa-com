## Scope

Three workstreams, sequenced. **Explicitly excluded:** ad cloaking, BM rotation to evade bans, MCC miscoding, payment-processor workarounds, and SKU codes used to hide products from regulators. Internal codes are used as a clean SKU taxonomy only — the real compound name is always visible to the buyer.

```text
W1  Catalog & Trust       → SKU codes · Janoshik COA layer · RUO/GP split
W2  Retention & Billing   → Stripe subscriptions · reorder · referral · loyalty
W3  ERP & Email Automation→ Admin (inventory/batches/orders) · lifecycle emails
```

---

## Workstream 1 — Catalog & Trust Layer

### 1.1 Internal SKU code system
Pattern: `RTT-<class><n>-<mg>` (e.g. `RTT-RT3-10` Retatrutide 10mg, `RTT-TZ2-10` Tirzepatide 10mg, `RTT-BPC-5` BPC-157 5mg).

- Extend `Product` in `src/data/products.ts` with `sku`, `casNumber`, `compoundClass`, `track: "RUO" | "GP"`.
- Render SKU + CAS on PDP, ProductCard footer, label, COA, invoice, packing slip. Compound name stays primary.

### 1.2 Hybrid catalog (RUO vs GP pathway)
- Add `track` filter chip on `/shop` (default: All · Research · Clinical).
- GP-track products (Reta/Tirz/Sema weight-loss) route Add-to-Cart → `/quiz` → GP review → partner pharmacy. RUO-track products check out normally with researcher attestation at cart.
- New `<TrackBadge>` component on every card/PDP making the pathway unambiguous.
- Researcher attestation checkbox in cart for any RUO item (POPIA-compliant, stored on order).

### 1.3 Janoshik COA / testing layer
- New table `product_batches` (per-variant batch records with COA PDF URL, HPLC %, mass spec, endotoxin, test date, lab name).
- New `/testing` page: explains methodology, links every published batch, "Verify your batch" lookup by lot number.
- PDP "Lab Results" tab pulls the latest batch + downloadable COA. Label/packing slip prints the lot.
- Admin upload UI in W3.

### 1.4 Pricing reposition
- Anchor pack pricing closer to Direct Peptides tier (10-pack premium, not bargain). Discount curve stays (8/15/28 %) but base prices lifted on Reta/Tirz/Sema. Show "Lab-verified · Janoshik tested" badge next to price.

---

## Workstream 2 — Retention & Subscriptions

### 2.1 Stripe (built-in Lovable Payments)
- Enable via `payments--enable_stripe_payments` after eligibility check.
- Tax: managed payments (full compliance) if eligible, otherwise automatic_tax.
- Keep NowPayments (crypto) as a parallel checkout option for one-off orders.

### 2.2 Subscriptions
- New table `subscriptions` (user, product_variant, interval 4w/8w/12w, next_charge_at, status, stripe_subscription_id).
- PDP toggle: "One-time" vs "Subscribe & save 12 %".
- Customer portal at `/account/subscriptions`: pause, skip next, swap variant, change interval, cancel.
- Edge functions: `stripe-create-subscription`, `stripe-webhook` (handle `invoice.paid`, `customer.subscription.updated/deleted`, `invoice.payment_failed`).

### 2.3 Reorder & loyalty
- `reorder_reminders` table — scheduled 7 days before estimated vial-depletion based on last order's pack size + protocol cadence.
- `referral_codes` table (`code`, `owner_user_id`, `reward_zar`, `redemptions`). Auto-issue on first delivered order. Both sides get R150 credit.
- `loyalty_credits` ledger (earn 5 % of each delivered order, spend at checkout).

---

## Workstream 3 — ERP & Email Automation

### 3.1 Admin / ERP
Lives under existing `/admin`, gated by `has_role('admin')`.

- **Inventory** — per-variant stock, low-stock threshold, restock button → adjusts `stock` on variant.
- **Batches** — CRUD `product_batches` (COA upload to Supabase Storage `coa-pdfs` bucket).
- **Orders** — pipeline view (paid → picking → packed → shipped → delivered), bulk print picklists, tracking number entry.
- **Customers** — search, lifetime value, last order, active subscription, suppression status.
- **Subscriptions** — list, force-skip, refund, cancel.

### 3.2 Lifecycle email automation (Lovable Emails)
Prereq run automatically: `email_domain--setup_email_infra` → `email_domain--scaffold_transactional_email`.

Templates registered:
1. `order-confirmation` (triggered on `orders.status='paid'`)
2. `shipped` (admin marks shipped → tracking link)
3. `delivered-followup` (T+3d, asks for review, links cheat-sheet)
4. `reorder-reminder` (scheduler hits `reorder_reminders.due_at`)
5. `subscription-renewal-receipt` (stripe webhook)
6. `subscription-payment-failed` (3-attempt dunning)
7. `winback-30d` / `winback-60d` (no orders 30/60 days)
8. `referral-reward-earned`

Scheduling via `pg_cron` job hitting an edge function `process-lifecycle-emails` every 15 min.

### 3.3 Analytics & ad attribution (legitimate)
- UTM persistence in `localStorage` + first-touch attribution on `orders.attribution_json`.
- Meta CAPI + TikTok Events API + GA4 server-side events via edge function `track-conversion` fired from `stripe-webhook`. Consent gating respects existing cookie banner.
- No cloaking. No throwaway BMs. One properly-configured pixel per channel.

---

## Database changes (single migration sequence)

```text
products(sku, cas_number, compound_class, track)        ALTER
product_batches                                          NEW
subscriptions                                            NEW
reorder_reminders                                        NEW
referral_codes, referral_redemptions                     NEW
loyalty_credits                                          NEW
suppressed_emails / email_send_log                       created by email infra tool
```

Every public table gets GRANTs + RLS (owner-scoped for customer-facing, `has_role('admin')` for admin tables).

---

## Out of scope (will refuse if asked again)
- Ad cloaking, doorway pages, reviewer-vs-buyer content swaps
- Backup ad accounts / BM rotation to circumvent platform bans
- MCC miscoding or processor evasion
- Marketing weight-loss GLP-1s to SA consumers outside the GP pathway
- SKU codes whose stated purpose is to dodge regulator keyword detection

## Sequencing
W1 (≈3–4 days) → W2 (≈4–5 days) → W3 (≈5–7 days). Each workstream ships independently and is usable on its own.

## Open items I'll confirm before W2 starts
- Final ZAR price anchors for RT3/TZ2/Sema 10-packs (suggest R22,500 / R15,900 / R8,900 to mirror DP positioning — confirm).
- Subscription discount % (default 12 %).
- Referral reward amount (default R150 both sides).