# Security

## Reporting a vulnerability

Email security@peptide-south-africa.com with a reproducible report. Please do not file
public GitHub issues for suspected vulnerabilities.

## Automated checks (CI)

`.github/workflows/security.yml` runs on every PR and push to `main`:

1. **Edge function input validation** (`scripts/security/scan-edge-functions.mjs`) — fails the build when any Supabase edge function forwards `req.json()` fields into an AI provider without Zod/allowlist validation. Skip a file (with justification) by adding `// security-ok: <reason>` at the top.
2. **Migration GRANT check** (`scripts/security/scan-migrations.mjs`) — fails when a new `CREATE TABLE public.x` lacks a matching `GRANT ... ON public.x` in the same migration.
3. **Gitleaks** — secret-scans the diff.

A failed job blocks the PR from merging. The Lovable "Publish" button is manual
and is **not** wired to GitHub Actions — protect the source of truth in `main`,
and only publish from a green commit.

## Response headers

`index.html` ships these via `<meta>` tags (browser-enforced everywhere):

- `Content-Security-Policy-Report-Only` (will flip to enforce after a week of telemetry)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

`public/_headers` contains the production headers in Netlify/Cloudflare-Pages
format. **HSTS and `X-Frame-Options` must be sent as real HTTP headers** — the
meta-tag equivalents are ignored by browsers. Apply the rules from `_headers`
at your CDN proxy (Cloudflare Transform Rules, Netlify, Vercel) for the custom
domain `peptide-south-africa.com`.

## Row-level security

Every public-schema table has RLS enabled with policies scoped to `auth.uid()`.
Sensitive PayFast columns (`payfast_token`, `payfast_pf_payment_id`,
`payfast_subscription_id`) are removed from the `authenticated` column-level
GRANT — only `service_role` (edge functions) and admins can read them. Triggers
on `orders` and `subscriptions` reject mutations to financial/identity columns
from non-service-role sessions.

## Accepted risks

- `testimonial-photos` storage bucket is public by design.
- Supabase publishable/anon key in the client bundle is expected.
- `community_join` rate limit is best-effort (IP hash).
