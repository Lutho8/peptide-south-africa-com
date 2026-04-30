## Goal
Ship four conversion-and-ops upgrades:
1. Admin "Discount Eligibility" panel that explains, per logged-in user, exactly why `RIDETHETIDE10` does or doesn't apply.
2. CMS-backed Global Product FAQs editable from `/admin`.
3. Robust fallback avatar for testimonials when the photo URL is missing or fails to load.
4. Scaffold full Nocobase CRM sync (newsletter, discount popup, quiz, signup, abandoned cart, orders) — placeholder credentials, ready to plug in.

---

## 1. Discount Eligibility Admin Panel
New page at `/admin/discounts` (admin-gated like testimonials).

UI:
- Search box: enter user email → look up via a new edge function `admin-discount-eligibility` (calls `auth.admin.getUserByEmail`, then counts rows in `orders`).
- Result card shows, in plain English:
  - ✅/❌ User exists
  - ✅/❌ Logged in (always true if found)
  - ✅/❌ No prior orders (`orders` count = 0)
  - Final verdict: **Eligible for `RIDETHETIDE10`** or **Not eligible — reason: already has N orders**.
- Recent-orders mini table for context.

Why edge function: `auth.admin.*` requires the service-role key, which must stay server-side. Function validates caller is admin via `has_role()` before responding.

Add link card on `/admin` index (also new — small landing page listing Testimonials, FAQs, Discount Eligibility).

---

## 2. CMS-Backed Global Product FAQs
New table `product_faqs` (question, answer, display_order, is_published, scope `'global' | 'product'`, optional `product_slug`).

- RLS: anyone reads published rows; admin role full CRUD.
- Seed migration inserts the current hard-coded global FAQs (shipping, COAs, security, etc.) so nothing visibly changes on launch.

Frontend:
- New `/admin/faqs` page — same shape as Testimonials admin (list + form, drag-free order field, publish toggle, scope dropdown).
- `ProductPage.tsx` swaps its hard-coded global FAQ array for a `useQuery` against `product_faqs` where `scope='global' AND is_published=true`, ordered by `display_order`. Product-specific FAQs from `products.ts` stay where they are (those are tied to product data, not editorial copy).

---

## 3. Testimonial Fallback Avatar
Create `<Avatar />` helper in `CustomerProofStrip.tsx` (and reuse on the testimonial admin list):
- If `photo_url` is missing → render initials chip (first letter of name on navy/teal gradient).
- If `photo_url` is present but `<img onError>` fires → swap to the same initials chip.
- Component is presentation-only, no DB changes.

---

## 4. Nocobase CRM Integration Scaffold
Since you don't have Nocobase set up yet, this lays the rails so plugging in credentials later is a 1-minute job.

### Secrets (placeholders, you fill later)
Add three runtime secrets via the secrets tool: `NOCOBASE_BASE_URL`, `NOCOBASE_API_TOKEN`, `NOCOBASE_WEBHOOK_SECRET`.

### Edge function: `nocobase-sync`
Single function with action-based payload (`action: "lead.upsert" | "order.created" | "quiz.completed" | "cart.abandoned"`). Each action POSTs to the matching Nocobase collection endpoint. Function no-ops gracefully (logs + returns 200) when secrets are blank, so the app never breaks pre-setup.

### Lead capture wiring
| Source | Trigger | Payload to Nocobase |
|---|---|---|
| Newsletter (footer) | submit | email, source=`newsletter`, stage=`subscriber` |
| Discount popup | submit | email, source=`discount_popup`, stage=`subscriber`, tag=`first_order_discount` |
| Quiz `/quiz` | final step | email, answers JSON, AI protocol summary, stage=`quiz_completed` |
| Account signup | `onAuthStateChange SIGNED_UP` | user_id, email, stage=`registered` |
| Order placed | checkout success | user_id, email, line items, total, stage=`first_purchase`/`repeat` |

### Abandoned cart
- New table `cart_snapshots` (user_id, items jsonb, subtotal, updated_at).
- `CartContext` upserts a snapshot for logged-in users on every cart change (debounced).
- Scheduled edge function `nocobase-abandoned-cart` runs hourly via `pg_cron`: finds snapshots > 24h old with no matching order in that window → sends `cart.abandoned` event to Nocobase, then marks the snapshot as notified.

### Lifecycle stage stamping
Helper `computeLifecycleStage(user)` on the server (in `nocobase-sync`) reads `orders` count to decide `subscriber → quiz_completed → first_purchase → repeat`. Every sync call recomputes and includes `stage` so your Nocobase workflows can trigger on stage transitions.

### Admin visibility
Add a small "Nocobase status" card on `/admin` landing page showing whether secrets are configured + last sync timestamp + last error (read from a new tiny `integration_logs` table the function writes to).

### Setup checklist (delivered as `NOCOBASE_SETUP.md`)
Step-by-step: spin up Nocobase, create collections (`leads`, `orders`, `quiz_responses`, `cart_events`) with required fields, generate API token, paste into Lovable secrets, done.

---

## Files to create
- `src/pages/admin/AdminIndexPage.tsx`
- `src/pages/admin/AdminDiscountEligibilityPage.tsx`
- `src/pages/admin/AdminFAQsPage.tsx`
- `src/components/Avatar.tsx`
- `supabase/functions/admin-discount-eligibility/index.ts`
- `supabase/functions/nocobase-sync/index.ts`
- `supabase/functions/nocobase-abandoned-cart/index.ts`
- `src/lib/nocobase.ts` (client-side invoker)
- `NOCOBASE_SETUP.md`

## Files to edit
- `src/App.tsx` — new admin routes
- `src/components/CustomerProofStrip.tsx` — use Avatar
- `src/pages/ProductPage.tsx` — fetch global FAQs from DB
- `src/components/Footer.tsx` — wire newsletter to nocobase-sync
- `src/components/DiscountPopup.tsx` (or wherever it lives) — wire to nocobase-sync
- `src/pages/QuizPage.tsx` — fire quiz.completed
- `src/hooks/useAuth.tsx` — fire lead.upsert on SIGNED_UP
- `src/pages/CheckoutPage.tsx` — fire order.created
- `src/context/CartContext.tsx` — upsert cart_snapshots

## Migrations
- `product_faqs` table + seed
- `cart_snapshots` table
- `integration_logs` table
- `pg_cron` schedule for abandoned-cart sweep

## Order of implementation
1. Migrations (FAQs, cart snapshots, logs)
2. Avatar fallback (smallest, instant value)
3. FAQ admin + ProductPage swap
4. Discount eligibility edge function + admin page
5. Nocobase scaffold (secrets prompt → edge functions → wiring → cron → docs)