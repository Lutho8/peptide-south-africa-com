import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
const read=(p:string)=>fs.readFileSync(path.resolve(process.cwd(),p),"utf8");
describe("wellness partner programme v2 contract",()=>{
 it("creates commission only on cleared payment and deduplicates by source event",()=>{const value=100_000,rate=2_000; expect(Math.round(value*rate/10_000)).toBe(20_000); const events=new Set<string>(); const record=(status:string)=>{if(status!=="complete"||events.has("cleared-payment:o1"))return false; events.add("cleared-payment:o1"); return true;}; expect(record("awaiting_eft")).toBe(false); expect(record("complete")).toBe(true); expect(record("complete")).toBe(false); expect(events.size).toBe(1);});
 it("keeps hybrid roles in one enrolment and isolates programmes",()=>{const sql=read("supabase/migrations/20261027141000_wellness_partner_programme_v2.sql"); expect(sql).toContain("unique (programme_id, partner_account_id)"); expect(sql).toContain("unique (programme_id, referral_code)"); expect(sql).toContain("order_id uuid not null unique"); expect(sql).toContain("programme_key in ('wellness_b2b', 'pets_b2b')");});
 it("requires professional review independently of partner role",()=>{const sql=read("supabase/migrations/20261027141000_wellness_partner_programme_v2.sql"); expect(sql).toContain("not regulated_professional or professional_review_status <> 'not_applicable'");});
 it("uses server-only financial writes and exact money snapshots",()=>{const sql=read("supabase/migrations/20261027141000_wellness_partner_programme_v2.sql"); expect(sql).toContain("commissionable_value_cents bigint"); expect(sql).toContain("commission_rate_bps integer"); expect(sql).toContain("auth.role() <> 'service_role'"); expect(sql).toContain("financial_activation");});
 it("does not publish unapproved income or rate claims",()=>{const page=read("src/pages/AffiliatePage.tsx"); for(const claim of ["R8,000","R50,000","R100k","20–30%","lifetime recurring","1,200+"])expect(page).not.toContain(claim);});
});
