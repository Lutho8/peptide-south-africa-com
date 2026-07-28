# Peptide South Africa — Supabase Migration Report
> Generated: 2026-07-28 13:43 UTC+2 (Europe/Berlin)  
> Migration branch: `migrate/supabase-project-eutszmrsukoqqeilzrbv`  
> Auditor: Kimi (autonomous)

---

## Executive Summary

| Item | Status |
|------|--------|
| **Schema** | ✅ COMPLETE — 58 tables, 79 RLS policies, 140+ indexes, 29 triggers, 14 FKs |
| **Edge Functions** | ✅ DEPLOYED — 24 functions active on TARGET |
| **Code Config** | ✅ READY — `.env`, `index.html` CSP, `config.toml` all point to TARGET |
| **Auth Users** | 🔴 CRITICAL GAP — 0 users in TARGET |
| **Order Data** | 🔴 CRITICAL GAP — 0 rows in `orders`, `psa_orders` |
| **Customer Data** | 🔴 CRITICAL GAP — 0 rows in `psa_customers`, `customer_profiles` |
| **Function Secrets** | ⚠️ UNVERIFIED — Must be re-set on TARGET manually |
| **Storage Objects** | ⚠️ UNVERIFIED — Must be copied from SOURCE |
| **Vercel Env Vars** | ⚠️ NOT SET — Must be configured in Vercel dashboard |
| **Lovable Disconnect** | ⚠️ NOT DONE — Must be disabled in Lovable UI |

**Bottom line:** The schema and functions are ready. The only thing blocking production cutover is **data migration** (auth users + public rows) and **secret configuration**.

---

## Environment Verified

| Component | Identifier | Status |
|-----------|-----------|--------|
| SOURCE Supabase | `cveapedneuhgbxqydpjc` | ❌ MCP access denied (Lovable-managed) |
| TARGET Supabase | `eutszmrsukoqqeilzrbv` | ✅ Healthy, ACTIVE, eu-west-2 |
| Vercel Project | `peptide-south-africa-com` | ✅ Live on `www.peptide-south-africa.com` |
| Production Repo | `Lutho8/peptide-south-africa-com` | ✅ `main` branch |
| Migration Branch | `migrate/supabase-project-eutszmrsukoqqeilzrbv` | ✅ 4 commits, ready for PR |

---

## Deep Schema Audit Results

### Tables (58 public tables)

TARGET contains all tables from all 34 repo migrations:

**Original Lovable tables:** `user_roles`, `testimonials`, `orders`, `product_faqs`, `cart_snapshots`, `integration_logs`, `seo_reindex_log`, `affiliate_applications`, `product_batches`, `subscriptions`, `reorder_reminders`, `referral_codes`, `referral_redemptions`, `loyalty_credits`, `community_members`, `community_join_rate`, `customer_profiles`, `customer_tags`, `retention_events`, `email_outbox`, `email_send_log`, `email_send_state`, `suppressed_emails`, `email_unsubscribe_tokens`, `payment_attempts`, `subscribe_save_offers`, `shipments`, `fulfilment_events`, `refunds_chargebacks`, `expenses`

**PSA CRM tables:** `psa_customers`, `psa_products`, `psa_competitors`, `psa_events`, `psa_analytics_daily`, `psa_orders`, `psa_subscriptions`, `psa_content`, `psa_ambassadors`, `psa_tracker_events`, `psa_email_sends`, `psa_whatsapp_sends`, `psa_payment_discrepancies`, `psa_leads`, `psa_cart_abandons`, `psa_event_registrations`, `b2b_accounts`, `psa_pets_waitlist`, `psa_pets_launch_box`, `unified_customer`, `crm_abandoned_carts`, `crm_at_risk_customers`, `crm_customer_lifecycle`, `crm_followups`, `crm_kpis`, `crm_revenue_daily`, `crm_whatsapp_log`

**Row counts in TARGET (seed data only):**

| Table | Rows | Notes |
|-------|------|-------|
| `auth.users` | **0** | 🔴 BLOCKER |
| `orders` | 0 | 🔴 BLOCKER |
| `psa_orders` | 0 | 🔴 BLOCKER |
| `psa_customers` | 0 | 🔴 BLOCKER |
| `customer_profiles` | 0 | 🔴 BLOCKER |
| `psa_products` | 16 | ✅ Seed data present |
| `psa_competitors` | 9 | ✅ Seed data present |
| `psa_analytics_daily` | 264 | ✅ Seed data present |
| `psa_leads` | 4 | ✅ Seed data present |
| `testimonials` | 5 | ✅ Seed data present |
| `product_faqs` | 5 | ✅ Seed data present |
| `email_send_state` | 1 | ✅ Config row |
| `cart_snapshots` | 1 | ✅ Test data |
| `psa_cart_abandons` | 1 | ✅ Test data |
| `psa_event_registrations` | 1 | ✅ Test data |
| `psa_pets_launch_box` | 1 | ✅ Test data |
| `psa_email_sends` | 8 | ✅ Test data |
| `psa_events` | 1 | ✅ Test data |
| `crm_kpis` | 1 | ✅ Config row |
| `crm_abandoned_carts` | 1 | ✅ Test data |

### Constraints & Indexes

| Type | Count | Status |
|------|-------|--------|
| Primary keys | 58 | ✅ |
| Unique indexes | 25 | ✅ |
| Foreign keys | 14 | ✅ |
| Partial indexes | 8 | ✅ |
| GIN indexes | 2 | ✅ |
| RLS policies | 79 | ✅ |
| Triggers | 29 | ✅ |

### Extensions

