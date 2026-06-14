import productRt3 from "@/assets/product-rt3.jpg";
import productBpc from "@/assets/product-bpc.jpg";
import productMots from "@/assets/product-mots.jpg";
import productGhk from "@/assets/product-ghk.jpg";
import productTesa from "@/assets/product-tesa.jpg";

export type KitGoal = "weight-loss" | "longevity" | "recovery" | "performance" | "energy";

export interface Kit {
  id: string;
  slug: string;
  name: string;
  goal: KitGoal;
  tagline: string;
  peptides: string[];
  pricePerMonth: number;   // ZAR membership
  pricePack: number;       // ZAR à la carte
  savings: number;         // ZAR saved vs à la carte
  protocolWeeks: number;
  image: string;
  outcomes: string[];
}

export const KITS: Kit[] = [
  {
    id: "kit-lean",
    slug: "lean-kit",
    name: "Lean Kit",
    goal: "weight-loss",
    tagline: "Engineered for fat loss without losing lean mass.",
    peptides: ["Retatrutide", "Vitamin B12", "Lipo-Mino"],
    pricePerMonth: 2890,
    pricePack: 3490,
    savings: 600,
    protocolWeeks: 12,
    image: productRt3,
    outcomes: ["Average 8–12 kg in 12 weeks", "Appetite control", "Energy preserved"],
  },
  {
    id: "kit-longevity",
    slug: "longevity-kit",
    name: "Longevity Kit",
    goal: "longevity",
    tagline: "Mitochondrial support for the long game.",
    peptides: ["NAD+", "Epitalon", "Glutathione"],
    pricePerMonth: 2490,
    pricePack: 2990,
    savings: 500,
    protocolWeeks: 12,
    image: productMots,
    outcomes: ["Cellular energy", "Sleep depth", "Resilience markers"],
  },
  {
    id: "kit-recovery",
    slug: "recovery-kit",
    name: "Recovery Kit",
    goal: "recovery",
    tagline: "Heal faster. Train harder. Sleep deeper.",
    peptides: ["BPC-157", "TB-500", "Collagen Peptide"],
    pricePerMonth: 1990,
    pricePack: 2390,
    savings: 400,
    protocolWeeks: 12,
    image: productBpc,
    outcomes: ["Tissue repair", "Reduced soreness", "Joint mobility"],
  },
  {
    id: "kit-performance",
    slug: "performance-kit",
    name: "Performance Kit",
    goal: "performance",
    tagline: "Strength, output, and growth-hormone support.",
    peptides: ["CJC-1295 / Ipamorelin", "Tesamorelin"],
    pricePerMonth: 2390,
    pricePack: 2890,
    savings: 500,
    protocolWeeks: 12,
    image: productTesa,
    outcomes: ["GH pulse support", "Lean mass", "Recovery between sessions"],
  },
];

export function kitForGoal(goal?: string): Kit {
  return KITS.find((k) => k.goal === goal) ?? KITS[0];
}

export function kitBySlug(slug: string): Kit | undefined {
  return KITS.find((k) => k.slug === slug);
}
