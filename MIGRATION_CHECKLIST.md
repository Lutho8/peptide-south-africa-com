# Supabase Migration Checklist

> Branch: `migrate/supabase-project-eutszmrsukoqqeilzrbv`  
> Target: `eutszmrsukoqqeilzrbv` (Lutho8's Org)  
> Source: `cveapedneuhgbxqydpjc` (Lovable-managed)

## What has changed in this branch

| File | Change |
|------|--------|
| `.env` | `VITE_SUPABASE_*` now points to target project `eutszmrsukoqqeilzrbv` |
| `index.html` | CSP `connect-src` updated to target Supabase URL + WSS |
| `.env.example` | Added with placeholder values (never commit real keys) |
| `supabase/config.toml` | Already correct — `project_id = "eutszmrsukoqqeilzrbv"` |
| `run_migration.sh` | **NEW** — Self-contained bash migration runner |
| `parity_check.py` | **NEW** — Standalone Python parity checker |

## Self-Service Migration (Run Locally)

You can now run the migration entirely on your own machine without sharing secrets:

### Option A: Full Migration Runner (Recommended)

```bash
# 1. Clone the branch
git clone -b migrate/supabase-project-eutszmrsukoqqeilzrbv \
  https://github.com/Lutho8/peptide-south-africa-com.git
cd peptide-south-africa-com

# 2. Set secrets as environment variables
export SOURCE_DB_URL="postgres://postgres:PASSWORD@db.cveapedneuhgbxqydpjc.supabase.co:5432/postgres"
export TARGET_DB_URL="postgres://postgres:PASSWORD@db.eutszmrsukoqqeilzrbv.supabase.co:5432/postgres"
export SUPABASE_ACCESS_TOKEN="sbp_YOUR_TOKEN"
export TARGET_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
export TARGET_ANON_KEY="YOUR_ANON_KEY"

# Optional: function secrets
export PAYFAST_MERCHANT_ID="..."
export PAYFAST_MERCHANT_KEY="..."
export PAYFAST_PASSPHRASE="..."
export EMAIL_PROVIDER_API_KEY="..."
export EMAIL_FROM_ADDRESS="..."

# 3. Run the migration
chmod +x run_migration.sh
./run_migration.sh
```

The script will:
1. ✅ Check all prerequisites (pg_dump, psql, supabase CLI)
2. ✅ Dump schema from SOURCE → load into TARGET
3. ✅ Dump `auth.users` + `auth.identities` preserving UUIDs
4. ✅ Dump all `public.*` data → load into TARGET
5. ✅ Reset sequences
6. ✅ Run row-count parity check (stops on mismatch)
7. ✅ Deploy all 9 Edge Functions to TARGET
8. ✅ Set function secrets
9. ✅ Smoke-test critical endpoints
10. ✅ Generate `DONE_SIGNAL.md` for Kimi Code handoff

### Option B: Parity Checker Only

If you ran the migration manually and just need to verify:

```bash
# Requires Python + psycopg2
pip install psycopg2-binary

export SOURCE_DB_URL="..."
export TARGET_DB_URL="..."

python3 parity_check.py
```

Output: `parity_report.json` with per-table comparison.

## Pre-flight: zero source references

```bash
# Run this to confirm no hardcoded source refs remain:
grep -rn 'cveapedneuhgbxqydpjc' . \
  --include='*.ts' --include='*.tsx' --include='*.js' \
  --include='*.html' --include='*.json' --include='*.toml' \
  --include='*.env*' --exclude-dir=node_modules --exclude-dir=.git
```

Expected result: only `.env` on `main` (the old branch); this branch should return **zero matches**.

## Next steps (DO NOT skip ordering)

1. **Run migration** — Execute `run_migration.sh` locally
2. **Verify DONE signal** — Check `psa_migration_*/DONE_SIGNAL.md`
3. **Set Vercel env vars** — `VITE_SUPABASE_URL`, `VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_PUBLISHABLE_KEY`
4. **Preview deploy** — Push branch, verify on preview URL
5. **Merge to main** — Only after preview passes login + checkout

## Rollback

If anything breaks post-merge: In Vercel, instantly re-promote the pre-migration deployment.
