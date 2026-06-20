/**
 * Fixtures mirroring the shape of `aiProtocol` returned by the quiz funnel.
 * Each case asserts: input peptide list -> expected matched product IDs ->
 * expected deep-link URL category (stack | product | category fallback).
 */
export type QuizOutcomeCase = {
  name: string;
  goal: "fat-loss" | "recovery" | "longevity" | "both" | "other";
  peptides: string[];
  expectedProductIds: string[]; // resolved against src/data/products.ts
  expectedKind: "stack" | "product" | "category";
  expectedUrl: (ids: string[]) => string;
};

export const QUIZ_OUTCOMES: QuizOutcomeCase[] = [
  {
    name: "fat-loss stack (Reta + Tirz)",
    goal: "fat-loss",
    peptides: ["Retatrutide", "Tirzepatide"],
    expectedProductIds: ["1", "4"],
    expectedKind: "stack",
    expectedUrl: (ids) => `/shop?stack=${ids.join(",")}&from=quiz`,
  },
  {
    name: "recovery stack (BPC blend + Tesamorelin)",
    goal: "recovery",
    peptides: ["BPC/TB-500", "Tesamorelin"],
    expectedProductIds: ["6", "3"],
    expectedKind: "stack",
    expectedUrl: (ids) => `/shop?stack=${ids.join(",")}&from=quiz`,
  },
  {
    name: "longevity stack (MOTS-C + KLOW80)",
    goal: "longevity",
    peptides: ["MOTS-C", "KLOW80"],
    expectedProductIds: ["5", "8"],
    expectedKind: "stack",
    expectedUrl: (ids) => `/shop?stack=${ids.join(",")}&from=quiz`,
  },
  {
    name: "single product fallback (GHK-Cu only)",
    goal: "longevity",
    peptides: ["GHK-Cu"],
    expectedProductIds: ["2"],
    expectedKind: "product",
    expectedUrl: () => `/product/ghk-cu-50mg?from=quiz`,
  },
  {
    name: "no match -> goal category fallback (fat-loss)",
    goal: "fat-loss",
    peptides: ["NonexistentPeptideXYZ"],
    expectedProductIds: [],
    expectedKind: "category",
    expectedUrl: () => `/shop?category=GLP&from=quiz`,
  },
  {
    name: "no match -> goal category fallback (recovery)",
    goal: "recovery",
    peptides: ["NonexistentPeptideXYZ"],
    expectedProductIds: [],
    expectedKind: "category",
    expectedUrl: () => `/shop?category=Healing&from=quiz`,
  },
];

/**
 * Pure replica of QuizFunnelPage's matching + deep-link routing so the test
 * suite can verify outcomes without rendering the whole funnel.
 *
 * Keep in sync with src/pages/QuizFunnelPage.tsx (matchedProducts useMemo and
 * the deep-link useEffect).
 */
export function deriveDeepLink(
  peptideNames: string[],
  goal: string,
  products: { id: string; name: string; slug: string }[],
): { matchedIds: string[]; url: string | null; kind: "stack" | "product" | "category" | "none" } {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const seen = new Set<string>();
  const matched: typeof products = [];
  for (const pep of peptideNames) {
    const target = norm(pep);
    const hit = products.find((p) => {
      const a = norm(p.name);
      const b = norm(p.slug);
      return a.includes(target) || target.includes(a) || b.includes(target) || target.includes(b);
    });
    if (hit && !seen.has(hit.id)) {
      seen.add(hit.id);
      matched.push(hit);
    }
  }
  const goalToCategory: Record<string, string> = { "fat-loss": "GLP", recovery: "Healing", both: "GLP" };
  if (matched.length >= 2) {
    return {
      matchedIds: matched.map((m) => m.id),
      url: `/shop?stack=${matched.map((m) => m.id).join(",")}&from=quiz`,
      kind: "stack",
    };
  }
  if (matched.length === 1) {
    return { matchedIds: [matched[0].id], url: `/product/${matched[0].slug}?from=quiz`, kind: "product" };
  }
  if (goalToCategory[goal]) {
    return { matchedIds: [], url: `/shop?category=${goalToCategory[goal]}&from=quiz`, kind: "category" };
  }
  return { matchedIds: [], url: null, kind: "none" };
}
