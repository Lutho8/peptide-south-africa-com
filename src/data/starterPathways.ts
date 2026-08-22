import { products, type Product } from "@/data/products";

export const STORE_LINKS = {
  startHere: "/start-here",
  shop: "/shop",
  researchShop: "/shop?track=RUO",
  stackBuilder: "/build-your-stack",
  guidedReview: "/quiz?intent=consult",
  account: "/account",
} as const;

export type StarterPathwayId = "30s" | "40s" | "50s" | "60s";

export interface StarterPathway {
  id: StarterPathwayId;
  label: string;
  title: string;
  summary: string;
  researchThemes: string[];
  /** Exactly five catalog slugs so the pathway can prefill the existing 5-pack builder. */
  slugs: [string, string, string, string, string];
}

/**
 * Educational catalog maps for new researchers. These are navigation aids,
 * not treatment recommendations. Age alone never determines suitability.
 */
export const STARTER_PATHWAYS: StarterPathway[] = [
  {
    id: "30s",
    label: "In your 30s",
    title: "Foundational systems research",
    summary: "A broad starting map spanning mitochondrial signalling, immune pathways, recovery models, gut-barrier research and tissue remodelling.",
    researchThemes: ["Mitochondrial & metabolic signalling", "Immune-system signalling", "Recovery & tissue models", "Inflammation & gut-barrier models", "Skin, collagen & tissue remodelling"],
    slugs: ["mots-c", "thymosin-alpha-1", "bpc-tb500-blend", "kpv", "ghk-cu-50mg"],
  },
  {
    id: "40s",
    label: "In your 40s",
    title: "Resilience and recovery research",
    summary: "A research collection organised around mitochondrial function, immune signalling, tissue recovery, inflammatory pathways and extracellular-matrix biology.",
    researchThemes: ["Mitochondrial function", "Immune signalling", "Tissue-recovery models", "Inflammatory pathways", "Collagen & extracellular matrix"],
    slugs: ["ss-31", "thymosin-alpha-1", "bpc-tb500-blend", "kpv", "ghk-cu-50mg"],
  },
  {
    id: "50s",
    label: "In your 50s",
    title: "Cellular energy and healthy-ageing research",
    summary: "A catalog pathway for comparing mitochondrial-derived peptides with immune, inflammatory and tissue-remodelling research areas.",
    researchThemes: ["Mitochondrial membrane research", "Metabolic homeostasis", "Immune-system signalling", "Inflammation & gut-barrier models", "Skin & collagen biology"],
    slugs: ["ss-31", "mots-c", "thymosin-alpha-1", "kpv", "ghk-cu-50mg"],
  },
  {
    id: "60s",
    label: "In your 60s",
    title: "Function, repair and resilience research",
    summary: "A conservative educational map focused on mitochondrial, immune, inflammatory, tissue-repair and collagen research categories.",
    researchThemes: ["Mitochondrial function", "Immune signalling", "Inflammation research", "Tissue-repair models", "Collagen & tissue support"],
    slugs: ["ss-31", "thymosin-alpha-1", "kpv", "bpc-tb500-blend", "ghk-cu-50mg"],
  },
];

export function getStarterPathway(id: string | null | undefined): StarterPathway | undefined {
  return STARTER_PATHWAYS.find((pathway) => pathway.id === id);
}

export function resolveStarterProducts(pathway: StarterPathway): Product[] {
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  return pathway.slugs.map((slug) => bySlug.get(slug)).filter((product): product is Product => Boolean(product));
}

export function starterBuilderLink(id: StarterPathwayId): string {
  return `${STORE_LINKS.stackBuilder}?starter=${id}`;
}

export function guidedReviewLink(id?: StarterPathwayId): string {
  return id ? `${STORE_LINKS.guidedReview}&ageBand=${id}` : STORE_LINKS.guidedReview;
}

export function productStoreLink(slug: string): string {
  return `/product/${slug}`;
}
