# Nocobase CRM Integration Setup

This project pushes leads, orders, quiz responses, and abandoned cart events to a
Nocobase CRM via the `nocobase-sync` edge function. Until you add credentials,
all events are logged with `status = "skipped_not_configured"` in the
`integration_logs` table — your app continues to work normally.

## 1. Spin up Nocobase

Either:
- **Self-host** (Docker): `docker run -p 13000:80 -v $(pwd)/storage:/app/nocobase/storage nocobase/nocobase:main`
- **Cloud**: sign up at https://www.nocobase.com/

Note your base URL (e.g. `https://crm.yourdomain.com` or `http://your-host:13000`).

## 2. Create the four collections

In the Nocobase admin UI, create these collections with the listed fields:

### `leads`
- `email` (string, unique)
- `user_id` (string, nullable) — Supabase user id when known
- `name` (string, nullable)
- `whatsapp` (string, nullable)
- `source` (string) — `newsletter` / `discount_popup` / `signup` / `quiz`
- `tag` (string, nullable)
- `stage` (string) — `subscriber` / `registered` / `quiz_completed` / `first_purchase` / `repeat` / `cart_abandoner`

### `orders`
- `user_id` (string)
- `email` (string)
- `items` (json)
- `subtotal` (number)
- `discount_code` (string, nullable)
- `discount_amount` (number)
- `total` (number)
- `stage` (string)

### `quiz_responses`
- `name` (string)
- `email` (string)
- `whatsapp` (string, nullable)
- `answers` (json)
- `protocol_summary` (text, nullable)
- `stage` (string)

### `cart_events`
- `user_id` (string)
- `email` (string, nullable)
- `items` (json)
- `subtotal` (number)
- `updated_at` (date) — when cart was last touched
- `stage` (string)

## 3. Generate an API token

Settings → Users & Permissions → API keys → "Add new". Grant `create` on the four
collections above. Copy the token.

## 4. Add the secrets in Lovable Cloud

In the Lovable project, set the runtime secrets:

- `NOCOBASE_BASE_URL` — e.g. `https://crm.yourdomain.com`
- `NOCOBASE_API_TOKEN` — the token from step 3
- `NOCOBASE_WEBHOOK_SECRET` — random string (reserved for future inbound webhooks)

That's it. The next event will flow through and you'll see `status = "ok"` in the
admin Nocobase status panel at `/admin`.

## 5. (Optional) Build automations in Nocobase

Suggested workflows:

- **`subscriber → quiz_completed`**: send "Thanks for taking the quiz" email with the protocol summary.
- **`quiz_completed` not converted in 3 days**: send a follow-up with the GP consultation link.
- **`cart_abandoner` after 24h**: send a personalised cart reminder with the items.
- **`first_purchase`**: kick off a 4-week onboarding sequence (week 1 dosing tips, week 2 storage, etc.).
- **`repeat` (orders ≥ 2)**: invite to the loyalty program.

## Architecture

```
Frontend events  ──►  syncToNocobase()  ──►  edge fn nocobase-sync  ──►  Nocobase REST
                                                  │
                                                  └──►  integration_logs (audit)

Hourly pg_cron   ──►  edge fn nocobase-abandoned-cart  ──►  cart_snapshots > 24h old
                                                          ──►  syncToNocobase("cart.abandoned")
```

All wiring is in:
- `src/lib/nocobase.ts` — frontend client
- `supabase/functions/nocobase-sync/index.ts` — outbound proxy + audit log
- `supabase/functions/nocobase-abandoned-cart/index.ts` — hourly sweep
