# PSA Supabase Migration Playbook
> SOURCE: `cveapedneuhgbxqydpjc` (Lovable-managed)  
> TARGET: `eutszmrsukoqqeilzrbv` (Lutho8's Org, London region)  
> Live site: https://www.peptide-south-africa.com  
> Repo: `Lutho8/peptide-south-africa-com`  
> Migration branch: `migrate/supabase-project-eutszmrsukoqqeilzrbv`

---

## 0. Prerequisites

| Secret | Where to get it | Variable name |
|--------|----------------|---------------|
| SOURCE DB URL | Supabase → SOURCE Project → Settings → Database → Connection string (postgres://) | `<SOURCE_DB_URL>` |
| TARGET DB URL | Supabase → TARGET Project → Settings → Database → Connection string (postgres://) | `<TARGET_DB_URL>` |
| TARGET anon key | Supabase → TARGET Project → Settings → API → `anon` / `public` key | `<TARGET_ANON_KEY>` |
| TARGET service_role key | Supabase → TARGET Project → Settings → API → `service_role` key | `<TARGET_SERVICE_ROLE_KEY>` |
| Supabase CLI token | Supabase Dashboard → Account → Access Tokens | `<SUPABASE_ACCESS_TOKEN>` |

**Tools required:** `psql`, `pg_dump` (PostgreSQL 15+), `supabase` CLI, `curl`.

**Safety rules:**
1. Never run these commands against the wrong project. Triple-check the connection string host.
2. Do NOT delete SOURCE data at any point. Keep it read-only as fallback.
3. Run Phase 2+ only after TARGET schema is verified complete.

---

## 1. Schema Verification (COMPLETED — for reference)

TARGET schema was audited against all 34 repo migrations:

| Check | Result |
|-------|--------|
| Tables | 58 public tables present ✓ |
| Columns | All columns from all migrations present ✓ |
| RLS Policies | 79 policies across public schema ✓ |
| Indexes | 140+ indexes including partial/unique ✓ |
| Triggers | 29 triggers ✓ |
| Foreign Keys | 14 FK constraints ✓ |
| Extensions | pg_cron, pg_net, supabase_vault, pgmq ✓ |
| Storage policies | testimonial-photos, coa-pdfs ✓ |

**Gap found:** `auth.users` = 0 rows. All other tables have seed/placeholder data only.

---

## 2. Auth Users Migration (CRITICAL — do this FIRST)

Auth users must preserve UUIDs so that all `public.*` tables referencing `auth.users(id)` stay valid.

### 2.1 Dump auth schema from SOURCE

```bash
# Dump auth.users, auth.identities, and auth.audit_log_entries (if you want full audit trail)
# NOTE: auth schema is owned by supabase_admin; --no-owner prevents permission errors on restore
pg_dump "<SOURCE_DB_URL>" \
  --schema-only --schema auth --no-owner --no-privileges \
  > auth_schema.sql

# Dump auth data
pg_dump "<SOURCE_DB_URL>" \
  --data-only --schema auth --no-owner --disable-triggers \
  > auth_data.sql
```

### 2.2 Verify the dump includes identities

```bash
grep -c "INSERT INTO auth.users" auth_data.sql
grep -c "INSERT INTO auth.identities" auth_data.sql
```

If `auth.identities` is missing, Supabase auth uses it for OAuth linking. Run:

```bash
pg_dump "<SOURCE_DB_URL>" \
  --data-only --table 'auth.identities' --no-owner --disable-triggers \
  >> auth_data.sql
```

### 2.3 Load into TARGET

```bash
# IMPORTANT: Disable triggers on auth tables during load to avoid
# side-effects from Supabase's internal auth hooks
psql "<TARGET_DB_URL>" -c "SET session_replication_role = replica;"

# Load schema first (if any auth schema objects are missing)
psql "<TARGET_DB_URL>" -f auth_schema.sql

# Load data
psql "<TARGET_DB_URL>" -f auth_data.sql

# Re-enable normal operation
psql "<TARGET_DB_URL>" -c "SET session_replication_role = DEFAULT;"
```

### 2.4 Verify auth parity

```sql
-- Run on TARGET via psql or Supabase SQL Editor
SELECT COUNT(*) AS auth_users_count FROM auth.users;
SELECT COUNT(*) AS auth_identities_count FROM auth.identities;
```

Compare these counts against SOURCE. They must match exactly.

---

## 3. Public Data Migration

### 3.1 Row-count snapshot from SOURCE

Run this on SOURCE and save the output as `source_row_counts.json`:

```sql
SELECT 
  schemaname || '.' || tablename AS full_table,
  (xpath('/row/c/text()', query_to_xml('SELECT COUNT(*) AS c FROM "' || tablename || '"', true, true, '')))[1]::text::bigint AS row_count
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### 3.2 Dump public data from SOURCE

```bash
# Dump all public schema data only
# --disable-triggers prevents FK constraint errors during load order
# --no-owner --no-privileges keeps it clean for the target
pg_dump "<SOURCE_DB_URL>" \
  --data-only --schema public --no-owner --no-privileges --disable-triggers \
  > public_data.sql
```

### 3.3 Load into TARGET

```bash
psql "<TARGET_DB_URL>" -f public_data.sql
```

If you get FK constraint errors, the likely cause is `auth.users` not yet migrated. Go back to Step 2.

### 3.4 Reset sequences

Data-only dumps don't reset sequences. Fix this:

```sql
-- Run on TARGET
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT sequencename 
    FROM pg_sequences 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format(
      'SELECT setval(''public.%I'', COALESCE((SELECT MAX(id) FROM %I), 1), true)',
      r.sequencename,
      regexp_replace(r.sequencename, '_id_seq$', '')
    );
  END LOOP;
END $$;
```

For serial/integer primary keys that don't follow the `_id_seq` pattern, manually set:

```sql
-- Examples (verify actual max values first)
SELECT setval('psa_analytics_daily_id_seq', (SELECT MAX(id) FROM psa_analytics_daily));
SELECT setval('psa_customers_id_seq', (SELECT MAX(id) FROM psa_customers));
SELECT setval('psa_orders_id_seq', (SELECT MAX(id) FROM psa_orders));
-- ... etc for all psa_* tables with integer PKs
```

---

## 4. Row-Count Parity Check

Run on TARGET and compare against SOURCE snapshot:

```sql
SELECT 
  tablename,
  (xpath('/row/c/text()', query_to_xml('SELECT COUNT(*) AS c FROM "' || tablename || '"', true, true, '')))[1]::text::bigint AS row_count
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**STOP** if any table count differs. Investigate before proceeding.

### Parity Log Template

| Table | SOURCE Count | TARGET Count | Match |
|-------|-------------|-------------|-------|
| auth.users | ___ | ___ | ☐ |
| orders | ___ | ___ | ☐ |
| psa_orders | ___ | ___ | ☐ |
| psa_customers | ___ | ___ | ☐ |
| customer_profiles | ___ | ___ | ☐ |
| psa_products | ___ | ___ | ☐ |
| psa_leads | ___ | ___ | ☐ |
| psa_analytics_daily | ___ | ___ | ☐ |
| email_send_log | ___ | ___ | ☐ |
| subscriptions | ___ | ___ | ☐ |
| ... | ... | ... | ... |

---

## 5. Storage Migration

### 5.1 List SOURCE buckets

```bash
# Using Supabase CLI (must be logged in to SOURCE)
supabase login
curl -s "https://cveapedneuhgbxqydpjc.supabase.co/storage/v1/bucket" \
  -H "apikey: <SOURCE_ANON_KEY>" \
  -H "Authorization: Bearer <SOURCE_SERVICE_ROLE_KEY>"
```

### 5.2 Recreate buckets in TARGET

```bash
# For each bucket found in SOURCE:
curl -s -X POST "https://eutszmrsukoqqeilzrbv.supabase.co/storage/v1/bucket" \
  -H "apikey: <TARGET_ANON_KEY>" \
  -H "Authorization: Bearer <TARGET_SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"id":"BUCKET_NAME","name":"BUCKET_NAME","public":true}'
```

Known buckets:
- `testimonial-photos` (public)
- `coa-pdfs` (public read for published batches)

### 5.3 Copy objects

For small object counts, use the Storage API. For large counts, use `rclone` or a script:

```bash
# List objects in SOURCE bucket
curl -s "https://cveapedneuhgbxqydpjc.supabase.co/storage/v1/object/list/BUCKET_NAME" \
  -H "apikey: <SOURCE_ANON_KEY>" \
  -H "Authorization: Bearer <SOURCE_SERVICE_ROLE_KEY>"

# Download and re-upload each object
# (or use a script to bulk-copy)
```

---

## 6. Edge Function Secrets

After data is loaded, deploy functions and set secrets on TARGET.

### 6.1 Deploy all functions

```bash
supabase login --token <SUPABASE_ACCESS_TOKEN>
supabase link --project-ref eutszmrsukoqqeilzrbv

# The repo already has all 9 functions in supabase/functions/
for fn in admin-discount-eligibility community-join generate-protocol \
  nocobase-abandoned-cart nocobase-sync payfast-create-payment \
  payfast-itn process-email-queue retention-scheduler; do
  supabase functions deploy "$fn" --project-ref eutszmrsukoqqeilzrbv
done
```

### 6.2 Set secrets per function

```bash
# PayFast secrets (CRITICAL — checkout breaks without these)
supabase secrets set --project-ref eutszmrsukoqqeilzrbv \
  PAYFAST_MERCHANT_ID="..." \
  PAYFAST_MERCHANT_KEY="..." \
  PAYFAST_PASSPHRASE="..."

# Email provider (CRITICAL — transactional emails break without this)
supabase secrets set --project-ref eutszmrsukoqqeilzrbv \
  EMAIL_PROVIDER_API_KEY="..." \
  EMAIL_FROM_ADDRESS="..."

# NocoBase sync
supabase secrets set --project-ref eutszmrsukoqqeilzrbv \
  NOCOBASE_API_KEY="..." \
  NOCOBASE_BASE_URL="..."

# Add any other secrets your functions require
# Verify with: supabase secrets list --project-ref eutszmrsukoqqeilzrbv
```

### 6.3 Smoke-test critical functions

```bash
# Community join (no JWT)
curl -s -X POST "https://eutszmrsukoqqeilzrbv.supabase.co/functions/v1/community-join" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone_e164":"+27831234567","interest":"fat-loss","consent_marketing":true}'

# PayFast create payment (requires JWT)
curl -s -X POST "https://eutszmrsukoqqeilzrbv.supabase.co/functions/v1/payfast-create-payment" \
  -H "Authorization: Bearer <TARGET_ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"order_id":"00000000-0000-0000-0000-000000000000","amount":100}'
```

---

## 7. Vercel Configuration

### 7.1 Set environment variables in Vercel (PREFERRED)

Go to Vercel → `peptide-south-africa-com` → Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://eutszmrsukoqqeilzrbv.supabase.co` | Production + Preview |
| `VITE_SUPABASE_PROJECT_ID` | `eutszmrsukoqqeilzrbv` | Production + Preview |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `<TARGET_ANON_KEY>` | Production + Preview |

### 7.2 Verify .env in repo is safe

After Vercel env vars are set, update `.env` in the branch to use placeholders:

```
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
```

This makes the repo Lovable-independent.

---

## 8. Deploy & Verify

### 8.1 Preview deploy

1. Push `migrate/supabase-project-eutszmrsukoqqeilzrbv` to GitHub
2. Vercel should auto-deploy a preview
3. Test on preview URL:
   - [ ] Homepage loads
   - [ ] Login works (create a test account)
   - [ ] Product data loads
   - [ ] Add to cart works
   - [ ] PayFast sandbox checkout completes
   - [ ] Admin dashboard loads (if applicable)

### 8.2 Verify bundle references target

```bash
# Download the main JS bundle from the preview URL
curl -s "https://<preview-url>/assets/index-*.js" | grep -o 'eutszmrsukoqqeilzrbv\|cveapedneuhgbxqydpjc'
```

Expected: only `eutszmrsukoqqeilzrbv` appears. Zero matches for `cveapedneuhgbxqydpjc`.

### 8.3 Merge to main

Only after ALL checks pass:

```bash
git checkout main
git merge migrate/supabase-project-eutszmrsukoqqeilzrbv
git push origin main
```

---

## 9. Post-Deploy Live Verification

On https://www.peptide-south-africa.com:

- [ ] Live login works
- [ ] Existing user data loads (if auth was migrated)
- [ ] New user registration works
- [ ] Cart + PayFast sandbox checkout succeeds
- [ ] Email confirmations arrive (if using email provider)
- [ ] No 500s or auth errors in browser console

---

## 10. Cut Lovable Dependency

1. Go to Lovable project `444b5a36-70e0-4613-a86e-bcb50367db3d`
2. Disable auto-publish
3. Disconnect GitHub sync (if pushing unwanted commits)
4. Keep SOURCE project `cveapedneuhgbxqydpjc` read-only for 1–2 weeks

---

## Rollback Plan

If live site breaks:

1. **Immediate**: In Vercel, redeploy the last pre-migration deployment
2. **Investigate**: Check if the issue is data (re-run parity check) or config (check env vars)
3. **Retry**: Fix the issue on the migration branch, test preview, merge again

**Never delete SOURCE data.** It is your safety net.
