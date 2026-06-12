
# Join Our Community — WhatsApp Capture Flow

Mirrors directpeptides.com's phone-gated entry. Captures name, WhatsApp number (with country code validation), and interest area before handing the user a one-tap link to the WhatsApp group. All WhatsApp BSP credentials live behind an Edge Function — never the frontend.

## User flow

```text
[Join Community CTA in Header / Footer / Floating]
        ↓
/community  → <CommunityJoinPage>
        ↓
  Form: Name • WhatsApp (E.164) • Interest
        ↓
  Client validates (zod + libphonenumber-js)
        ↓
  supabase.functions.invoke('community-join', { ...payload })
        ↓
  Edge Function:
    1. Re-validates payload (zod)
    2. Rate limits by IP (5/hr) + dedupes by phone
    3. INSERT into public.community_members
    4. (Stub) POST to BSP — logs payload, returns ok:true when no BSP key
        ↓
  Success screen → "Open WhatsApp Group" deep link (wa.me / chat.whatsapp.com)
        ↓
  Group join → BSP welcome template fires (when key is later added)
```

## Database (migration)

New table `public.community_members`:
- `name` (text, required)
- `phone_e164` (text, unique, required) — normalized E.164
- `phone_country` (text) — ISO-2
- `interest` (text) — enum-like: `weight-loss`, `peptide-stacks`, `biohacking`, `recovery`, `longevity`, `other`
- `source` (text, default `community-page`)
- `consent_marketing` (bool, required true)
- `ip_hash` (text) — sha256(ip + salt) for rate limit auditing, no raw IP
- `bsp_status` (text, default `pending`) — `pending` | `sent` | `failed` | `disabled`
- `bsp_last_error` (text, nullable)
- `joined_group_at` (timestamptz, nullable)
- timestamps + update trigger

Security:
- RLS enabled
- GRANT INSERT to `anon` only via the edge function path (we'll insert with `service_role`, so anon gets NO direct grants)
- GRANT ALL to `service_role`
- GRANT SELECT to `authenticated` WHERE `has_role(auth.uid(),'admin')`
- Policies: admin read; no client writes (everything goes through the edge function)

Rate-limit helper table `public.community_join_rate` (ip_hash, window_start, count) with a small `bump_rate` SECURITY DEFINER function returning boolean (false = blocked).

## Edge Function `community-join`

`supabase/functions/community-join/index.ts`
- Public (verify_jwt = false) — anonymous signups
- CORS via `npm:@supabase/supabase-js@2/cors`
- Zod schema on body: `{ name (1..80), phone (E.164), interest (enum), consent (true) }`
- Server-side phone parse with `libphonenumber-js/min` (re-validates E.164 + country)
- Rate limit: hash `x-forwarded-for` with `RATE_SALT`, call `bump_rate`; 429 on block
- Dedup: `ON CONFLICT (phone_e164) DO UPDATE SET name, interest, updated_at` — idempotent
- BSP call: `sendWelcomeTemplate(phoneE164)` — wrapper that:
  - Reads `WHATSAPP_BSP_API_KEY`, `WHATSAPP_BSP_BASE_URL`, `WHATSAPP_TEMPLATE_NAME`, `WHATSAPP_GROUP_INVITE_URL` from env
  - If `WHATSAPP_BSP_API_KEY` missing → returns `{ status: 'disabled' }` and logs to `integration_logs` (table exists)
  - When set later → POSTs the template with `group_invite_url` variable; updates `bsp_status`
- Response: `{ ok: true, groupUrl: WHATSAPP_GROUP_INVITE_URL ?? null }`

Secrets to add later (NOT requested now per user):
`WHATSAPP_BSP_API_KEY`, `WHATSAPP_BSP_BASE_URL`, `WHATSAPP_TEMPLATE_NAME`, `WHATSAPP_GROUP_INVITE_URL`, `RATE_SALT`.

## Frontend

New files:
- `src/pages/CommunityJoinPage.tsx` — hero (medical-navy + teal, mono eyebrow "01 / JOIN"), form card, success state with "Open WhatsApp Group" button + QR fallback, trust strip (members count, "no spam", "leave anytime")
- `src/components/community/CommunityJoinForm.tsx` — react-hook-form + zod, country dial-code `<select>` (top 10 markets, default ZA +27), `libphonenumber-js` validation, loading + error states, success callback
- `src/components/community/PhoneInput.tsx` — split country + national number
- `src/lib/communitySchema.ts` — shared zod schema (front + edge re-use shape)

Edits:
- `src/App.tsx` — route `/community` → `CommunityJoinPage`
- `src/components/Header.tsx` — add **Explore › Join WhatsApp Community** dropdown item; mobile menu entry
- `src/components/Footer.tsx` — "Community" link
- `src/components/FloatingProductFollower.tsx` — when no last-viewed product, optionally surface a small "Join WhatsApp" pill (low priority, behind flag)

SEO: `<SEO title="Join the Ride The Tide WhatsApp Community" description="…" path="/community" />` + JSON-LD `Organization` with `contactPoint`.

## Dependencies

- `libphonenumber-js` (frontend + edge via `npm:libphonenumber-js@1.11.7`)
- `react-hook-form` + `@hookform/resolvers` + `zod` (already in project — confirm during build)

## Out of scope (explicitly)

- Sending the actual welcome WhatsApp message — wrapper exists, returns `disabled` until BSP key is provisioned.
- Bot onboarding sequence — server-side cron/queue, separate follow-up task.
- Admin dashboard for community members — only DB-level admin read for now.

## Open questions before build

1. **Group invite URL** — do you already have the `chat.whatsapp.com/...` invite, or should the success screen show "We'll text you the link" until BSP is wired?
2. **Interest options** — keep the 6 I listed (weight-loss, peptide-stacks, biohacking, recovery, longevity, other) or your own list?
3. **Consent copy** — fine with "I agree to receive WhatsApp messages from Ride The Tide. Reply STOP to opt out."?
