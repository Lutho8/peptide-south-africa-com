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

## Pre-flight: zero source references

```bash
# Run this to confirm no hardcoded source refs remain:
grep -rn 'cveapedneuhgbxqydpjc' . --include='*.ts' --include='*.tsx' --include='*.js' --include='*.html' --include='*.json' --include='*.toml' --include='*.env*' --exclude-dir=node_modules --exclude-dir=.git
```

Expected result: only `.env` on `main` (the old branch); this branch should return **zero matches**.

## Next steps (DO NOT skip ordering)

1. **Data migration** — Run the data migration playbook (see `MIGRATION_PLAYBOOK.md`)
2. **Function secrets** — Set all Edge Function secrets on target
3. **Vercel env vars** — Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel
4. **Preview deploy** — Push this branch, verify on preview URL
5. **Merge to main** — Only after preview passes login + checkout

## Rollback

If anything breaks post-merge, revert the Vercel deployment to the last pre-migration deployment.
