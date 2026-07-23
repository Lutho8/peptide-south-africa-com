import productRt3 from "@/assets/vials/rt3.jpg";
import productGhk from "@/assets/vials/ghk.jpg";
import productTesa from "@/assets/vials/tesa.jpg";
import productTz2 from "@/assets/vials/tz2.jpg";
import productMots from "@/assets/vials/mots.jpg";
import productBpc from "@/assets/vials/bpc.jpg";
import productGlow from "@/assets/vials/glow.jpg";
import productKlow from "@/assets/vials/klow.jpg";
import productKpv from "@/assets/vials/kpv.jpg";
import productTha1 from "@/assets/vials/tha1.jpg";
import productAra290 from "@/assets/vials/ara290.jpg";
import productSs31 from "@/assets/vials/ss31.jpg";
import productPinealon from "@/assets/vials/pinealon.jpg";
import productEpitalon from "@/assets/vials/epitalon.jpg";
import productSelank from "@/assets/vials/selank.jpg";
import productSemax from "@/assets/vials/semax.jpg";
import productBacWater from "@/assets/vials/bac-water.jpg";
import productAlcoholSwabs from "@/assets/accessories/alcohol-swabs.jpg";
import productGlassCartridge from "@/assets/accessories/glass-cartridge.jpg";
import productPenNeedles from "@/assets/accessories/pen-needles.jpg";
import productInsulinSyringes from "@/assets/accessories/insulin-syringes.jpg";

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
 * basePrice = ZAR price of a single vial. 3-pack volume discount: -15%.
 * 3-Pack is listed first so it becomes the default on the PDP.
 */
