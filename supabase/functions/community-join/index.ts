import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { parsePhoneNumberFromString } from "npm:libphonenumber-js@1.11.7/min";
import { z } from "npm:zod@3.23.8";

const INTEREST_VALUES = [
  "weight-loss",
  "peptide-stacks",
  "biohacking",
  "recovery",
  "longevity",
  "other",
] as const;

const BodySchema = z.object({
  name: z.string().trim().min(1).max(80),
  phone: z.string().trim().regex(/^\+[1-9]\d{6,18}$/),
  country: z.string().trim().length(2).optional(),
  interest: z.enum(INTEREST_VALUES),
  consent: z.literal(true),
});

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sendWelcomeTemplate(
  phoneE164: string,
): Promise<{ status: "sent" | "disabled" | "failed"; error?: string }> {
  const apiKey = Deno.env.get("WHATSAPP_BSP_API_KEY");
  const baseUrl = Deno.env.get("WHATSAPP_BSP_BASE_URL");
  const templateName = Deno.env.get("WHATSAPP_TEMPLATE_NAME") ?? "community_welcome";
  const groupUrl = Deno.env.get("WHATSAPP_GROUP_INVITE_URL") ?? "";

  if (!apiKey || !baseUrl) {
    return { status: "disabled" };
  }

  try {
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        to: phoneE164,
        template: templateName,
        components: [{ type: "body", parameters: [{ type: "text", text: groupUrl }] }],
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { status: "failed", error: `BSP ${res.status}: ${text.slice(0, 200)}` };
    }
    return { status: "sent" };
  } catch (e) {
    return { status: "failed", error: (e as Error).message };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ ok: false, error: "Invalid input", details: parsed.error.flatten().fieldErrors }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const phoneParsed = parsePhoneNumberFromString(parsed.data.phone);
  if (!phoneParsed?.isValid()) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid phone number" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const phoneE164 = phoneParsed.number;
  const phoneCountry = phoneParsed.country ?? parsed.data.country ?? null;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("cf-connecting-ip") ||
    "";
  const salt = Deno.env.get("RATE_SALT") ?? "rtd-community-salt-v1";
  const ipHash = ip ? await sha256Hex(`${salt}:${ip}`) : "";

  if (ipHash) {
    const { data: allowed, error: rateErr } = await supabase.rpc("bump_community_rate", {
      _ip_hash: ipHash,
      _limit: 5,
      _window_minutes: 60,
    });
    if (rateErr) console.error("rate-limit error", rateErr);
    if (allowed === false) {
      return new Response(
        JSON.stringify({ ok: false, error: "Too many attempts. Try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
  }

  const { data: upserted, error: upsertErr } = await supabase
    .from("community_members")
    .upsert(
      {
        name: parsed.data.name,
        phone_e164: phoneE164,
        phone_country: phoneCountry,
        interest: parsed.data.interest,
        consent_marketing: parsed.data.consent,
        ip_hash: ipHash || null,
        source: "community-page",
      },
      { onConflict: "phone_e164" },
    )
    .select("id")
    .single();

  if (upsertErr) {
    console.error("upsert error", upsertErr);
    return new Response(JSON.stringify({ ok: false, error: "Could not save signup" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const sendResult = await sendWelcomeTemplate(phoneE164);
  await supabase
    .from("community_members")
    .update({
      bsp_status: sendResult.status,
      bsp_last_error: sendResult.error ?? null,
    })
    .eq("id", upserted.id);

  await supabase.from("integration_logs").insert({
    source: "community-join",
    event: `bsp.${sendResult.status}`,
    payload: { member_id: upserted.id, phone_country: phoneCountry, error: sendResult.error ?? null },
  });

  const groupUrl = Deno.env.get("WHATSAPP_GROUP_INVITE_URL") ?? null;

  return new Response(JSON.stringify({ ok: true, groupUrl }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
