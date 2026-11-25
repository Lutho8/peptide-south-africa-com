import { readFileSync, appendFileSync } from 'node:fs';
const target = process.argv[2];
if (!target || !target.endsWith('_ci_declarative_production_baseline.sql')) throw new Error('Expected generated CI baseline path');
// pg-delta omits role revokes relative to managed default privileges. Restore
// the explicit partner ACL after creation so fresh databases match migrations.
const acl = ['partner_programme_v2.sql', 'partner_programme_operations.sql']
  .flatMap(file => readFileSync(`supabase/schemas/public/${file}`, 'utf8').match(/^(?:revoke|grant)\s[\s\S]*?;/gmi) || []);
if (acl.length < 20) throw new Error('Partner ACL source is incomplete');
const settlementAcl = readFileSync('supabase/schemas/public/functions/settle_eft_order_atomic.sql', 'utf8')
  .match(/^(?:revoke|grant)\s[\s\S]*?;/gmi) || [];
if (settlementAcl.length !== 2) throw new Error('Settlement ACL source is incomplete');
const explicitAcl = [...acl, ...settlementAcl];
appendFileSync(target, '\n-- Reapply explicit ACL after managed default privileges.\n' + explicitAcl.join('\n') + '\n');
console.log(`Restored ${explicitAcl.length} explicit ACL statements in the generated baseline.`);
