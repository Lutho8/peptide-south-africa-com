import { KITS, kitForGoal, type Kit } from "@/data/kits";

export interface QuizAnswers {
  goal?: string;
  issues?: string;
  lifestyle?: string;
  experience?: string;
  readiness?: string;
  budget?: string;
}

export interface Recommendation {
  kit: Kit;
  healthScore: number;        // 0–100
  timelineWeeks: number;
  tier: "starter" | "standard" | "premium";
  rationale: string[];
}

const GOAL_MAP: Record<string, string> = {
  "fat-loss": "weight-loss",
  "weight-loss": "weight-loss",
  "both": "weight-loss",
  "recovery": "recovery",
  "performance": "performance",
  "longevity": "longevity",
  "energy": "energy",
};

export function recommend(answers: QuizAnswers): Recommendation {
  const mappedGoal = GOAL_MAP[answers.goal ?? ""] ?? "weight-loss";
  const kit = kitForGoal(mappedGoal) ?? KITS[0];

  // Heuristic health score
  let score = 60;
  if (answers.lifestyle === "active") score += 18;
  else if (answers.lifestyle === "moderate") score += 8;
  if (answers.experience === "experienced") score += 6;
  if (answers.readiness === "ready-now") score += 8;
  if (answers.issues === "low-energy") score -= 6;
  if (answers.issues === "stubborn-fat") score -= 4;
  score = Math.max(28, Math.min(94, score));

  const tier: Recommendation["tier"] =
    answers.budget === "premium" ? "premium" :
    answers.budget === "standard" ? "standard" : "starter";

  const rationale = [
    `Matched to your goal: ${kit.tagline}`,
    `12-week protocol designed for your lifestyle profile.`,
    tier === "premium" ? "Premium support with priority clinician review." :
      tier === "standard" ? "Standard membership with monthly clinician check-ins." :
      "Starter membership — essentials only, upgrade anytime.",
  ];

  return { kit, healthScore: score, timelineWeeks: kit.protocolWeeks, tier, rationale };
}

const STORAGE_KEY = "peptidesa.recommendation";

export function saveRecommendation(rec: Recommendation) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      kitSlug: rec.kit.slug,
      healthScore: rec.healthScore,
      tier: rec.tier,
      goal: rec.kit.goal,
      savedAt: Date.now(),
    }));
  } catch { /* ignore */ }
}

export function loadRecommendation(): { kitSlug: string; goal: string; tier: string; healthScore: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}
