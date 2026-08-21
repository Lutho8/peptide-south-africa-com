// Curated "frequently bought together" pairs.
// Keys are product slugs; values are slugs that pair well clinically/operationally.
// Used by FrequentlyBoughtTogether component on PDP and cart drawer.

export interface BundleHint {
  /** Slug of a product that complements the primary product. */
  slug: string;
  /** Short rationale shown in UI. */
  reason: string;
}

export const BUNDLE_MAP: Record<string, BundleHint[]> = {
  "rt3-reta": [
    { slug: "tz2-tirz", reason: "Stack metabolic research compounds" },
    { slug: "mots-c", reason: "Pair with mitochondrial support" },
  ],
  "tz2-tirz": [
    { slug: "rt3-reta", reason: "Triple-agonist comparator" },
    { slug: "mots-c", reason: "Pair with mitochondrial support" },
  ],
  "bpc-tb500-blend": [
    { slug: "ghk-cu-50mg", reason: "Skin + tissue repair stack" },
    { slug: "tesamorelin", reason: "Recovery + GH axis" },
  ],
  "ghk-cu-50mg": [
    { slug: "bpc-tb500-blend", reason: "Healing + skin synergy" },
    { slug: "glow70", reason: "Compound dermal protocol" },
  ],
  "tesamorelin": [
    { slug: "bpc-tb500-blend", reason: "Recovery pairing" },
    { slug: "mots-c", reason: "Metabolic + GH stack" },
  ],
  "mots-c": [
    { slug: "klow80", reason: "Longevity protocol" },
    { slug: "rt3-reta", reason: "Metabolic research stack" },
  ],
  "glow70": [
    { slug: "ghk-cu-50mg", reason: "Skin-complex stack" },
    { slug: "klow80", reason: "Longevity + dermal" },
  ],
  "klow80": [
    { slug: "mots-c", reason: "Mitochondrial longevity" },
    { slug: "glow70", reason: "Aging + skin renewal" },
  ],
};

/** Accessories suggested after any add-to-cart. Real products in shop; if absent, no-op. */
export const POST_ADD_ACCESSORIES: BundleHint[] = [
  { slug: "bac-water-bacteriostatic", reason: "Required to reconstitute your peptide" },
  { slug: "alcohol-swabs-20", reason: "Keep every reconstitution aseptic" },
  { slug: "insulin-syringes-5", reason: "Accurate small-volume dosing" },
  { slug: "peptide-pen-needles-10", reason: "For pen-based protocols" },
];

/**
 * Universal reconstitution supplies surfaced on the checkout order summary
 * ("Add reconstitution supplies" rail). Kept intentionally short — 3 items —
 * so it never dominates the summary column on mobile.
 */
export const CHECKOUT_SUPPLIES_SLUGS: string[] = [
  "bac-water-bacteriostatic",
  "alcohol-swabs-20",
  "insulin-syringes-5",
];