| Extension | Status |
|-----------|--------|
| `pg_cron` | ✅ |
| `pg_net` | ✅ |
| `supabase_vault` | ✅ |
| `pgmq` | ✅ |

---

## Code Audit: Zero Source References

Full-repo grep for `cveapedneuhgbxqydpjc`:

```bash
grep -rn 'cveapedneuhgbxqydpjc' . \
  --include='*.ts' --include='*.tsx' --include='*.js' \
  --include='*.html' --include='*.json' --include='*.toml' \
  --include='*.env*' --exclude-dir=node_modules --exclude-dir=.git
```

**Result:** Only `.env` on `main` branch contains the source ref. The migration branch has **zero occurrences**.

| File | `main` branch | Migration branch |
|------|--------------|------------------|
| `.env` | `cveapedneuhgbxqydpjc` | `eutszmrsukoqqeilzrbv` ✅ |
| `index.html` CSP | ❌ Missing target connect-src | ✅ Updated |
| `supabase/config.toml` | `eutszmrsukoqqeilzrbv` | `eutszmrsukoqqeilzrbv` ✅ |

---

## Edge Functions on TARGET

All 24 functions are **ACTIVE**:

**Original 9 (from repo):**
1. `admin-discount-eligibility` ✅
2. `community-join` ✅
3. `generate-protocol` ✅
4. `nocobase-abandoned-cart` ✅
5. `nocobase-sync` ✅
6. `payfast-create-payment` ✅
7. `payfast-itn` ✅
8. `process-email-queue` ✅
9. `retention-scheduler` ✅

**PSA-specific 15 (deployed externally):**
10. `psa-master-data-sync` ✅
11. `psa-order-sync` ✅
12. `psa-whatsapp-vip` ✅
13. `psa-gmail-autosend` ✅
14. `psa-payment-reconciliation` ✅
15. `psa-tracker-pipeline` ✅
16. `psa-competitor-monitor` ✅
17. `psa-abandoned-cart-bridge` ✅
18. `psa-abandoned-cart-bridge-v2` ✅
19. `psa-abandoned-cart-bridge-v3` ✅
20. `psa-event-registration` ✅
21. `psa-nurture-scheduler` ✅
22. `psa-payment-reconciliation-v2` ✅
23. `psa-content-agent` ✅
24. `psa-content-distributor` ✅
25. `psa-lead-scorer` ✅
26. `psa-webhook-router` ✅

**Note:** Secrets are NOT transferred automatically. Each function must have its secrets re-set on TARGET. See `FUNCTION_SECRETS_CHECKLIST.md`.

---

## Deliverables Produced

| # | Deliverable | Location | Status |
|---|-------------|----------|--------|
| 1 | Migration branch `migrate/supabase-project-eutszmrsukoqqeilzrbv` | GitHub | ✅ Ready for PR |
| 2 | `.env` updated to TARGET | Branch | ✅ Committed |
| 3 | `index.html` CSP updated | Branch | ✅ Committed |
| 4 | `.env.example` added | Branch | ✅ Committed |
| 5 | `MIGRATION_CHECKLIST.md` | Branch | ✅ Committed |
| 6 | `MIGRATION_PLAYBOOK.md` | Branch | ✅ Committed |
| 7 | `FUNCTION_SECRETS_CHECKLIST.md` | Branch | ✅ Committed |
| 8 | Row-count parity template | Playbook §4 | ✅ Provided |
| 9 | Schema audit report | This file | ✅ Complete |

---

## What You Must Do Next (Ordered)

### Phase 1: Data Migration (HIGHEST PRIORITY)
1. Get `SOURCE_DB_URL` from Lovable project settings
2. Follow `MIGRATION_PLAYBOOK.md` §2–4 to migrate:
   - `auth.users` + `auth.identities`
   - All `public.*` table data
   - Storage buckets and objects
3. Run row-count parity check and confirm 100% match

### Phase 2: Secrets & Functions
4. Set all Edge Function secrets per `FUNCTION_SECRETS_CHECKLIST.md`
5. Smoke-test PayFast, email queue, community join

### Phase 3: Vercel Cutover
6. Set `VITE_SUPABASE_*` env vars in Vercel (Production + Preview)
7. Update `.env` in branch to placeholders
8. Push branch, verify preview deploy
9. Test login, data reads, sandbox checkout on preview URL
10. Merge to `main`

### Phase 4: Post-Deploy
11. Verify live site references only `eutszmrsukoqqeilzrbv`
12. Disable Lovable auto-publish and GitHub sync
13. Keep SOURCE read-only for 1–2 weeks

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Auth users fail to migrate | Medium | Critical | Dump with `--disable-triggers`, preserve UUIDs, verify count |
| PayFast secrets wrong/missing | Medium | Critical | Test sandbox checkout before merging |
| Email provider secrets missing | Medium | High | Test email queue smoke endpoint |
| Storage objects not copied | Low | Medium | Check COA PDFs and testimonial photos post-deploy |
| Lovable pushes conflicting commits | Medium | High | Disconnect Lovable↔GitHub sync before merge |
| FK constraint errors on data load | Low | Medium | Migrate auth.users FIRST, then public data |
| Sequence gaps after data load | Low | Low | Run `setval` reset script in playbook |

---

## Rollback Target

Pre-migration Vercel deployment ID: **Record this before merging.**

If live site breaks after merge:
1. Vercel → `peptide-south-africa-com` → Deployments
2. Find the last deployment BEFORE the migration PR merge
3. Click "Promote to Production"
4. This instantly restores the SOURCE-backed build

---

*End of report. All files are in branch `migrate/supabase-project-eutszmrsukoqqeilzrbv`.*
