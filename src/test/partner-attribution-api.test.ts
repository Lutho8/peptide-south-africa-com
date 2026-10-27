import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolvePartnerAttribution } from "../../api/_shared/partnerAttribution";
import type { SupabaseClient } from "@supabase/supabase-js";
const lookup = (records: Record<string, unknown>) => ({ from: vi.fn((table: string) => {
  const result = { data: records[table] ?? null, error: null };
  const chain = { select: () => chain, eq: () => chain, single: async () => result, maybeSingle: async () => result };
  return chain;
}) }) as unknown as SupabaseClient;
describe("trusted checkout attribution", () => {
  const id = "12345678-1234-4234-8234-123456789012";
  const request = () => new Request("https://example.com/api/eft-create-order", { headers: { cookie: `__Host-psa_wellness_ref=${id}` } });
  beforeEach(() => vi.restoreAllMocks());
  it("gives an explicitly valid code precedence without reading a click", async () => {
    const admin = lookup({ partner_programmes: { id: "wellness" }, partner_enrolments: { id: "partner" } });
    expect(await resolvePartnerAttribution(admin, request(), "VALID")).toEqual({ code: "VALID", campaign: null, method: "entered_code" });
    expect(admin.from).not.toHaveBeenCalledWith("partner_referral_clicks");
  });
  it("rejects an invalid entered code rather than silently stealing or erasing attribution", async () => {
    const admin = lookup({ partner_programmes: { id: "wellness" } });
    await expect(resolvePartnerAttribution(admin, request(), "INVALID")).rejects.toThrow("PARTNER_CODE_INVALID");
  });
  it("rejects unknown, expired, and suspended-partner click records", async () => {
    expect(await resolvePartnerAttribution(lookup({}), request(), undefined)).toBeNull();
    expect(await resolvePartnerAttribution(lookup({ partner_referral_clicks: { created_at: "2020-01-01", expires_at: "2020-01-31" } }), request(), undefined)).toBeNull();
    const now = Date.now();
    const admin = lookup({ partner_programmes: { id: "wellness" }, partner_referral_clicks: { created_at: new Date(now - 1000).toISOString(), expires_at: new Date(now + 1000).toISOString(), referral_code: "SUSPENDED", campaign_key: null, method: "qr" } });
    expect(await resolvePartnerAttribution(admin, request(), undefined)).toBeNull();
  });
  it("uses only a current server click record, retaining its evidence ID", async () => {
    const now = Date.now();
    const admin = lookup({ partner_programmes: { id: "wellness" }, partner_enrolments: { id: "partner" }, partner_campaigns: { id: "campaign" }, partner_referral_clicks: { created_at: new Date(now - 1000).toISOString(), expires_at: new Date(now + 1000).toISOString(), referral_code: "VALID", campaign_key: "instagram", method: "qr" } });
    expect(await resolvePartnerAttribution(admin, request(), undefined)).toEqual({ code: "VALID", campaign: "instagram", method: "qr", click_id: id });
  });
  it("has no cross-device attribution without a cookie or explicit code", async () => {
    const admin = lookup({});
    expect(await resolvePartnerAttribution(admin, new Request("https://example.com"), undefined)).toBeNull();
    expect(admin.from).not.toHaveBeenCalled();
  });
});
