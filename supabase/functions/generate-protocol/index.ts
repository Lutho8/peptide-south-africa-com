import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ALLOWED = {
  goal: ["fat-loss", "recovery", "both"],
  issues: ["stubborn-fat", "slow-recovery", "low-energy", "plateau"],
  lifestyle: ["active", "moderate", "sedentary"],
  experience: ["never", "some", "experienced"],
  readiness: ["ready-now", "exploring", "planning"],
  budget: ["starter", "standard", "premium"],
} as const;

function pickAllowed(input: unknown, key: keyof typeof ALLOWED): string | undefined {
  if (typeof input !== "string") return undefined;
  return (ALLOWED[key] as readonly string[]).includes(input) ? input : undefined;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const rawAnswers = (body as { answers?: unknown }).answers;
    if (!rawAnswers || typeof rawAnswers !== "object") {
      return new Response(JSON.stringify({ error: "Invalid answers" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const a = rawAnswers as Record<string, unknown>;
    const answers = {
      goal: pickAllowed(a.goal, "goal"),
      issues: pickAllowed(a.issues, "issues"),
      lifestyle: pickAllowed(a.lifestyle, "lifestyle"),
      experience: pickAllowed(a.experience, "experience"),
      readiness: pickAllowed(a.readiness, "readiness"),
      budget: pickAllowed(a.budget, "budget"),
    };
    const rawLeadName = (body as { leadName?: unknown }).leadName;
    // Sanitize leadName to prevent prompt injection: strip control chars, cap length.
    const leadName = typeof rawLeadName === "string"
      ? rawLeadName.replace(/[\u0000-\u001F\u007F]/g, "").replace(/[^\p{L}\p{N}\s'-]/gu, "").slice(0, 80)
      : "";
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");


    const systemPrompt = `You are a clinical peptide protocol specialist at PepKits, a premium South African peptide research and wellness brand. You create personalized peptide protocols based on client assessments.

PEPTIDE KNOWLEDGE BASE:
- Retatrutide (RT3): Triple-agonist (GLP-1/GIP/Glucagon). Best for fat loss & metabolic health. Dosing: 0.5mg-4mg/week titrated. 12-week cycles.
- Tirzepatide (TZ-2): Dual GIP/GLP-1 agonist. Fat loss + appetite regulation. Dosing: 2.5mg-15mg/week. 12-week cycles.
- BPC-157: Healing peptide. Gut repair, tendon/ligament recovery. 250-500mcg/day. 4-8 week cycles.
- TB-500 (Thymosin Beta-4): Tissue repair, inflammation reduction, flexibility. 2-5mg 2x/week. 6-8 week cycles.
- MOTS-C: Mitochondrial peptide. Metabolic optimization, exercise performance. 5-10mg/week. 8-12 week cycles.
- Thymosin Alpha-1: Immune modulation. 1.6mg 2x/week. 8-12 week cycles.
- GHK-Cu: Skin regeneration, anti-aging, wound healing. 1-2mg/day. 4-6 week cycles.
- CJC-1295/Ipamorelin: GH secretagogue stack. Recovery, body composition, sleep. 100-300mcg each, before bed. 8-12 weeks.
- Epitalon: Telomere support, anti-aging. 5-10mg/day for 10-20 days. Twice yearly.
- GLOW Blend (GHK-Cu + TB-500 + BPC-157): Comprehensive healing & regeneration. 2,330mcg/day. 4 weeks.

PRICING (ZAR):
- Starter protocols: R1,200-R1,800/month
- Standard protocols: R1,800-R2,500/month  
- Premium protocols: R2,500-R4,000/month
- Full transformation (12 weeks): R4,999-R7,999

You must respond with valid JSON matching this exact structure:
{
  "protocolName": "string - catchy protocol name",
  "subtitle": "string - one-line description",
  "duration": "string - e.g. '12 Weeks'",
  "whyFits": "string - 2-3 sentences explaining why this protocol fits based on their answers",
  "timeline": "string - when to expect results",
  "monthlyPrice": "string - e.g. 'R1,999'",
  "fullPrice": "string - e.g. 'R4,999'",
  "savings": "string - e.g. 'Save R997'",
  "peptides": [{"name": "string", "dose": "string", "frequency": "string", "purpose": "string"}],
  "expectedResults": [{"icon": "string - one of: flame, heart, sparkles, dumbbell, shield, zap", "label": "string"}],
  "included": ["string - list of what's included"],
  "weeklySchedule": "string - brief weekly routine overview",
  "warnings": ["string - important safety notes"]
}

Be specific, clinical but accessible. Tailor everything to their quiz answers. Use South African Rand pricing.`;

    const userPrompt = `Create a personalized peptide protocol for ${leadName || "this client"} based on their assessment:
- Primary Goal: ${answers.goal || "not specified"}
- Current Struggles: ${answers.issues || "not specified"}  
- Lifestyle: ${answers.lifestyle || "not specified"}
- Previous Experience: ${answers.experience || "not specified"}
- Readiness Level: ${answers.readiness || "not specified"}
- Budget Range: ${answers.budget || "not specified"}

Generate a tailored protocol recommendation with specific peptides, dosing, pricing, and timeline.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Failed to generate protocol" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(JSON.stringify({ error: "No protocol generated" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let protocol;
    try {
      protocol = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Invalid protocol format" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ protocol }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-protocol error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
