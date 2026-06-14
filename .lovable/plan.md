## Goal
Block deployments on new security findings, ship browser security headers for the storefront, and tighten Postgres row-level security so users can only ever read/modify their own cart, orders, and subscriptions.

---

## 1. CI security gates (GitHub Actions)

Add `.github/workflows/security.yml`, triggered on `pull_request` and `push` to `main`. Three jobs, all required to pass:

- **supabase-linter** — installs the Supabase CLI, runs `supabase db lint` against `supabase/migrations/**`, fails on any `error` or `warn` level finding.
- **prompt-injection-scan** — small Node script (`scripts/security/scan-edge-functions.ts`) that walks `supabase/functions/**/index.ts` and fails if any file passes `req.json()` fields into an AI prompt without going through a Zod schema or an allowlist. Catches the same class as the recent `generate-protocol` finding.
- **secret-scan** — runs `gitleaks` in detect mode on the diff; fails on any high-confidence hit.

A short `SECURITY.md` documents how to mark a finding as accepted (add an inline `// security-ok: <reason>` comment, which the scanner respects).

Caveat to call out in the PR description: GitHub Actions blocks merges to `main`, but the Lovable "Publish" button is manual and not gated by Actions. The workflow protects the source of truth; publishing remains a human step.

## 2. Security response headers

Lovable's CDN serves a fixed header set, so we layer defenses in two places:

**a) `index.html` `<meta>` tags** (works in every browser, ships immediately):
- `Content-Security-Policy-Report-Only` — strict allowlist (self, Supabase project, PayFast sandbox+live, Lovable AI gateway, Google Fonts, Webflow CDN images, GA). Report-only for one week so we can collect violations before enforcing.
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Content-Type-Options: nosniff` (via `<meta http-equiv>`)

**b) `public/_headers`** — if the user's custom domain (`ridethetide.site`) sits behind Cloudflare or a similar proxy, this file gives them a ready-to-paste rule set for real HTTP headers:
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options: DENY`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- Same CSP as above but enforcing.

I'll document in `SECURITY.md` that HSTS and `X-Frame-Options` only take effect once the Cloudflare/Netlify rule is applied — Lovable's CDN ignores meta-tag versions of these two.

After the report-only window, a follow-up change flips the CSP meta tag from `Content-Security-Policy-Report-Only` to `Content-Security-Policy`.

## 3. RLS hardening — cart, orders, subscriptions

Single migration that rewrites the policies for least-privilege coverage of every command (`SELECT`, `INSERT`, `UPDATE`, `DELETE`), explicitly scoped to `auth.uid()`.

**`cart_snapshots`** — replace the broad `FOR ALL` policy with four narrow ones (`SELECT`, `INSERT`, `UPDATE`, `DELETE`), each gated on `auth.uid() = user_id` for both `USING` and `WITH CHECK`. Add a `BEFORE INSERT/UPDATE` trigger that forces `user_id := auth.uid()` so a client can't write someone else's id even if RLS allowed it.

**`orders`** — already has `SELECT (own)`, `INSERT (own)`, admin `SELECT`. Add:
- `UPDATE` policy: users may update **only** `shipping_country`, `shipping_method` while `status = 'pending'`. Enforced by a trigger (`protect_orders_sensitive_cols`) that raises if any of `user_id, total, status, currency, paid_at, payfast_*, shipping_cost, free_shipping_applied, discount_code, order_description` changes from a non-service-role session.
- Explicit `DELETE` denial for `anon`/`authenticated` (no policy = denied, but add a comment for clarity).
- Re-confirm column-level GRANTs from the 2026-06-13 migration still exclude `payfast_token` and `payfast_pf_payment_id` from `authenticated`.

**`subscriptions`** — keep existing policies, add:
- A `protect_subscription_user_id` check in the existing `protect_subscription_sensitive_cols` trigger (already covers most fields; add `id` and re-verify).
- Explicit `DELETE` denial (only `service_role`/admin).
- Re-confirm column-level GRANTs exclude `payfast_token` and `payfast_subscription_id`.

**Verification queries** included as comments in the migration so anyone can re-run them: `SELECT count(*) FROM orders WHERE user_id <> auth.uid()` from an authenticated session must return 0.

## 4. Files

```text
.github/workflows/security.yml           new
scripts/security/scan-edge-functions.ts  new
SECURITY.md                              new
public/_headers                          new (documented, opt-in)
index.html                               edited (CSP report-only + referrer + nosniff meta)
supabase/migrations/<ts>_rls_hardening.sql  new
```

## 5. Out of scope

- Flipping CSP from report-only to enforce (follow-up after one week of telemetry).
- Setting real HTTP headers — needs Cloudflare/Netlify access on `ridethetide.site` from the user.
- Rewriting PayFast ITN verification (already server-side verified).
