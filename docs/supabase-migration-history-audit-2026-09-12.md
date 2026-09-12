# Supabase migration-history audit — 2026-09-12

Project: `eutszmrsukoqqeilzrbv`

## Evidence and decision

- `supabase migration list --project-ref eutszmrsukoqqeilzrbv` identified 38 remote-only versions and 37 local-only versions.
- `supabase migration fetch --project-ref eutszmrsukoqqeilzrbv` recovered the SQL and names stored in the production migration ledger for every remote-only version. Those files are now tracked unchanged.
- Rebuild audit found `20260717162438_psa_crls_policies_triggers_indexes.sql` references `psa_leads` before the ledger creates it in `20260822112403_crm_backbone_expansion.sql`, and further recovered migrations have similar dependencies on dashboard-created state. CI therefore validates that all 38 recovered files exist, neutralizes unrelated recovered migrations only inside its disposable checkout, and provisions the verified legacy `psa_orders` boundary explicitly. `20260821121854_eft_payments_v1.sql` remains live in the replay because `bank_deposits` is part of the tested contract. Authoritative files are never edited in source control.
- The static GRANT scanner records narrow exceptions for the recovered Pets waitlist/launch-box and bank-deposit tables because their permissions were hardened in follow-up production migrations. New migrations remain fully enforced.
- The 34 local-only versions through `20260716075419` predate the production ledger's first recorded migration. Their objects are required by, and present beneath, later recorded production migrations. They are treated as the repository's adopted baseline.
- `20260827150000` created the verified EFT revenue trigger, `20260829095431` added fulfilment fields used by live checkout, and `20260912213000` fixed the trigger's UUID/varchar boundary. Their effects were verified in the successful synthetic production pending-to-paid test before history repair.

No schema SQL is re-run by this repair. Only `supabase_migrations.schema_migrations` metadata is aligned. The recovered remote SQL remains the authoritative record for the 38 previously missing versions.

## Repair command

After this commit passes the disposable Supabase CI contract, mark the following adopted/applied local versions as applied:

```text
20260430141122 20260430141144 20260430142955 20260430143400
20260430143448 20260430144041 20260518125340 20260518213750
20260518220501 20260518221803 20260524220259 20260524220318
20260526135503 20260612165614 20260612175112 20260612175139
20260612181551 20260612181605 20260612182856 20260612213831
20260612213850 20260613192634 20260613195816 20260613202538
20260614163320 20260614163332 20260614212138 20260615195718
20260615195736 20260615201802 20260615203316 20260615203330
20260701145056 20260716075419 20260827150000 20260829095431
20260912213000
```

Then require both:

1. migration list has identical local and remote version columns;
2. `supabase db push --dry-run --skip-vault` reports no pending migrations.

## Rollback

History repair is metadata-only. If audit verification fails, run `supabase migration repair --status reverted` for exactly the versions above. This does not roll back schema objects; it restores their prior unrecorded ledger state.
