// generate-protocol v2 — Lovable-free deterministic peptide protocol engine
// Maps quiz answers to clinically-curated protocols. Zero external AI dependency.
// Same JSON contract as v1 so the frontend needs no changes.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { formatZarWhole, PRICING, WEIGHT_LOSS_SAVING } from "../_shared/pricing.ts";

const PROGRAM_MONTHLY = formatZarWhole(PRICING.programOffers.monthly.amount);
const PROGRAM_FULL = formatZarWhole(PRICING.programOffers.full12Week.amount);
const PROGRAM_SAVING = `Save ${formatZarWhole(WEIGHT_LOSS_SAVING)} vs three monthly payments`;

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

// ─── Protocol Knowledge Base ───────────────────────────────────────────────

interface Peptide {
  name: string;
  dose: string;
  frequency: string;
  purpose: string;
}

interface Protocol {
  protocolName: string;
  subtitle: string;
  duration: string;
  whyFits: string;
  timeline: string;
  monthlyPrice: string;
  fullPrice: string;
  savings: string;
  peptides: Peptide[];
  expectedResults: { icon: string; label: string }[];
  included: string[];
  weeklySchedule: string;
  warnings: string[];
}

function stripControlCharacters(value: string): string {
  return [...value]
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join("");
}

function applyPublicSafetyCopy(protocol: Protocol): Protocol {
  return {
    ...protocol,
    timeline: "Your clinician will confirm an appropriate review timeline. Use the tracker to record baseline, adherence and any changes for discussion.",
    peptides: protocol.peptides.map((peptide) => ({
      ...peptide,
      dose: "Pending clinician review",
      frequency: "Confirmed after clinician review",
    })),
    expectedResults: [
      { icon: "shield", label: "Clinician-reviewed pathway" },
      { icon: "sparkles", label: "Progress tracked over time" },
      { icon: "heart", label: "Response monitored individually" },
      { icon: "zap", label: "Adjustments based on review" },
    ],
    weeklySchedule: "No dosing schedule is issued by the public quiz. The final schedule, if appropriate, is confirmed only after clinician review.",
    warnings: [
      "Do not begin or change a protocol before clinician review.",
      "Disclose medications, allergies and relevant health conditions during review.",
      "Seek medical care promptly for serious or unexpected symptoms.",
    ],
  };
}

