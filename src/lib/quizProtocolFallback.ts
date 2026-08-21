export interface QuizProtocolAnswers {
  goal?: string;
  issues?: string;
  lifestyle?: string;
  experience?: string;
  readiness?: string;
  budget?: string;
}

export interface AIProtocol {
  protocolName: string;
  subtitle: string;
  duration: string;
  whyFits: string;
  timeline: string;
  monthlyPrice: string;
  fullPrice: string;
  savings: string;
  peptides: { name: string; dose: string; frequency: string; purpose: string }[];
  expectedResults: { icon: string; label: string }[];
  included: string[];
  weeklySchedule: string;
  warnings: string[];
}

function safeFirstName(name: string) {
  return name.trim().replace(/[^\p{L}\p{N}\s'-]/gu, "").split(/\s+/)[0]?.slice(0, 40) || "Your";
}

export function buildFallbackProtocol(answers: QuizProtocolAnswers, leadName: string): AIProtocol {
  const name = safeFirstName(leadName);
  const commonIncluded = [
    "A clear starter cycle with pack options",
    "Batch-matched Certificate of Analysis",
    "Free Peptide Tracker digital bonus",
    "WhatsApp community access",
    "Storage and handling guidance",
  ];

  if (answers.goal === "recovery") {
    return {
      protocolName: "Repair & Rebuild",
      subtitle: "A focused recovery pathway built around tissue support and consistent tracking",
      duration: "8–12 Weeks",
      whyFits: `${name}, your answers point to recovery as the first priority. This starter pathway keeps the stack focused, makes progress easy to track and leaves final suitability to the required clinical or research review.`,
      timeline: "Weeks 1–2 establish the routine; weeks 3–8 are used to track recovery, mobility and day-to-day output.",
      monthlyPrice: "R1,585",
      fullPrice: "R4,042",
      savings: "Save 15% with 3-packs",
      peptides: [
        { name: "BPC/TB-500 Blend", dose: "Per approved protocol", frequency: "Per approved schedule", purpose: "Recovery and tissue-repair research pathway" },
        { name: "GHK-Cu 50 MG", dose: "Per approved protocol", frequency: "Per approved schedule", purpose: "Collagen and tissue-quality research support" },
      ],
      expectedResults: [
        { icon: "shield", label: "A structured recovery routine" },
        { icon: "dumbbell", label: "Track mobility and output" },
        { icon: "zap", label: "Less guesswork week to week" },
      ],
      included: commonIncluded,
      weeklySchedule: "Your final schedule is confirmed after review. Use the tracker to record routine adherence, mobility and recovery notes.",
      warnings: ["Final product suitability and schedule require the applicable clinician or research review."],
    };
  }

  if (answers.goal === "both") {
    return {
      protocolName: "Full Reset Pathway",
      subtitle: "A sequenced body-composition and recovery pathway without an oversized first order",
      duration: "12 Weeks",
      whyFits: `${name}, you selected both composition and performance. The recommended route starts with the two highest-priority pathways and uses 3-packs to improve value without adding unrelated products.`,
      timeline: "Weeks 1–4 establish adherence; weeks 5–12 focus on measurable composition, energy and recovery trends.",
      monthlyPrice: "R2,205",
      fullPrice: "R5,623",
      savings: "Save 15% with 3-packs",
      peptides: [
        { name: "RT3 (Reta)", dose: "Pending GP review", frequency: "Pending GP review", purpose: "Metabolic pathway" },
        { name: "BPC/TB-500 Blend", dose: "Per approved protocol", frequency: "Per approved schedule", purpose: "Recovery pathway" },
      ],
      expectedResults: [
        { icon: "flame", label: "Track composition trends" },
        { icon: "dumbbell", label: "Track recovery and output" },
        { icon: "heart", label: "One coordinated pathway" },
      ],
      included: commonIncluded,
      weeklySchedule: "The metabolic component is only activated after GP review. Your tracker keeps both pathways in one simple weekly view.",
      warnings: ["Prescription-only products are not supplied until an HPCSA-registered GP has reviewed suitability."],
    };
  }

  return {
    protocolName: "Lean Start",
    subtitle: "A clear, beginner-friendly metabolic pathway with a clinically reviewed next step",
    duration: "12 Weeks",
    whyFits: `${name}, your answers point to body composition as the first priority. This recommendation keeps the starting stack focused and uses the 3-pack as the best balance of adherence and price per vial.`,
    timeline: "Weeks 1–4 establish the routine and baseline; weeks 5–12 focus on consistent tracking and review.",
    monthlyPrice: "R1,850",
    fullPrice: "R4,718",
    savings: "Save 15% with 3-packs",
    peptides: [
      { name: "TZ-2 (Tirz)", dose: "Pending GP review", frequency: "Pending GP review", purpose: "Metabolic pathway" },
      { name: "BPC/TB-500 Blend", dose: "Per approved protocol", frequency: "Per approved schedule", purpose: "Recovery and routine support" },
    ],
    expectedResults: [
      { icon: "flame", label: "Track composition trends" },
      { icon: "zap", label: "Build a consistent routine" },
      { icon: "shield", label: "GP-reviewed next step" },
    ],
    included: commonIncluded,
    weeklySchedule: "The prescription pathway is confirmed only after GP review. Use the tracker for adherence, energy and progress notes.",
    warnings: ["Prescription-only products are not supplied until an HPCSA-registered GP has reviewed suitability."],
  };
}
