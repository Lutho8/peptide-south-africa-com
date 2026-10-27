import { describe, expect, it } from "vitest";
import { clickIsCurrent, readReferralCookie, referralCookie, REFERRAL_SECONDS } from "../../api/_shared/partnerAttribution";
import { capturePartnerAttribution } from "../lib/partnerAttribution";
describe("server referral boundaries", () => {
  const start = Date.UTC(2026, 9, 1), end = start + REFERRAL_SECONDS * 1000;
  it("expires exactly at 30 days, including existing longer-lived records", () => {
    expect(clickIsCurrent(new Date(start).toISOString(), new Date(end).toISOString(), end - 1)).toBe(true);
    expect(clickIsCurrent(new Date(start).toISOString(), new Date(end).toISOString(), end)).toBe(false);
    expect(clickIsCurrent(new Date(start).toISOString(), new Date(end + 1).toISOString(), start)).toBe(false);
    expect(clickIsCurrent(new Date(start).toISOString(), new Date(end).toISOString(), start - 1)).toBe(false);
    expect(clickIsCurrent("invalid", "invalid", start)).toBe(false);
  });
  it("sets only a secure host-only HttpOnly cookie", () => {
    const cookie = referralCookie("test");
    expect(cookie).toContain("Max-Age=2592000");
    expect(cookie).toContain("Secure; HttpOnly; SameSite=Lax");
    expect(cookie).not.toContain("Domain=");
    expect(referralCookie("", 0)).toContain("Max-Age=0");
  });
  it("does not interpret manipulated cookie text as a referral", () => {
    expect(readReferralCookie(new Request("https://example.com", { headers: { cookie: "__Host-psa_wellness_ref=PARTNER_CODE" } }))).toBeNull();
    expect(readReferralCookie(new Request("https://example.com"))).toBeNull();
  });
  it("does not manufacture attribution on a direct return or invalid campaign", () => {
    expect(capturePartnerAttribution("")).toBeNull();
    expect(capturePartnerAttribution("?partner=ABC&campaign=https://evil.example")).toBeNull();
    expect(capturePartnerAttribution("?partner=abc&campaign=instagram&via=qr")).toEqual({ code: "ABC", campaign: "instagram", method: "qr" });
  });
});