function buildProtocol(
  goal: string | undefined,
  issues: string | undefined,
  lifestyle: string | undefined,
  experience: string | undefined,
  budget: string | undefined,
  leadName: string
): Protocol {
  const name = stripControlCharacters(leadName?.trim().slice(0, 80) ?? "") || "Your";

  // ── Goal routing ──
  const isFatLoss = goal === "fat-loss" || goal === "both";
  const isRecovery = goal === "recovery" || goal === "both";
  const isPremium = budget === "premium";
  const isStarter = budget === "starter";
  const hasPlateau = issues === "plateau";
  const isSedentary = lifestyle === "sedentary";
  const isExperienced = experience === "experienced";

  // ── Protocol selection ──
  let protocol: Protocol;

  if (isFatLoss && !isRecovery) {
    // Pure fat-loss track
    if (isPremium || (isExperienced && hasPlateau)) {
      protocol = {
        protocolName: "Metabolic Reset Pro",
        subtitle: "Triple-agonist + mitochondrial optimization for maximum body recomposition",
        duration: "12 Weeks",
        whyFits: `${name}, your assessment indicates a metabolism that would benefit from a multi-pathway approach. The triple-agonist stack addresses GLP-1, GIP, and glucagon receptors simultaneously — the most advanced fat-loss protocol available. Combined with MOTS-C for mitochondrial density, this creates a powerful metabolic reset.`,
        timeline: "Week 2-3: Appetite suppression and initial water weight drop. Week 4-6: Steady fat loss of 0.5-1kg/week. Week 8-12: Visible body recomposition with improved energy and metabolic markers.",
        monthlyPrice: PROGRAM_MONTHLY,
        fullPrice: PROGRAM_FULL,
        savings: PROGRAM_SAVING,
        peptides: [
          { name: "Retatrutide (RT3)", dose: "0.5mg → 4mg/week titrated", frequency: "Once weekly subcutaneous", purpose: "Triple-agonist fat loss, appetite regulation, metabolic optimization" },
          { name: "MOTS-C", dose: "5-10mg/week", frequency: "Twice weekly", purpose: "Mitochondrial biogenesis, exercise performance, metabolic flexibility" },
          { name: "GHK-Cu", dose: "1-2mg/day", frequency: "Daily", purpose: "Skin tightening during rapid fat loss, collagen synthesis" },
        ],
        expectedResults: [
          { icon: "flame", label: "8-12% body fat reduction" },
          { icon: "zap", label: "Sustained energy without crashes" },
          { icon: "heart", label: "Improved metabolic markers" },
          { icon: "sparkles", label: "Tighter skin during weight loss" },
        ],
        included: [
          "12-week protocol with weekly dosing schedule",
          "Titration guide (0.5mg → 4mg RT3)",
          "Meal timing recommendations",
          "Monthly check-in schedule",
          "WhatsApp support group access",
          "Reconstitution & storage guide",
        ],
        weeklySchedule: "Monday: RT3 injection (titrated dose). Wednesday: MOTS-C injection. Daily: GHK-Cu subcutaneous. Recommended: 16:8 intermittent fasting, 30min cardio 4x/week.",
        warnings: [
          "Not suitable for Type 1 diabetics or those with history of pancreatitis",
          "Requires gradual titration to minimize GI side effects",
          "Monitor blood glucose weekly during first month",
          "Discontinue 2 weeks before any surgery",
        ],
      };
    } else if (isStarter || isSedentary) {
      protocol = {
        protocolName: "Lean Start",
        subtitle: "Gentle, sustainable fat loss for beginners or those returning to fitness",
        duration: "12 Weeks",
        whyFits: `${name}, your assessment suggests you're looking for a manageable entry point. The dual-agonist approach (TZ-2) offers significant appetite suppression and fat loss with a gentler side-effect profile than triple-agonists. Combined with BPC-157 for gut health — critical for fat-loss success.`,
        timeline: "Week 1-2: Reduced appetite, improved satiety. Week 3-5: 0.3-0.8kg/week fat loss. Week 6-12: Cumulative 4-8kg total body fat reduction with improved gut health.",
        monthlyPrice: PROGRAM_MONTHLY,
        fullPrice: PROGRAM_FULL,
        savings: PROGRAM_SAVING,
        peptides: [
          { name: "Tirzepatide (TZ-2)", dose: "2.5mg → 7.5mg/week titrated", frequency: "Once weekly subcutaneous", purpose: "Dual GIP/GLP-1 agonist for appetite suppression and fat loss" },
          { name: "BPC-157", dose: "250-500mcg/day", frequency: "Daily", purpose: "Gut healing, reduces inflammation, supports nutrient absorption" },
        ],
        expectedResults: [
          { icon: "flame", label: "5-8kg total fat loss" },
          { icon: "shield", label: "Improved gut health & digestion" },
          { icon: "zap", label: "Reduced cravings & stable energy" },
        ],
        included: [
          "12-week starter protocol",
          "Gradual titration schedule (2.5mg → 7.5mg)",
          "Gut-health nutrition guide",
          "Beginner exercise plan",
          "Weekly WhatsApp tips",
          "Reconstitution & storage guide",
        ],
        weeklySchedule: "Sunday: TZ-2 injection (titrated). Daily: BPC-157 subcutaneous or oral. Recommended: Protein-forward meals, 8,000 steps/day minimum, 2x strength training.",
        warnings: [
          "Start at lowest dose to assess tolerance",
          "Common initial side effects: mild nausea, reduced appetite (usually resolve in 3-5 days)",
          "Stay well-hydrated; increase water intake to 3L/day",
          "Consult your GP if you have gallbladder issues",
        ],
      };
    } else {
      protocol = {
        protocolName: "Body Recomposition",
        subtitle: "Balanced fat loss with muscle preservation and recovery support",
        duration: "12 Weeks",
        whyFits: `${name}, your assessment points to someone who's active and wants a balanced approach. This protocol combines the proven dual-agonist fat-loss mechanism with healing peptides to protect joints and soft tissue during increased training volume.`,
        timeline: "Week 2-3: Appetite regulation kicks in. Week 4-8: Steady 0.5kg/week fat loss while maintaining training intensity. Week 9-12: Visible recomposition with improved recovery.",
        monthlyPrice: PROGRAM_MONTHLY,
        fullPrice: PROGRAM_FULL,
        savings: PROGRAM_SAVING,
        peptides: [
          { name: "Tirzepatide (TZ-2)", dose: "5mg → 10mg/week titrated", frequency: "Once weekly subcutaneous", purpose: "Sustained fat loss with appetite control" },
          { name: "BPC-157 / TB-500 Stack", dose: "250mcg BPC + 2mg TB", frequency: "Twice weekly", purpose: "Tendon/ligament protection, faster recovery between sessions" },
          { name: "GHK-Cu", dose: "1mg/day", frequency: "Daily", purpose: "Skin health, anti-inflammatory, tissue repair" },
        ],
        expectedResults: [
          { icon: "flame", label: "6-10kg fat loss" },
          { icon: "dumbbell", label: "Maintained strength & muscle" },
          { icon: "shield", label: "Faster workout recovery" },
          { icon: "sparkles", label: "Improved skin quality" },
        ],
        included: [
          "12-week recomposition protocol",
          "Training volume adjustment guide",
          "Macro prescription by goal phase",
          "Recovery optimization checklist",
          "Bi-weekly check-ins",
          "WhatsApp support access",
        ],
        weeklySchedule: "Sunday: TZ-2 injection. Tuesday & Friday: BPC-157 + TB-500 stack. Daily: GHK-Cu. Training: 4x/week progressive overload, deload week 6.",
        warnings: [
          "Monitor training volume — don't increase intensity too rapidly",
          "TB-500 may cause temporary hair shedding in some users (reversible)",
          "Ensure adequate protein intake (1.6-2.0g/kg bodyweight)",
        ],
      };
    }
  } else if (isRecovery && !isFatLoss) {
    // Pure recovery track
    if (isPremium) {
      protocol = {
        protocolName: "Total Recovery System",
        subtitle: "Comprehensive healing protocol for athletes and active individuals with chronic issues",
        duration: "8-12 Weeks",
        whyFits: `${name}, your assessment indicates significant recovery needs. This protocol targets multiple healing pathways simultaneously: gut repair, tendon/ligament regeneration, immune modulation, and systemic inflammation reduction.`,
        timeline: "Week 1-2: Reduced inflammation, improved sleep. Week 3-4: Noticeable reduction in chronic pain/stiffness. Week 5-8: Tissue remodeling phase. Week 9-12: Full recovery maintenance.",
        monthlyPrice: "R3,299",
        fullPrice: "R7,499",
        savings: "Save R1,698",
        peptides: [
          { name: "GLOW Blend (GHK-Cu + TB-500 + BPC-157)", dose: "2,330mcg/day", frequency: "Daily subcutaneous", purpose: "Comprehensive tissue regeneration, anti-inflammatory, wound healing" },
          { name: "Thymosin Alpha-1", dose: "1.6mg", frequency: "Twice weekly", purpose: "Immune modulation, reduces autoimmune flares, supports recovery" },
          { name: "BPC-157 (additional oral)", dose: "500mcg/day", frequency: "Daily oral", purpose: "Gut barrier repair, systemic healing via oral route" },
        ],
        expectedResults: [
          { icon: "shield", label: "60-80% reduction in chronic pain" },
          { icon: "heart", label: "Improved sleep & recovery" },
          { icon: "dumbbell", label: "Return to full training capacity" },
          { icon: "zap", label: "Reduced systemic inflammation" },
        ],
        included: [
          "12-week recovery protocol",
          "Injury-specific modification guide",
          "Physical therapy integration plan",
          "Anti-inflammatory nutrition protocol",
          "Sleep optimization stack",
          "Priority WhatsApp support",
        ],
        weeklySchedule: "Daily: GLOW Blend injection + oral BPC-157. Monday & Thursday: Thymosin Alpha-1. Recommended: Low-impact training (swimming, cycling), daily stretching, infrared sauna 3x/week.",
        warnings: [
          "If you have active cancer or are immunosuppressed, consult your oncologist before Thymosin Alpha-1",
          "Do not combine with NSAIDs during first 4 weeks (reduces peptide effectiveness)",
          "Oral BPC-157 should be taken on an empty stomach for optimal absorption",
        ],
      };
    } else {
      protocol = {
        protocolName: "Repair & Rebuild",
        subtitle: "Targeted healing for soft-tissue injuries, gut issues, and general recovery",
        duration: "8 Weeks",
        whyFits: `${name}, your assessment shows a need for focused healing support. This protocol centers on the most evidence-backed healing peptide (BPC-157) with TB-500 for systemic tissue repair. Ideal for nagging injuries that won't resolve with rest alone.`,
        timeline: "Week 1-2: Inflammation begins to subside. Week 3-5: Tissue repair phase — reduced pain, improved range of motion. Week 6-8: Consolidation — strengthened tissue, reduced re-injury risk.",
        monthlyPrice: "R2,499",
        fullPrice: "R4,999",
        savings: "Save R998",
        peptides: [
          { name: "BPC-157", dose: "500mcg/day", frequency: "Daily", purpose: "Accelerated healing of tendons, ligaments, muscles, and gut lining" },
          { name: "TB-500", dose: "5mg", frequency: "Twice weekly", purpose: "Systemic tissue repair, flexibility, inflammation reduction" },
          { name: "GHK-Cu", dose: "1mg/day", frequency: "Daily", purpose: "Collagen synthesis, skin/tissue quality during repair" },
        ],
        expectedResults: [
          { icon: "shield", label: "Faster injury healing" },
          { icon: "dumbbell", label: "Improved flexibility & ROM" },
          { icon: "heart", label: "Reduced chronic inflammation" },
        ],
        included: [
          "8-week healing protocol",
          "Injury-specific dosing variations",
          "Rehab exercise progressions",
          "Nutrition for tissue repair guide",
          "Weekly progress tracker",
        ],
        weeklySchedule: "Daily: BPC-157 + GHK-Cu. Monday & Thursday: TB-500 5mg. Training: Deload to 60% normal volume, focus on mobility work, 2x physio sessions/week.",
        warnings: [
          "If pain worsens after week 2, discontinue and consult a sports physician",
          "Avoid heavy loading of injured tissue until week 5",
          "Stay hydrated; peptides work best in well-hydrated tissue",
        ],
      };
    }
  } else {
    // Both / default
    if (isPremium) {
      protocol = {
        protocolName: "Transformation Elite",
        subtitle: "The complete stack for maximum fat loss, recovery, and performance",
        duration: "16 Weeks",
        whyFits: `${name}, your assessment indicates you're ready for a comprehensive transformation. This is our most advanced protocol, combining triple-agonist fat loss with complete tissue regeneration and mitochondrial optimization. For those who want it all.`,
        timeline: "Phase 1 (Weeks 1-4): Metabolic priming, appetite control, initial fat loss. Phase 2 (Weeks 5-10): Accelerated recomposition, tissue repair. Phase 3 (Weeks 11-16): Peak conditioning, maintenance transition.",
        monthlyPrice: PROGRAM_MONTHLY,
        fullPrice: PROGRAM_FULL,
        savings: PROGRAM_SAVING,
        peptides: [
          { name: "Retatrutide (RT3)", dose: "1mg → 4mg/week titrated", frequency: "Once weekly", purpose: "Maximum fat loss via triple-agonist mechanism" },
          { name: "GLOW Blend", dose: "2,330mcg/day", frequency: "Daily", purpose: "Tissue regeneration, anti-aging, recovery" },
          { name: "MOTS-C", dose: "10mg/week", frequency: "Twice weekly", purpose: "Mitochondrial optimization, exercise performance" },
          { name: "CJC-1295 / Ipamorelin", dose: "100mcg each", frequency: "Before bed daily", purpose: "GH pulse amplification, deep sleep, body composition" },
        ],
        expectedResults: [
          { icon: "flame", label: "10-15% body fat reduction" },
          { icon: "dumbbell", label: "Lean muscle preservation" },
          { icon: "zap", label: "Dramatic energy increase" },
          { icon: "heart", label: "Deep, restorative sleep" },
          { icon: "shield", label: "Complete tissue recovery" },
          { icon: "sparkles", label: "Visible anti-aging effects" },
        ],
        included: [
          "16-week elite transformation protocol",
          "Phase-based training & nutrition plans",
          "Monthly bloodwork review checklist",
          "Priority 1-on-1 WhatsApp support",
          "Quarterly protocol adjustments",
          "Lifetime re-order discount (15%)",
        ],
        weeklySchedule: "Sunday: RT3 injection. Daily: GLOW Blend + CJC-1295/Ipamorelin (before bed). Tuesday & Friday: MOTS-C. Training: 5x/week (3 strength, 2 conditioning), daily 10k steps, weekly sauna.",
        warnings: [
          "Requires baseline bloodwork before starting (liver panel, lipids, HbA1c)",
          "Not recommended for first-time peptide users — start with a simpler protocol",
          "Monitor blood glucose closely; triple-agonists can cause hypoglycemia",
          "Discontinue all peptides 4 weeks before any planned surgery",
        ],
      };
    } else {
      protocol = {
        protocolName: "Balanced Transformation",
        subtitle: "Sustainable fat loss with comprehensive recovery support",
        duration: "12 Weeks",
        whyFits: `${name}, your assessment shows you want results across multiple areas — body composition, recovery, and energy. This protocol combines the most versatile peptides to deliver visible fat loss while actively repairing tissue and improving overall vitality.`,
        timeline: "Week 1-3: Energy and appetite improvements. Week 4-8: Steady fat loss (0.5kg/week) with reduced soreness. Week 9-12: Visible transformation with improved recovery and sleep quality.",
        monthlyPrice: PROGRAM_MONTHLY,
        fullPrice: PROGRAM_FULL,
        savings: PROGRAM_SAVING,
        peptides: [
          { name: "Tirzepatide (TZ-2)", dose: "5mg → 10mg/week", frequency: "Once weekly", purpose: "Sustained fat loss, appetite regulation" },
          { name: "BPC-157 / TB-500 Stack", dose: "250mcg BPC + 2mg TB", frequency: "Twice weekly", purpose: "Tissue repair, injury prevention, reduced inflammation" },
          { name: "GHK-Cu", dose: "1mg/day", frequency: "Daily", purpose: "Skin health, collagen synthesis, anti-inflammatory" },
        ],
        expectedResults: [
          { icon: "flame", label: "7-10kg fat loss" },
          { icon: "shield", label: "Faster recovery, less soreness" },
          { icon: "zap", label: "Sustained daily energy" },
          { icon: "sparkles", label: "Healthier skin & hair" },
        ],
        included: [
          "12-week balanced protocol",
          "Progressive training plan",
          "Nutrition framework by phase",
          "Recovery optimization guide",
          "Bi-weekly check-in protocol",
          "WhatsApp community access",
        ],
        weeklySchedule: "Sunday: TZ-2 injection. Tuesday & Friday: BPC-157 + TB-500. Daily: GHK-Cu. Training: 4x/week (2 strength, 1 HIIT, 1 mobility), daily walks, sleep hygiene protocol.",
        warnings: [
          "Monitor training intensity — the fat-loss effect can mask overtraining",
          "Ensure 7-8 hours sleep nightly for optimal peptide synergy",
          "Increase protein to 1.8-2.2g/kg during this protocol",
          "If experiencing persistent nausea, hold TZ-2 dose for 48h then resume at lower dose",
        ],
      };
    }
  }

  return protocol;
}

// ─── Request Handler ───────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > 12_000) {
    return new Response(JSON.stringify({ error: "Request too large" }), {
      status: 413,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

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
    const leadName = typeof rawLeadName === "string"
      ? stripControlCharacters(rawLeadName).replace(/[^\p{L}\p{N}\s'-]/gu, "").slice(0, 80)
      : "";

    // v2: deterministic protocol engine — no external AI call
    const protocol = applyPublicSafetyCopy(buildProtocol(
      answers.goal,
      answers.issues,
      answers.lifestyle,
      answers.experience,
      answers.budget,
      leadName,
    ));

    return new Response(JSON.stringify({ protocol }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-protocol v2 error:", e);
    return new Response(
      JSON.stringify({ error: "Failed to generate protocol. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
