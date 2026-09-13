#!/usr/bin/env node
/**
 * Every `CREATE TABLE public.<name>` in a migration must be followed by at
 * least one `GRANT ... ON public.<name>` in the same file. Lovable Cloud
 * tables without explicit GRANTs fail at runtime with a permission error.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = "supabase/migrations";
// Only enforce on migrations created after this baseline. Earlier files had
// GRANTs added in follow-up migrations.
const BASELINE = "20260614000000";
// These files were recovered byte-for-byte from the production migration
// ledger. Their service-role grants were added in later migrations, so editing
// the historical source would make the repository diverge from production.
const LEGACY_GRANT_EXCEPTIONS = new Map([
  ["20260722101231_psa_pets_waitlist_and_launch_box.sql", new Set(["psa_pets_waitlist", "psa_pets_launch_box"])],
  ["20260821121854_eft_payments_v1.sql", new Set(["bank_deposits"])],
]);
let failed = 0;

for (const file of readdirSync(DIR)) {
  if (!file.endsWith(".sql")) continue;
  if (file < BASELINE) continue;

  const sql = readFileSync(join(DIR, file), "utf8");
  const created = [...sql.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?public\.(\w+)/gi)].map((m) => m[1]);
  for (const t of created) {
    if (LEGACY_GRANT_EXCEPTIONS.get(file)?.has(t)) continue;
    const grantRe = new RegExp(`GRANT\\s+[\\s\\S]+?ON\\s+(?:TABLE\\s+)?public\\.${t}\\b`, "i");
    if (!grantRe.test(sql)) {
      console.error(`✗ ${file}: CREATE TABLE public.${t} has no matching GRANT in the same migration`);
      failed++;
    }
  }
}

if (failed > 0) {
  console.error(`\n${failed} table(s) missing GRANTs. Add GRANT statements next to each CREATE TABLE.`);
  process.exit(1);
}
console.log("All public-schema CREATE TABLE statements have matching GRANTs.");
