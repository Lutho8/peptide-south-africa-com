import type { SupabaseClient } from "@supabase/supabase-js";
export const REFERRAL_COOKIE = "__Host-psa_wellness_ref";
export const REFERRAL_SECONDS = 30 * 24 * 60 * 60;
export function referralCookie(value: string, seconds = REFERRAL_SECONDS) {
  return `${REFERRAL_COOKIE}=${value}; Path=/; Max-Age=${seconds}; Secure; HttpOnly; SameSite=Lax`;
}
export function readReferralCookie(request: Request): string | null {
  const value = request.headers.get("cookie")?.split(";").map(v => v.trim()).find(v => v.startsWith(`${REFERRAL_COOKIE}=`))?.slice(REFERRAL_COOKIE.length + 1);
  return value && /^[0-9a-f-]{36}$/i.test(value) ? value : null;
}
export async function validPartner(admin: SupabaseClient, code: string, campaign: string | null) {
  if (!/^[A-Z0-9_-]{3,80}$/.test(code) || (campaign && !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(campaign))) return null;
  const { data: programme, error: programmeError } = await admin.from("partner_programmes").select("id").eq("programme_key", "wellness_b2b").eq("storefront", "main").single();
  if (programmeError) throw new Error("Partner lookup unavailable");
  const { data: enrolment, error } = await admin.from("partner_enrolments").select("id").eq("programme_id", programme.id).eq("referral_code", code).eq("status", "approved").maybeSingle();
  if (error) throw new Error("Partner lookup unavailable");
  if (!enrolment) return null;
  if (campaign) {
    const { data, error: campaignError } = await admin.from("partner_campaigns").select("id").eq("enrolment_id", enrolment.id).eq("campaign_key", campaign).eq("active", true).maybeSingle();
    if (campaignError) throw new Error("Campaign lookup unavailable");
    if (!data) return null;
  }
  return { programme_id: programme.id, enrolment_id: enrolment.id };
}
export function clickIsCurrent(created: string, expires: string, now = Date.now()) {
  const start = Date.parse(created), end = Date.parse(expires);
  return Number.isFinite(start) && Number.isFinite(end) && start <= now && now < end && now - start < REFERRAL_SECONDS * 1000 && end - start <= REFERRAL_SECONDS * 1000;
}
export async function resolvePartnerAttribution(admin: SupabaseClient, request: Request, entered: unknown) {
  if (typeof entered === "string" && entered.trim()) {
    const code = entered.trim().toUpperCase();
    if (!await validPartner(admin, code, null)) throw new Error("PARTNER_CODE_INVALID");
    return { code, campaign: null, method: "entered_code" };
  }
  const id = readReferralCookie(request);
  if (!id) return null;
  const { data, error } = await admin.from("partner_referral_clicks").select("referral_code,campaign_key,method,created_at,expires_at").eq("id", id).maybeSingle();
  if (error) throw new Error("Partner lookup unavailable");
  if (!data || !clickIsCurrent(data.created_at, data.expires_at)) return null;
  if (!await validPartner(admin, data.referral_code, data.campaign_key)) return null;
  return { code: data.referral_code, campaign: data.campaign_key, method: data.method, click_id: id };
}
