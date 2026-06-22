import productRt3 from "@/assets/vials/rt3.jpg";
import productGhk from "@/assets/vials/ghk.jpg";
import productTesa from "@/assets/vials/tesa.jpg";
import productTz2 from "@/assets/vials/tz2.jpg";
import productMots from "@/assets/vials/mots.jpg";
import productBpc from "@/assets/vials/bpc.jpg";
import productGlow from "@/assets/vials/glow.jpg";
import productKlow from "@/assets/vials/klow.jpg";

// All prices are in ZAR. Single-market site (South Africa).

export interface Variant {
  label: string;
  price: number; // ZAR
  /** Vials per pack (3, 5, 10). When set, the card renders pack-pricing UI. */
  pack?: number;
  /** mg per vial — used to compute per-mg pricing for pack variants. */
  mgPerVial?: number;
  /** Per-variant stock count, e.g. "2 Avail" chip. */
  stock?: number;
}

/**
 * Build standard 3-pack and single-vial variants for a given peptide vial.
 * basePrice = ZAR price of a single vial. 3-pack volume discount: -8%.
 * 3-Pack is listed first so it becomes the default on the PDP.
 */
function buildPackVariants(
  basePrice: number,
  mgPerVial: number,
  stocks: { p1?: number; p3?: number } = {},
): Variant[] {
  const round0 = (n: number) => Math.round(n);
  return [
    { label: "3-Pack", price: round0(basePrice * 3 * 0.92), pack: 3, mgPerVial, stock: stocks.p3 ?? 2 },
    { label: "Single Vial", price: round0(basePrice), pack: 1, mgPerVial, stock: stocks.p1 ?? 6 },
  ];
}

function rangeFromVariants(variants: Variant[]): string {
  const prices = variants.map((v) => v.price);
  const fmt = (n: number) => `R${n.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`;
  return `${fmt(Math.min(...prices))} – ${fmt(Math.max(...prices))}`;
}

export type ProductTrack = "RUO" | "GP";

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  /** Price in ZAR. */
  price: number;
  /** Optional pre-formatted ZAR range, e.g. "R1,250 – R8,950". */
  priceRange?: string;
  image: string;
  category: string;
  tag?: string;
  benefits: string[];
  whatsIncluded: string[];
  whoItsFor: string[];
  howItWorks: string[];
  faqs: { question: string; answer: string }[];
  inStock: boolean;
  stock?: number;
  variants?: Variant[];
  purity?: string;
  storage?: string;
  sku?: string;
  casNumber?: string;
  compoundClass?: string;
  /**
   * Distribution pathway:
   *  - "RUO" — research compound, standard checkout with researcher attestation.
   *  - "GP"  — prescription-only: routes through quiz → GP review → partner pharmacy.
   */
  track?: ProductTrack;
}

// Build all variants first so we can derive priceRange consistently.
const rt3Variants  = buildPackVariants(1250, 10, { p3: 3 });
const ghkVariants  = buildPackVariants(630,  50, { p3: 2 });
const tesVariants  = buildPackVariants(775,  10, { p3: 2 });
const tz2Variants  = buildPackVariants(895,  10, { p3: 2 });
const motsVariants = buildPackVariants(485,  10, { p3: 2 });
const bpcVariants  = buildPackVariants(955,  20, { p3: 2 });
const glowVariants = buildPackVariants(1080, 70, { p3: 3 });
const klowVariants = buildPackVariants(1260, 80, { p3: 2 });

