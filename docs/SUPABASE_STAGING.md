# Supabase staging environment

This repository uses a separate Supabase project for staging. The production
project `eutszmrsukoqqeilzrbv` must never be used by the staging workflow.

The design follows Supabase's multi-environment guidance: version-controlled
migrations are applied to an isolated project, Edge Functions are deployed from
the same commit, and only synthetic data is used.

## One-time human setup

1. In the Supabase Dashboard, create a project named `psa-staging` in the same
   organization and region as production. Use the smallest approved instance
   size. Store the generated database password in the team password manager;
   never paste it into Buzz, Git, an issue, or a pull request.
2. Record only the new non-secret project reference and URL in the release
   ticket. Confirm that neither equals the production reference above.
3. In GitHub, create an Environment named `staging` with:
   - Lutho as a required reviewer;
   - deployment limited to the protected `staging` branch; and
   - these Environment secrets:
     - `SUPABASE_ACCESS_TOKEN`
     - `STAGING_PROJECT_ID`
     - `STAGING_DB_PASSWORD`
     - `STAGING_SUPABASE_URL`
     - `STAGING_SUPABASE_PUBLISHABLE_KEY`
4. Create the protected `staging` branch from the approved `main` commit.
   Require the repository's test, lint, build, security, and Supabase staging
   checks before changes can advance.
5. Configure staging-only Edge Function secrets in the Supabase Dashboard:
   - set `PAYFAST_MODE=sandbox`;
   - use PayFast sandbox merchant credentials only;
   - generate unique staging values for `CRON_SECRET` and `RATE_SALT`;
   - keep WhatsApp, Nocobase, email, Make, fulfilment, and other outbound
     integrations unset until each has a documented sandbox or sink.
6. Configure staging Auth redirect URLs for the eventual website preview URL.
   Do not reuse production-only redirect URLs or OAuth credentials without an
   explicit provider review.

Supabase automatically supplies `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and
`SUPABASE_SERVICE_ROLE_KEY` to hosted Edge Functions. Do not add service-role
or secret keys to frontend variables (`VITE_*`).

## Deployment

The workflow `.github/workflows/supabase-staging.yml` is manual and targets the
GitHub `staging` Environment. A required reviewer must approve every run.

1. Select **Actions → Supabase staging deployment → Run workflow**.
2. Choose the protected `staging` branch and enter the expected full commit SHA.
3. Review and approve the GitHub Environment deployment.
4. The workflow verifies the selected SHA, links only to
   `STAGING_PROJECT_ID`, previews and applies migrations, deploys Edge
   Functions, checks migration state, and runs a read-only REST smoke request.
5. Record the workflow URL, commit, staging project reference, migration list,
   function list, and smoke result in the release packet.

Before the first deployment, compare the repository migration history with the
production project's migration history using authenticated read-only access.
Resolve any divergence before applying migrations to staging. Never copy
production customer, payment, health, authentication, or secret data. Add only
reviewed synthetic fixtures.

## Verification gates

After deployment:

- run Supabase database and security advisors;
- verify RLS on every exposed table and ownership predicates for authenticated
  access;
- verify `SECURITY DEFINER` functions have a fixed `search_path`, explicit
  caller checks, and revoked default `PUBLIC` execution where applicable;
- verify Auth, Storage, Realtime, and every Edge Function with synthetic users;
- verify PayFast initiation and ITN validation against the sandbox only;
- verify outbound messages terminate at approved sinks;
- run the storefront against the staging URL and branch-specific publishable
  key; and
- preserve logs and screenshots with the exact commit and workflow run.

## Rollback

Database migrations are forward-only. If a staging migration fails, stop the
workflow, preserve logs, and either add a corrective migration or recreate the
disposable staging project from the last approved commit. Do not repair
migration history or reverse schema changes manually without a reviewed plan.

Edge Function rollback is a redeploy of the last known-good commit to the same
staging project. Website rollback is a redeploy of its matching known-good
preview build. Production remains a separate, human-approved release and is
not performed by this workflow.

## Human hand-off checklist

- [ ] `psa-staging` project created and project reference shared (no secrets)
- [ ] GitHub `staging` Environment and required reviewer configured
- [ ] Five GitHub Environment secrets configured
- [ ] Protected `staging` branch created
- [ ] Sandbox/sink Edge Function secrets configured
- [ ] Synthetic data policy and fixtures approved
- [ ] Staging website preview URL supplied for Auth redirects and E2E tests
- [ ] Supabase OAuth/MCP read access authenticated for QA evidence

References:

- <https://supabase.com/docs/guides/deployment/managing-environments>
- <https://supabase.com/docs/guides/deployment>
- <https://supabase.com/docs/guides/functions/deploy>
- <https://supabase.com/docs/guides/ai-tools/mcp>
