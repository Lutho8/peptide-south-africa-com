import { createClient } from "@supabase/supabase-js";
import { readReferralCookie, referralCookie, REFERRAL_SECONDS, validPartner } from "./_shared/partnerAttribution.js";
import { isRateLimited } from "./_shared/rateLimit.js";
export const config = { runtime: "edge" };
export default async function handler(request: Request) {
  const reply = (body: unknown, status = 200, cookie?: string) => Response.json(body, { status, headers: { "Cache-Control": "private, no-store", ...(cookie ? { "Set-Cookie": cookie } : {}) } });
  if (request.method !== "POST" && request.method !== "DELETE") return reply({ error: "Method not allowed" }, 405);
  if (request.headers.get("origin") !== new URL(request.url).origin) return reply({ error: "Invalid origin" }, 403);
  if (isRateLimited(`referral:${request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown"}`, 30, 60000)) return reply({ error: "Please try again shortly" }, 429);
  try {
    const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
    if (request.method === "DELETE") {
      const id = readReferralCookie(request);
      if (id) {
        const { error } = await admin.from("partner_referral_clicks").delete().eq("id", id);
        if (error) return reply({ error: "Could not withdraw tracking; please retry" }, 503, referralCookie("", 0));
      }
      return reply({ ok: true }, 200, referralCookie("", 0));
    }
    const body = await request.json();
    if (body.consent !== true) return reply({ error: "Tracking consent required" }, 400);
    const code = typeof body.code === "string" ? body.code.toUpperCase() : "";
    const campaign = typeof body.campaign === "string" ? body.campaign : null;
    const partner = await validPartner(admin, code, campaign);
    if (!partner) return reply({ error: "This referral is not active" }, 400);
    const id = crypto.randomUUID(), created = Date.now();
    const { error } = await admin.from("partner_referral_clicks").insert({ id, ...partner, referral_code: code, campaign_key: campaign, method: body.method === "qr" ? "qr" : "referral_click", created_at: new Date(created).toISOString(), expires_at: new Date(created + REFERRAL_SECONDS * 1000).toISOString() });
    if (error) return reply({ error: "Referral could not be saved" }, 503);
    return reply({ ok: true }, 200, referralCookie(id));
  } catch { return reply({ error: "Referral service unavailable" }, 503); }
}