export const products: Product[] = [
  {
    id: "1",
    name: "RT3 (Reta)",
    slug: "rt3-reta",
    shortDescription: "Triple agonist targeting GLP-1, GIP, and glucagon receptors for metabolic research.",
    description: "RT3 is a high-purity, fully lab-tested research peptide designed to target multiple metabolic pathways. It is a triple agonist of GLP-1, GIP, and glucagon receptors, making it a cutting-edge compound in the study of obesity, insulin resistance, and metabolic disorders.",
    price: 1250,
    priceRange: rangeFromVariants(rt3Variants),
    image: productRt3,
    category: "GLP",
    tag: "Best Seller",
    purity: "≥99%",
    storage: "Refrigerate after reconstitution.",
    sku: "RTT-RT3-10",
    casNumber: "2381089-83-2",
    compoundClass: "GLP-1 / GIP / Glucagon triple agonist",
    track: "GP",
    variants: rt3Variants,
    benefits: ["Targets GLP-1, GIP & glucagon receptors", "Metabolic pathway research", "Insulin resistance studies", "Obesity research applications"],
    whatsIncluded: ["1x Research vial", "Certificate of Analysis", "Batch certification", "Storage instructions"],
    whoItsFor: ["Metabolic disorder researchers", "Obesity research labs", "GLP-1 pathway studies"],
    howItWorks: ["Select your desired MG variant", "Store as directed", "Follow research protocol", "Document findings"],
    faqs: [
      { question: "What purity level is guaranteed?", answer: "≥99% purity — every batch is third-party HPLC tested at Janoshik Analytical. COA is downloadable on every product page." },
      { question: "How should I store this?", answer: "Refrigerate after reconstitution. Store lyophilized powder at -20°C." },
    ],
    inStock: true,
    stock: 12,
  },
  {
    id: "2",
    name: "GHK-Cu 50 MG",
    slug: "ghk-cu-50mg",
    shortDescription: "Copper peptide for skin rejuvenation, wound healing, and collagen synthesis research.",
    description: "GHK-Cu is a naturally occurring copper peptide with extensive research backing its role in tissue remodeling, collagen synthesis, and anti-inflammatory pathways. This 50mg vial provides ample material for comprehensive dermatological and regenerative research.",
    price: 630,
    priceRange: rangeFromVariants(ghkVariants),
    image: productGhk,
    category: "Skin & Hair",
    purity: "≥99%",
    storage: "Refrigerate after reconstitution.",
    sku: "RTT-GHK-50",
    casNumber: "89030-95-5",
    compoundClass: "Tripeptide copper complex",
    track: "RUO",
    variants: ghkVariants,
    benefits: ["Collagen synthesis stimulation", "Wound healing pathway research", "Anti-inflammatory studies", "Skin elasticity research"],
    whatsIncluded: ["1x 50mg Research vial", "Certificate of Analysis", "Batch certification", "Storage instructions"],
    whoItsFor: ["Dermatological researchers", "Wound healing studies", "Anti-aging research"],
    howItWorks: ["Reconstitute per protocol", "Apply research methodology", "Monitor biomarkers", "Record observations"],
    faqs: [
      { question: "Is the COA publicly available?", answer: "Yes, every product page includes a direct link to the Certificate of Analysis." },
    ],
    inStock: true,
    stock: 8,
  },
  {
    id: "3",
    name: "Tesamorelin",
    slug: "tesamorelin",
    shortDescription: "Growth hormone-releasing hormone analog for GH secretion and body composition research.",
    description: "Tesamorelin is a synthetic analog of growth hormone-releasing hormone (GHRH) studied for its ability to stimulate GH production. Widely researched for its effects on visceral adipose tissue reduction and lipodystrophy.",
    price: 775,
    priceRange: rangeFromVariants(tesVariants),
    image: productTesa,
    category: "Growth Hormone",
    purity: "≥99%",
    storage: "Refrigerate after reconstitution.",
    sku: "RTT-TES-10",
    casNumber: "106612-94-6",
    compoundClass: "GHRH analog",
    track: "RUO",
    variants: tesVariants,
    benefits: ["GH secretion stimulation", "Visceral fat reduction research", "Lipodystrophy studies", "Body composition optimization"],
    whatsIncluded: ["1x Research vial", "Certificate of Analysis", "Batch certification", "Dosing reference"],
    whoItsFor: ["Growth hormone researchers", "Body composition labs", "Endocrinology studies"],
    howItWorks: ["Reconstitute as directed", "Follow GH research protocol", "Track GH biomarkers", "Analyze data"],
    faqs: [
      { question: "What category does Tesamorelin fall under?", answer: "It's classified as a GHRH analog, targeting the growth hormone axis." },
    ],
    inStock: true,
    stock: 4,
  },
  {
    id: "4",
    name: "TZ-2 (Tirz)",
    slug: "tz2-tirz",
    shortDescription: "Dual GIP/GLP-1 receptor agonist for advanced metabolic and weight loss research.",
    description: "TZ-2 is a dual GIP and GLP-1 receptor agonist representing the next generation of metabolic peptide research. Studied extensively for its role in glucose homeostasis, appetite regulation, and significant body weight reduction in preclinical models.",
    price: 895,
    priceRange: rangeFromVariants(tz2Variants),
    image: productTz2,
    category: "GLP",
    tag: "Pre-Order",
    purity: "≥99%",
    storage: "Refrigerate after reconstitution.",
    sku: "RTT-TZ2-10",
    casNumber: "2023788-19-2",
    compoundClass: "GLP-1 / GIP dual agonist",
    track: "GP",
    variants: tz2Variants,
    benefits: ["Dual GIP/GLP-1 agonism", "Glucose homeostasis research", "Appetite regulation studies", "Body weight reduction research"],
    whatsIncluded: ["1x Research vial", "Certificate of Analysis", "Batch certification", "Storage instructions"],
    whoItsFor: ["Metabolic researchers", "Diabetes research labs", "Weight management studies"],
    howItWorks: ["Select MG variant", "Store per guidelines", "Implement research protocol", "Track metabolic markers"],
    faqs: [
      { question: "Why is this marked Pre-Order?", answer: "TZ-2 is in high demand. Pre-orders guarantee your allocation from the next certified batch." },
    ],
    inStock: false,
  },
  {
    id: "5",
    name: "MOTS-C",
    slug: "mots-c",
    shortDescription: "Mitochondrial-derived peptide for metabolic homeostasis and longevity research.",
    description: "MOTS-C is a mitochondrial-derived peptide that plays a critical role in metabolic homeostasis. Research shows it regulates insulin sensitivity, promotes fatty acid oxidation, and may have significant implications for aging and exercise physiology.",
    price: 485,
    priceRange: rangeFromVariants(motsVariants),
    image: productMots,
    category: "Longevity",
    tag: "Pre-Order",
    purity: "≥99%",
    storage: "Refrigerate after reconstitution.",
    sku: "RTT-MTC-10",
    casNumber: "1627580-64-6",
    compoundClass: "Mitochondrial-derived peptide",
    track: "RUO",
    variants: motsVariants,
    benefits: ["Metabolic homeostasis research", "Insulin sensitivity studies", "Fatty acid oxidation pathways", "Exercise physiology research"],
    whatsIncluded: ["1x Research vial", "Certificate of Analysis", "Batch certification", "Storage instructions"],
    whoItsFor: ["Longevity researchers", "Metabolic labs", "Exercise science studies"],
    howItWorks: ["Select desired quantity", "Reconstitute per protocol", "Administer per research design", "Monitor metabolic markers"],
    faqs: [
      { question: "What makes MOTS-C unique?", answer: "It's one of the few known mitochondrial-derived peptides with direct metabolic regulatory effects." },
    ],
    inStock: false,
  },
  {
    id: "6",
    name: "BPC/TB-500 Blend",
    slug: "bpc-tb500-blend",
    shortDescription: "Synergistic healing blend combining BPC-157 and TB-500 for tissue repair research.",
    description: "This premium blend combines two of the most extensively researched healing peptides — BPC-157 and TB-500 — into a single vial. Designed for researchers studying tissue repair, angiogenesis, and accelerated recovery pathways.",
    price: 955,
    priceRange: rangeFromVariants(bpcVariants),
    image: productBpc,
    category: "Healing",
    tag: "Pre-Order",
    purity: "≥99%",
    storage: "Refrigerate after reconstitution.",
    sku: "RTT-BTB-20",
    casNumber: "137525-51-0 / 77591-33-4",
    compoundClass: "BPC-157 + TB-500 healing blend",
    track: "RUO",
    variants: bpcVariants,
    benefits: ["Synergistic tissue repair", "Angiogenesis promotion", "Anti-inflammatory research", "Accelerated recovery studies"],
    whatsIncluded: ["1x 20mg Blend vial", "Certificate of Analysis", "Batch certification", "Protocol guide"],
    whoItsFor: ["Tissue repair researchers", "Sports medicine labs", "Regenerative medicine studies"],
    howItWorks: ["Reconstitute the blend", "Follow healing protocol", "Track repair biomarkers", "Document recovery data"],
    faqs: [
      { question: "Why combine BPC-157 and TB-500?", answer: "Research suggests these peptides work synergistically, enhancing tissue repair outcomes beyond either compound alone." },
    ],
    inStock: false,
  },
  {
    id: "7",
    name: "GLOW70",
    slug: "glow70",
    shortDescription: "Advanced skin peptide complex for collagen production and skin rejuvenation research.",
    description: "GLOW70 is a specialized 70mg skin peptide formulation designed for advanced dermatological research. Targets multiple pathways involved in collagen production, skin cell turnover, and protective barrier function.",
    price: 1080,
    priceRange: rangeFromVariants(glowVariants),
    image: productGlow,
    category: "Skin & Hair",
    purity: "≥99%",
    storage: "Refrigerate after reconstitution.",
    sku: "RTT-GLW-70",
    compoundClass: "Multi-peptide skin complex",
    track: "RUO",
    variants: glowVariants,
    benefits: ["Collagen production research", "Skin cell turnover studies", "Barrier function research", "Anti-aging pathway analysis"],
    whatsIncluded: ["1x 70mg Research vial", "Certificate of Analysis", "Batch certification", "Application protocol"],
    whoItsFor: ["Skin biology researchers", "Cosmetic peptide labs", "Dermatology studies"],
    howItWorks: ["Prepare per protocol", "Apply research methodology", "Track skin biomarkers", "Evaluate results over 8 weeks"],
    faqs: [
      { question: "What makes GLOW70 different from GHK-Cu?", answer: "GLOW70 is a multi-peptide complex targeting broader skin health pathways beyond copper peptide mechanisms." },
    ],
    inStock: true,
    stock: 18,
  },
  {
    id: "8",
    name: "KLOW80",
    slug: "klow80",
    shortDescription: "Premium 80mg longevity peptide for cellular renewal and anti-aging research.",
    description: "KLOW80 is an 80mg premium longevity peptide designed for advanced aging research. Targets telomerase activation, mitochondrial biogenesis, and cellular senescence pathways — key areas in the quest to understand and potentially slow biological aging.",
    price: 1260,
    priceRange: rangeFromVariants(klowVariants),
    image: productKlow,
    category: "Longevity",
    tag: "Pre-Order",
    purity: "≥99%",
    storage: "Refrigerate after reconstitution.",
    sku: "RTT-KLW-80",
    compoundClass: "Longevity peptide complex",
    track: "RUO",
    variants: klowVariants,
    benefits: ["Telomerase activation studies", "Mitochondrial biogenesis research", "Cellular senescence pathways", "Biological aging research"],
    whatsIncluded: ["1x 80mg Research vial", "Certificate of Analysis", "Batch certification", "Research protocol"],
    whoItsFor: ["Longevity researchers", "Aging biology labs", "Cellular biology studies"],
    howItWorks: ["Store at recommended temperature", "Reconstitute per protocol", "Follow longevity research design", "Track aging biomarkers"],
    faqs: [
      { question: "Is KLOW80 available immediately?", answer: "KLOW80 is currently available for pre-order. You'll be notified when your batch ships." },
    ],
    inStock: false,
  },
];

export const categories = [
  "All",
  "GLP",
  "Growth Hormone",
  "Healing",
  "Skin & Hair",
  "Longevity",
];

export const tracks: { value: "All" | ProductTrack; label: string; desc: string }[] = [
  { value: "All", label: "All", desc: "Show every product" },
  { value: "RUO", label: "Research (RUO)", desc: "Standard research-use checkout" },
  { value: "GP",  label: "Clinical (GP-led)", desc: "Prescription — quiz → GP → partner pharmacy" },
];

export function getProductsByTrack(track: "All" | ProductTrack): Product[] {
  if (track === "All") return products;
  return products.filter((p) => (p.track ?? "RUO") === track);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "All") return products;
  return products.filter((p) => p.category === category);
}
