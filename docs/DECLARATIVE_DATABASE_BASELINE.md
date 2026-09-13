# Declarative database baseline

`supabase/schemas/` is the source of truth for database structure. Historical
files in `supabase/migrations/` remain the immutable deployment ledger and must
not be edited to make a disposable database pass.

## Scope

The baseline was generated from linked production project
`eutszmrsukoqqeilzrbv` with Supabase CLI 2.117.0 and strict pg-delta coverage.
It contains schema definitions only, never table rows. The generated
`_cluster/misc.sql` is intentionally excluded because Supabase exports cron job
commands there and those commands can contain production endpoints or
credentials. Operational cron state remains outside the declarative baseline.

Declarative-schema caveats still apply: DML, view ownership, some RLS policy
alterations, schema privileges, comments, partitions, publications and default
privilege duplication require explicit review and may remain in versioned
migrations.

## Making a schema change

1. Edit the applicable file under `supabase/schemas/`.
2. Generate the migration with strict coverage:

   ```bash
   supabase db schema declarative sync --experimental --strict-coverage --no-apply --name <change_name>
   ```

3. Review the generated SQL, including grants, RLS, ownership, destructive
   statements and unsupported-object warnings.
4. Run `node scripts/ci/verify-declarative-baseline.mjs` and the EFT sandbox
   workflow. Schema and migration paths must change together after baseline
   adoption.

Never make schema changes directly in Studio or the SQL editor: declarative
diff does not read those edits and cannot preserve them.

## Refreshing from production

Use a staging directory so an export cannot overwrite reviewed source:

```bash
supabase db schema declarative generate --experimental --linked \
  --output-dir .scratch/production-schema-refresh --strict-coverage
```

Delete `_cluster/misc.sql` from the staged export without displaying its
contents, verify that its manifest entry is removed, run a secret scan, then
review the remaining diff file by file. Never copy a refresh wholesale.

## CI replay and rollback

The EFT workflow moves historical migrations aside only in the disposable
runner, generates one clean baseline migration from `supabase/schemas/`, starts
local Supabase from that migration and executes the authenticated pending-to-
paid contract. It never rewrites historical migration SQL.

Rollback is a source-only revert of the baseline/workflow commit. No production
database operation is part of baseline adoption.
