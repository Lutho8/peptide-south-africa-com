import { createClient } from "@supabase/supabase-js";
import { isRateLimited } from "./_shared/rateLimit.js";
export const config = { runtime: "edge" };
export default async function handler(request: Request) {
  const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
  if (request.method !== "POST") return reply({ error: "Method not allowed" }, 405);
  if (request.headers.get("origin") !== new URL(request.url).origin) return reply({ error: "Invalid origin" }, 403);
  if (isRateLimited(`partner-application:${request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown"}`, 5, 3600000)) return reply({ error: "Too many applications. Please try again later." }, 429);
  try {
    const text = await request.text();
    if (text.length > 16000) return reply({ error: "Application is too long" }, 413);
    const payload = JSON.parse(text);
    if (payload.application_terms !== "on" || payload.website || !Array.isArray(payload.partner_types) || !payload.partner_types.length || payload.partner_types.some((t: unknown) => !["facility", "creator"].includes(String(t)))) return reply({ error: "Please select your partner type and accept the terms." }, 400);
    const required = ["contact_name", "email", "location", "promotion_approach", ...(payload.partner_types.includes("facility") ? ["facility_name", "facility_type"] : []), ...(payload.partner_types.includes("creator") ? ["creator_name", "content_niche"] : [])];
    if (required.some(key => typeof payload[key] !== "string" || !payload[key].trim())) return reply({ error: "Please complete the required application fields." }, 400);
    if (payload.partner_types.includes("creator") && (!Array.isArray(payload.profile_links) || !payload.profile_links.length)) return reply({ error: "Please include a public creator profile link." }, 400);
    const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await admin.rpc("submit_partner_application_v2", { payload });
    if (error) return reply({ error: error.message.includes("active application already exists") ? "An application already exists for this email. Contact the programme team to check its status." : "Application could not be submitted. Check your details or try again shortly." }, 400);
    return reply({ ok: true });
  } catch { return reply({ error: "Application service is temporarily unavailable. Please try again." }, 503); }
}
