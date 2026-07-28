# Edge Function Secrets Checklist

> Project: `eutszmrsukoqqeilzrbv`  
> Repo: `Lutho8/peptide-south-africa-com`  
> Functions: 9 original + 15 PSA-specific (24 total deployed)

---

## How to set secrets

```bash
supabase login --token <SUPABASE_ACCESS_TOKEN>
supabase link --project-ref eutszmrsukoqqeilzrbv

# Set one or more secrets
supabase secrets set --project-ref eutszmrsukoqqeilzrbv KEY1="value1" KEY2="value2"

# Verify what's set
supabase secrets list --project-ref eutszmrsukoqqeilzrbv
```

**Note:** Secret values are encrypted at rest. The `list` command only shows key names, never values.

---

## Original 9 Functions (from repo)

| # | Function | verify_jwt | Secrets Required | Notes |
|---|----------|-----------|------------------|-------|
| 1 | `admin-discount-eligibility` | true | None (DB-only) | Checks `orders` table for first-order discount |
| 2 | `community-join` | false | `BSP_API_KEY` (optional) | WhatsApp Business API key for group invites |
| 3 | `generate-protocol` | true | `OPENAI_API_KEY` or `KIMI_API_KEY` | AI protocol generation |
| 4 | `nocobase-abandoned-cart` | false | `NOCOBASE_API_KEY`, `NOCOBASE_BASE_URL` | Syncs abandoned carts to NocoBase CRM |
| 5 | `nocobase-sync` | true | `NOCOBASE_API_KEY`, `NOCOBASE_BASE_URL` | General NocoBase sync |
| 6 | `payfast-create-payment` | true | `PAYFAST_MERCHANT_ID`, `PAYFAST_MERCHANT_KEY`, `PAYFAST_PASSPHRASE` | **CRITICAL — checkout breaks without** |
| 7 | `payfast-itn` | false | `PAYFAST_MERCHANT_ID`, `PAYFAST_MERCHANT_KEY`, `PAYFAST_PASSPHRASE` | **CRITICAL — payment confirmation breaks without** |
| 8 | `process-email-queue` | true | `EMAIL_PROVIDER_API_KEY`, `EMAIL_FROM_ADDRESS`, `EMAIL_PROVIDER_BASE_URL` (optional) | **CRITICAL — emails break without** |
| 9 | `retention-scheduler` | false | None (DB-only) | Cron-scheduled retention events |

---

## PSA-Specific Functions (deployed to TARGET, not in repo)

These functions were deployed outside the repo. You must verify their secrets are set:

| Function | Secrets Likely Required |
|----------|------------------------|
| `psa-master-data-sync` | `NOCOBASE_API_KEY`, `NOCOBASE_BASE_URL` |
| `psa-order-sync` | `NOCOBASE_API_KEY`, `NOCOBASE_BASE_URL` |
| `psa-whatsapp-vip` | `BSP_API_KEY` or `WHATSAPP_API_KEY` |
| `psa-gmail-autosend` | `GMAIL_REFRESH_TOKEN`, `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET` |
| `psa-payment-reconciliation` | `PAYFAST_MERCHANT_ID`, `PAYFAST_MERCHANT_KEY` |
| `psa-tracker-pipeline` | `KIMI_API_KEY` or `OPENAI_API_KEY` |
| `psa-competitor-monitor` | `SERPER_API_KEY` or `SCRAPINGBEE_API_KEY` |
| `psa-abandoned-cart-bridge` | `NOCOBASE_API_KEY` |
| `psa-abandoned-cart-bridge-v2` | `NOCOBASE_API_KEY` |
| `psa-abandoned-cart-bridge-v3` | `NOCOBASE_API_KEY` |
| `psa-event-registration` | None (DB-only) |
| `psa-nurture-scheduler` | `EMAIL_PROVIDER_API_KEY` |
| `psa-payment-reconciliation-v2` | `PAYFAST_MERCHANT_ID`, `PAYFAST_MERCHANT_KEY` |
| `psa-content-agent` | `KIMI_API_KEY` or `OPENAI_API_KEY` |
| `psa-content-distributor` | `BUFFER_API_KEY` or social media API keys |
| `psa-lead-scorer` | None (DB-only) |
| `psa-webhook-router` | `WEBHOOK_SECRET` (optional) |

---

## Smoke Test Commands

Run these after secrets are set to verify each critical path:

### PayFast (checkout flow)
```bash
curl -s -X POST "https://eutszmrsukoqqeilzrbv.supabase.co/functions/v1/payfast-create-payment" \
  -H "Authorization: Bearer <TARGET_ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"order_id":"00000000-0000-0000-0000-000000000000","amount":100,"currency":"ZAR"}'
```
Expected: `200 OK` with JSON containing `payment_url`.

### Email queue
```bash
curl -s -X POST "https://eutszmrsukoqqeilzrbv.supabase.co/functions/v1/process-email-queue" \
  -H "Authorization: Bearer <TARGET_ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"limit":1}'
```
Expected: `200 OK` or `204 No Content` (if queue empty).

### Community join
```bash
curl -s -X POST "https://eutszmrsukoqqeilzrbv.supabase.co/functions/v1/community-join" \
  -H "Content-Type: application/json" \
  -d '{"name":"Smoke Test","phone_e164":"+27831234567","interest":"fat-loss","consent_marketing":true}'
```
Expected: `200 OK` with success JSON.

### NocoBase sync
```bash
curl -s -X POST "https://eutszmrsukoqqeilzrbv.supabase.co/functions/v1/nocobase-sync" \
  -H "Authorization: Bearer <TARGET_ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{}'
```
Expected: `200 OK`.

---

## Redeploy After Secret Changes

Secrets are injected at function startup. If you change a secret, redeploy the affected function:

```bash
supabase functions deploy payfast-create-payment --project-ref eutszmrsukoqqeilzrbv
supabase functions deploy payfast-itn --project-ref eutszmrsukoqqeilzrbv
supabase functions deploy process-email-queue --project-ref eutszmrsukoqqeilzrbv
```
