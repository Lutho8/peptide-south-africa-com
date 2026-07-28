# Supabase Migration Checklist

> Branch: `chore/repoint-supabase`  
> Target: `eutszmrsukoqqeilzrbv` (self-owned project)  
> Source: `OLD_LOVABLE_PROJECT_REF` (Lovable-managed)  

## Scope

This branch repoints the **application configuration** to the self-owned Supabase project and removes the committed dependency on the Lovable-managed project. It does **not** migrate data, schema, auth users, storage, or edge functions — those are assumed to already be populated and verified in the target project before production is flipped.

## What has changed in this branch

| File | Change |
|------|--------|
| `.env` | `VITE_SUPABASE_*` now points to target project `eutszmrsukoqqeilzrbv`; publishable key is a placeholder (real value lives in Vercel only) |
| `.env.example` | Added with placeholder values and a note that production secrets live in Vercel |
| `index.html` | CSP `connect-src` already points to target Supabase URL + WSS on `main` |
| `public/_headers` | CSP `connect-src` already points to target Supabase URL + WSS on `main` |
| `supabase/config.toml` | Already correct — `project_id = "eutszmrsukoqqeilzrbv"` |
| `supabase/migrations/20260430143448_5d3ca12e-ea61-41fb-9838-1064a30b3114.sql` | Already points to target URL on `main` |

## Pre-flight: zero source references

```bash
# Run this to confirm no hardcoded source refs remain:
grep -rn 'OLD_LOVABLE_PROJECT_REF' . --include='*.ts' --include='*.tsx' --include='*.js' --include='*.html' --include='*.json' --include='*.toml' --include='*.env*' --exclude-dir=node_modules --exclude-dir=.git
```

Expected result: **zero matches**.

## Vercel environment variables

Set these in the `peptide-south-africa-com` Vercel project for **Production** and **Preview**:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://eutszmrsukoqqeilzrbv.supabase.co` |
| `VITE_SUPABASE_PROJECT_ID` | `eutszmrsukoqqeilzrbv` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | *(real target anon key — set via Vercel dashboard/CLI; never commit)* |

## Rollout order

- [x] **Open PR** from `chore/repoint-supabase` to `main` → PR #9.
- [x] **Set Vercel env vars** for Production and Preview.
- [ ] **Preview deploy** — Vercel builds the branch with the new env vars.
- [ ] **Verify Preview** — app loads, auth works, product/data reads work, PayFast sandbox checkout succeeds.
- [ ] **Confirm bundle** — no `OLD_LOVABLE_PROJECT_REF` references in the built JS.
- [ ] **Merge to main** — only after the verification steps pass and the target DB is fully populated.
- [ ] **Post-deploy live check** — verify production references target and login/checkout work.
- [ ] **Decouple Lovable** — only after production is stable (see Phase D instructions).

> The Vercel Preview deployment is protected by SSO. Verification must be performed in a browser authenticated with the `lutho8s-projects` Vercel team.

## Rollback

If anything breaks post-merge, re-promote the last pre-migration Vercel production deployment. The old Supabase project and its data are left untouched.