function buildPackVariants(
  basePrice: number,
  mgPerVial: number,
  stocks: { p1?: number; p3?: number } = {},
): Variant[] {
  const round0 = (n: number) => Math.round(n);
  return [
    { label: "3-Pack", price: round0(basePrice * 3 * 0.85), pack: 3, mgPerVial, stock: stocks.p3 ?? 2 },
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
const kpvVariants      = buildPackVariants(1120, 10, { p3: 3 });
const tha1Variants     = buildPackVariants(1500,  5, { p3: 2 });
const ara290Variants   = buildPackVariants(1235, 16, { p3: 3 });
const ss31Variants     = buildPackVariants(1615, 10, { p3: 2 });
const pinealonVariants = buildPackVariants(855,  10, { p3: 3 });
const epitalonVariants = buildPackVariants(855,  10, { p3: 3 });
const selankVariants   = buildPackVariants(740,  10, { p3: 3 });
const semaxVariants    = buildPackVariants(740,  10, { p3: 3 });


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
    inStock: true,
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
    category: "Wellness & Longevity",
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
    inStock: true,
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
    inStock: true,
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
    category: "Wellness & Longevity",
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
    inStock: true,
  },
  {
    id: "9",
    name: "KPV",
    slug: "kpv",
    shortDescription: "α-MSH tripeptide fragment for gut inflammation and mucosal healing research.",
    description: "KPV (Lysine-Proline-Valine) is the C-terminal tripeptide of α-MSH, studied for its anti-inflammatory effects on the gut and skin. Researchers use it to model mucosal healing, IBD pathways, and mast-cell modulation.",
    price: 1120,
    priceRange: rangeFromVariants(kpvVariants),
    image: productKpv,
    category: "Recovery",
    purity: "≥99%",
    storage: "Refrigerate after reconstitution. Lyophilised vial stable 2–8°C.",
    sku: "PSA-KPV-10",
    casNumber: "67247-12-5",
    compoundClass: "α-MSH tripeptide fragment",
    track: "RUO",
    variants: kpvVariants,
    benefits: ["Mucosal inflammation research", "Gut barrier integrity models", "Mast-cell modulation studies", "Topical dermal research"],
    whatsIncluded: ["1× 10mg lyophilised vial", "Certificate of Analysis", "Batch/lot documentation", "Reconstitution guide"],
    whoItsFor: ["GI research labs", "Dermatology researchers", "Inflammation pathway studies"],
    howItWorks: ["Store lyophilised at 2–8°C", "Reconstitute with bacteriostatic water", "Follow institutional research protocol", "Monitor inflammatory markers"],
    faqs: [
      { question: "Is KPV shelf-stable during shipping?", answer: "Yes — lyophilised KPV is stable at ambient temperature for typical courier windows. Refrigerate on arrival." },
    ],
    inStock: true,
    stock: 24,
  },
  {
    id: "10",
    name: "Thymosin Alpha-1",
    slug: "thymosin-alpha-1",
    shortDescription: "28-amino-acid thymic peptide for immune modulation and T-cell research.",
    description: "Thymosin Alpha-1 (Tα1) is a 28-amino-acid peptide originally isolated from the thymus. It is studied for its role in T-cell maturation, innate immune signalling, and adjunctive immunology research protocols.",
    price: 1500,
    priceRange: rangeFromVariants(tha1Variants),
    image: productTha1,
    category: "Recovery",
    purity: "≥99%",
    storage: "Refrigerate after reconstitution.",
    sku: "PSA-THA-5",
    casNumber: "62304-98-7",
    compoundClass: "Thymic peptide (28aa)",
    track: "RUO",
    variants: tha1Variants,
    benefits: ["T-cell maturation studies", "Innate immunity research", "Chronic infection models", "Immuno-oncology adjunct research"],
    whatsIncluded: ["1× 5mg lyophilised vial", "Certificate of Analysis", "Batch/lot documentation", "Reconstitution guide"],
    whoItsFor: ["Immunology labs", "Infectious disease researchers", "Translational research groups"],
    howItWorks: ["Store lyophilised at 2–8°C", "Reconstitute with bacteriostatic water", "Aliquot per protocol", "Track immune biomarkers"],
    faqs: [
      { question: "Why is Tα1 dosed at 5mg per vial?", answer: "Tα1 is potent and typically studied at sub-milligram doses; 5mg per vial matches standard research aliquoting." },
    ],
    inStock: true,
    stock: 18,
  },
  {
    id: "11",
    name: "ARA-290",
    slug: "ara-290",
    shortDescription: "11-amino-acid EPO-derived peptide for neuropathic pain and tissue repair research.",
    description: "ARA-290 (Cibinetide) is an 11-amino-acid peptide derived from the tertiary structure of erythropoietin. It selectively activates the innate repair receptor and is studied in models of neuropathic pain, wound healing, and metabolic inflammation.",
    price: 1235,
    priceRange: rangeFromVariants(ara290Variants),
    image: productAra290,
    category: "Recovery",
    purity: "≥99%",
    storage: "Refrigerate after reconstitution.",
    sku: "PSA-ARA-16",
    casNumber: "1208243-50-8",
    compoundClass: "EPO-derived peptide",
    track: "RUO",
    variants: ara290Variants,
    benefits: ["Neuropathic pain models", "Innate repair receptor research", "Wound healing pathways", "Metabolic inflammation studies"],
    whatsIncluded: ["1× 16mg lyophilised vial", "Certificate of Analysis", "Batch/lot documentation", "Reconstitution guide"],
    whoItsFor: ["Neuroscience labs", "Wound healing researchers", "Metabolic disease studies"],
    howItWorks: ["Store lyophilised at 2–8°C", "Reconstitute per protocol", "Follow institutional research design", "Monitor recovery endpoints"],
    faqs: [
      { question: "Is ARA-290 an EPO analogue?", answer: "It is derived from EPO but does not stimulate erythropoiesis — it targets the innate repair receptor selectively." },
    ],
    inStock: true,
    stock: 15,
  },
  {
    id: "12",
    name: "SS-31 (Elamipretide)",
    slug: "ss-31",
    shortDescription: "Mitochondrial-targeting tetrapeptide for cardiolipin and bioenergetics research.",
    description: "SS-31 (Elamipretide) is a cell-permeable tetrapeptide that binds cardiolipin on the inner mitochondrial membrane. Researchers use it to study mitochondrial bioenergetics, oxidative stress, and age-related cellular decline.",
    price: 1615,
    priceRange: rangeFromVariants(ss31Variants),
    image: productSs31,
    category: "Wellness & Longevity",
    purity: "≥99%",
    storage: "Refrigerate after reconstitution.",
    sku: "PSA-SS31-10",
    casNumber: "736992-21-5",
    compoundClass: "Mitochondria-targeted tetrapeptide",
    track: "RUO",
    variants: ss31Variants,
    benefits: ["Cardiolipin binding studies", "Mitochondrial bioenergetics", "Oxidative stress research", "Age-related cellular decline"],
    whatsIncluded: ["1× 10mg lyophilised vial", "Certificate of Analysis", "Batch/lot documentation", "Reconstitution guide"],
    whoItsFor: ["Mitochondrial biology labs", "Cardiology researchers", "Longevity science groups"],
    howItWorks: ["Store lyophilised at 2–8°C", "Reconstitute with bacteriostatic water", "Aliquot per protocol", "Monitor bioenergetic markers"],
    faqs: [
      { question: "Why the premium price on SS-31?", answer: "Elamipretide synthesis is complex and lower-yield than most peptides, which is reflected in market pricing." },
    ],
    inStock: true,
    stock: 10,
  },
  {
    id: "13",
    name: "Pinealon",
    slug: "pinealon",
    shortDescription: "Short bioregulator tripeptide for neuroprotection and cognitive-aging research.",
    description: "Pinealon is a synthetic tripeptide (Glu-Asp-Arg) from the Khavinson family of short bioregulators. It is studied for neuroprotective effects, cognitive resilience under stress, and pineal-axis regulation in aging models.",
    price: 855,
    priceRange: rangeFromVariants(pinealonVariants),
    image: productPinealon,
    category: "Wellness & Longevity",
    purity: "≥99%",
    storage: "Refrigerate after reconstitution.",
    sku: "PSA-PIN-10",
    casNumber: "1220646-64-1",
    compoundClass: "Short peptide bioregulator",
    track: "RUO",
    variants: pinealonVariants,
    benefits: ["Neuroprotection research", "Cognitive aging models", "Oxidative stress in CNS", "Chronobiology studies"],
    whatsIncluded: ["1× 10mg lyophilised vial", "Certificate of Analysis", "Batch/lot documentation", "Reconstitution guide"],
    whoItsFor: ["Neuroscience labs", "Longevity researchers", "Behavioural neuroscience groups"],
    howItWorks: ["Store lyophilised at 2–8°C", "Reconstitute per protocol", "Follow institutional research design", "Track cognitive endpoints"],
    faqs: [
      { question: "How is Pinealon related to Epitalon?", answer: "Both are Khavinson short peptides; Pinealon targets neural tissue while Epitalon is studied for pineal telomere effects." },
    ],
    inStock: true,
    stock: 20,
  },
  {
    id: "14",
    name: "Epitalon",
    slug: "epitalon",
    shortDescription: "Tetrapeptide bioregulator for telomerase and pineal-axis longevity research.",
    description: "Epitalon (Ala-Glu-Asp-Gly) is a synthetic tetrapeptide developed by V. Khavinson, studied for its influence on telomerase activity, pineal function, and circadian regulation in aging research models.",
    price: 855,
    priceRange: rangeFromVariants(epitalonVariants),
    image: productEpitalon,
    category: "Wellness & Longevity",
    purity: "≥99%",
    storage: "Refrigerate after reconstitution.",
    sku: "PSA-EPI-10",
    casNumber: "307297-39-8",
    compoundClass: "Short peptide bioregulator",
    track: "RUO",
    variants: epitalonVariants,
    benefits: ["Telomerase activity research", "Pineal-axis studies", "Circadian rhythm models", "Biological aging endpoints"],
    whatsIncluded: ["1× 10mg lyophilised vial", "Certificate of Analysis", "Batch/lot documentation", "Reconstitution guide"],
    whoItsFor: ["Longevity researchers", "Chronobiology labs", "Cellular aging studies"],
    howItWorks: ["Store lyophilised at 2–8°C", "Reconstitute per protocol", "Aliquot and freeze if required", "Track aging biomarkers"],
    faqs: [
      { question: "Is Epitalon typically cycled?", answer: "Most published research protocols run short cycles rather than continuous dosing — follow institutional design." },
    ],
    inStock: true,
    stock: 22,
  },
  {
    id: "15",
    name: "Selank",
    slug: "selank",
    shortDescription: "Synthetic tuftsin analogue for anxiolytic and cognitive research models.",
    description: "Selank is a synthetic heptapeptide analogue of the immunomodulator tuftsin, developed at the Russian Academy of Medical Sciences. Researchers study its anxiolytic profile, BDNF modulation, and cognitive performance under stress.",
    price: 740,
    priceRange: rangeFromVariants(selankVariants),
    image: productSelank,
    category: "Wellness & Longevity",
    purity: "≥99%",
    storage: "Refrigerate after reconstitution.",
    sku: "PSA-SLK-10",
    casNumber: "129954-34-3",
    compoundClass: "Tuftsin analogue (heptapeptide)",
    track: "RUO",
    variants: selankVariants,
    benefits: ["Anxiolytic pathway research", "BDNF expression studies", "Cognitive performance models", "Stress-response modulation"],
    whatsIncluded: ["1× 10mg lyophilised vial", "Certificate of Analysis", "Batch/lot documentation", "Reconstitution guide"],
    whoItsFor: ["Behavioural neuroscience labs", "Neuropharmacology researchers", "Cognitive science groups"],
    howItWorks: ["Store lyophilised at 2–8°C", "Reconstitute with bacteriostatic water", "Follow institutional protocol", "Monitor behavioural endpoints"],
    faqs: [
      { question: "Is Selank commonly compared to Semax?", answer: "Yes — both are Russian-developed neuropeptides; Selank leans anxiolytic while Semax leans nootropic/attentional." },
    ],
    inStock: true,
    stock: 26,
  },
  {
    id: "16",
    name: "Semax",
    slug: "semax",
    shortDescription: "Synthetic ACTH(4-10) analogue for nootropic and neuroprotection research.",
    description: "Semax is a synthetic heptapeptide analogue of ACTH(4-10) developed at the Institute of Molecular Genetics, Moscow. It is studied for BDNF/NGF upregulation, cognitive performance, and neuroprotective effects in ischaemia models.",
    price: 740,
    priceRange: rangeFromVariants(semaxVariants),
    image: productSemax,
    category: "Wellness & Longevity",
    purity: "≥99%",
    storage: "Refrigerate after reconstitution.",
    sku: "PSA-SMX-10",
    casNumber: "80714-61-0",
    compoundClass: "ACTH(4-10) analogue",
    track: "RUO",
    variants: semaxVariants,
    benefits: ["Nootropic pathway research", "BDNF/NGF expression studies", "Neuroprotection models", "Attention & focus research"],
    whatsIncluded: ["1× 10mg lyophilised vial", "Certificate of Analysis", "Batch/lot documentation", "Reconstitution guide"],
    whoItsFor: ["Neuroscience labs", "Cognitive research groups", "Translational neurology studies"],
    howItWorks: ["Store lyophilised at 2–8°C", "Reconstitute per protocol", "Follow institutional research design", "Track cognitive endpoints"],
    faqs: [
      { question: "How is Semax typically administered in research?", answer: "Most published protocols use intranasal delivery; institutional design should determine route and dose." },
    ],
    inStock: true,
    stock: 24,
  },
  {
    id: "17",
    name: "BAC Water (Bacteriostatic)",
    slug: "bac-water-bacteriostatic",
    shortDescription: "Sterile 0.9% benzyl-alcohol bacteriostatic water for lyophilised peptide reconstitution.",
    description: "Pharmaceutical-grade bacteriostatic water preserved with 0.9% benzyl alcohol. Used to reconstitute lyophilised research peptides. Sterile-filled, sealed vial, produced under GMP conditions. Research use only.",
    price: 89,
    priceRange: "R89 – R199",
    image: productBacWater,
    category: "BAC Water",
    purity: "USP grade",
    storage: "Store at room temperature, refrigerate after opening. Use within 28 days of first puncture.",
    sku: "PSA-BAC-WATER",
    compoundClass: "Reconstitution diluent",
    track: "RUO",
    variants: [
      { label: "10ml", price: 199, pack: 1, stock: 40 },
      { label: "3ml",  price: 89,  pack: 1, stock: 60 },
    ],
    benefits: ["Sterile 0.9% benzyl-alcohol preserved", "USP-grade water for injection", "Multi-dose vial", "Compatible with all lyophilised peptides"],
    whatsIncluded: ["1× sealed BAC water vial", "Batch/lot documentation"],
    whoItsFor: ["Every peptide reconstitution protocol", "Multi-vial research programmes", "Home-lab researchers"],
    howItWorks: ["Wipe stopper with alcohol swab", "Draw required volume with sterile syringe", "Inject slowly down the side of the peptide vial", "Swirl gently — do not shake"],
    faqs: [
      { question: "Which peptides is this compatible with?", answer: "All lyophilised peptides in our catalog. Use 1–3ml per vial depending on dose calculator." },
      { question: "How long does it last after opening?", answer: "Up to 28 days refrigerated once the stopper has been punctured." },
    ],
    inStock: true,
    stock: 100,
  },
  {
    id: "18",
    name: "Alcohol Prep Swabs (20-pack)",
    slug: "alcohol-swabs-20",
    shortDescription: "Sterile 70% isopropyl alcohol swabs for vial stopper and injection-site preparation.",
    description: "Individually foil-wrapped sterile 70% isopropyl alcohol prep swabs. Essential for aseptic reconstitution and injection preparation. 20 swabs per pack.",
    price: 59,
    image: productAlcoholSwabs,
    category: "Accessories",
    sku: "PSA-ACC-SWAB20",
    track: "RUO",
    benefits: ["Sterile individually wrapped", "70% isopropyl alcohol", "Foil sealed"],
    whatsIncluded: ["20× alcohol prep swabs"],
    whoItsFor: ["Every reconstitution workflow", "Aseptic injection prep"],
    howItWorks: ["Tear open at notch", "Wipe vial stopper", "Discard after single use"],
    faqs: [
      { question: "Do I need these?", answer: "Yes — every reconstitution and injection prep should use a fresh alcohol swab to keep the vial sterile." },
    ],
    inStock: true,
    stock: 200,
  },
  {
    id: "19",
    name: "Sterile Glass Cartridge (3ml)",
    slug: "glass-cartridge-3ml",
    shortDescription: "Empty sterile 3ml glass cartridge with butyl stopper for reconstitution.",
    description: "Type-1 borosilicate glass cartridge, 3ml capacity, pre-sterilised with medical-grade butyl rubber stopper and aluminum crimp cap. For researchers who want to split larger peptide vials into multi-use working cartridges.",
    price: 39,
    image: productGlassCartridge,
    category: "Accessories",
    sku: "PSA-ACC-CART3",
    track: "RUO",
    benefits: ["Type-1 borosilicate glass", "Butyl rubber stopper", "Aluminum crimp cap"],
    whatsIncluded: ["1× sterile 3ml cartridge"],
    whoItsFor: ["Multi-dose reconstitution", "Splitting bulk peptides"],
    howItWorks: ["Wipe stopper", "Transfer reconstituted peptide with sterile syringe", "Refrigerate 2–8°C"],
    faqs: [
      { question: "Is this compatible with peptide pens?", answer: "It fits standard 3ml pen chambers, but always verify against your specific pen model." },
    ],
    inStock: true,
    stock: 80,
  },
  {
    id: "20",
    name: "Peptide Pen Needles (10-pack)",
    slug: "peptide-pen-needles-10",
    shortDescription: "31G × 5mm sterile pen needles compatible with standard peptide pens.",
    description: "Ultra-thin 31-gauge × 5mm pen needles, individually sealed, sterile, single-use. Fits standard universal pen threads. 10 needles per pack.",
    price: 49,
    image: productPenNeedles,
    category: "Accessories",
    sku: "PSA-ACC-PEN10",
    track: "RUO",
    benefits: ["31G × 5mm ultra-thin", "Individually sealed sterile", "Universal pen thread"],
    whatsIncluded: ["10× pen needles"],
    whoItsFor: ["Pen-based reconstitution protocols"],
    howItWorks: ["Twist onto pen", "Prime", "Dispose in sharps container after single use"],
    faqs: [
      { question: "Which pens do these fit?", answer: "Standard universal-thread peptide pens. Check your pen model if unsure." },
    ],
    inStock: true,
    stock: 150,
  },
  {
    id: "21",
    name: "Insulin Syringes 1ml U-100 (5-pack)",
    slug: "insulin-syringes-5",
    shortDescription: "Sterile 1ml U-100 insulin syringes with 29G × 12.7mm fixed needles.",
    description: "Sterile single-use 1ml U-100 insulin syringes with pre-attached 29G × 12.7mm needles. Clear graduated barrel for accurate dose measurement. 5 syringes per pack.",
    price: 59,
    image: productInsulinSyringes,
    category: "Accessories",
    sku: "PSA-ACC-SYR5",
    track: "RUO",
    benefits: ["1ml U-100 graduated", "29G × 12.7mm fixed needle", "Individually blister-packed"],
    whatsIncluded: ["5× insulin syringes"],
    whoItsFor: ["Syringe-based reconstitution", "Small-volume research doses"],
    howItWorks: ["Peel open blister", "Draw dose", "Dispose in sharps container after single use"],
    faqs: [
      { question: "Why U-100?", answer: "U-100 graduations are the research standard for small peptide volumes and match published dosing conversion tables." },
    ],
    inStock: true,
    stock: 120,
  },
];

export const categories = [
  "All",
  "GLP",
  "Growth Hormone",
  "Healing",
  "Recovery",
  "Skin & Hair",
  "Wellness & Longevity",
  "BAC Water",
  "Accessories",
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
