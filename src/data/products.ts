import productRt3 from "@/assets/vials/rt3.jpg";
import productGhk from "@/assets/vials/ghk-copper-blue.webp";
import productTesa from "@/assets/vials/tesa.jpg";
import productTz2 from "@/assets/vials/tz2.jpg";
import productMots from "@/assets/vials/mots.jpg";
import productBpc from "@/assets/vials/bpc.jpg";
import productGlow from "@/assets/vials/glow.jpg";
import productKlow from "@/assets/vials/klow-copper-blue.webp";
import productKpv from "@/assets/vials/kpv.jpg";
import productTha1 from "@/assets/vials/tha1.jpg";
import productAra290 from "@/assets/vials/ara290.jpg";
import productSs31 from "@/assets/vials/ss31.jpg";
import productPinealon from "@/assets/vials/pinealon.jpg";
import productEpitalon from "@/assets/vials/epitalon.jpg";
import productSelank from "@/assets/vials/selank.jpg";
import productSemax from "@/assets/vials/semax.jpg";
import { catalogPrice, packPrice } from "../../supabase/functions/_shared/pricing";

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
  slug: string,
  mgPerVial: number,
  stocks: { p1?: number; p3?: number } = {},
): Variant[] {
  return [
    { label: "3-Pack", price: packPrice(slug, 3), pack: 3, mgPerVial, stock: stocks.p3 ?? 2 },
    { label: "Single Vial", price: packPrice(slug, 1), pack: 1, mgPerVial, stock: stocks.p1 ?? 6 },
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
  researchReferences?: { label: string; url: string }[];
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
const rt3Variants  = buildPackVariants("rt3-reta", 10, { p1: 0, p3: 0 });
const ghkVariants  = buildPackVariants("ghk-cu-50mg", 50, { p3: 2 });
const tesVariants  = buildPackVariants("tesamorelin", 5, { p1: 0, p3: 0 });
const tz2Variants  = buildPackVariants("tz2-tirz", 5, { p1: 0, p3: 0 });
const motsVariants = buildPackVariants("mots-c", 10, { p3: 2 });
const bpcVariants  = buildPackVariants("bpc-tb500-blend", 10, { p3: 2 });
const glowVariants = buildPackVariants("glow70", 70, { p3: 3 });
const klowVariants = buildPackVariants("klow80", 80, { p3: 2 });
const kpvVariants      = buildPackVariants("kpv", 10, { p3: 3 });
const tha1Variants     = buildPackVariants("thymosin-alpha-1", 5, { p3: 2 });
const ara290Variants   = buildPackVariants("ara-290", 16, { p3: 3 });
const ss31Variants     = buildPackVariants("ss-31", 10, { p3: 2 });
const pinealonVariants = buildPackVariants("pinealon", 10, { p3: 3 });
const epitalonVariants = buildPackVariants("epitalon", 10, { p3: 3 });
const selankVariants   = buildPackVariants("selank", 10, { p3: 3 });
const semaxVariants    = buildPackVariants("semax", 10, { p3: 3 });
export const products: Product[] = [
  {
    id: "1",
    name: "GGG-3",
    slug: "rt3-reta",
    shortDescription: "A three-pathway peptide studied as a coordinated signal for appetite, glucose handling, and energy use.",
    description: "Think of GGG-3 as one research signal speaking to three metabolic switches at once: GLP-1, GIP, and glucagon receptors. Animal and laboratory models use this triple-agonist design to explore how appetite, blood-sugar control, and energy expenditure interact, making the vial a useful way to study the wider metabolic picture rather than one pathway in isolation.",
    price: catalogPrice("rt3-reta"),
    priceRange: rangeFromVariants(rt3Variants),
    image: productRt3,
    category: "GLP",
    tag: "Best Seller",
    purity: "99.060% HPLC",
    storage: "Refrigerate after reconstitution.",
    sku: "RTT-GGG-10",
    casNumber: "2381089-83-2",
    compoundClass: "GLP-1 / GIP / Glucagon triple agonist",
    track: "RUO",
    variants: rt3Variants,
    benefits: ["Targets GLP-1, GIP & glucagon receptors", "Metabolic pathway research", "Insulin resistance studies", "Obesity research applications"],
    whatsIncluded: ["1x Research vial", "Published source lab report", "QR verification link", "Storage instructions"],
    whoItsFor: ["Metabolic disorder researchers", "Obesity research labs", "GLP-1 pathway studies"],
    howItWorks: ["Select your desired MG variant", "Store as directed", "Follow research protocol", "Document findings"],
    faqs: [
      { question: "What purity level is guaranteed?", answer: "≥99% purity — every batch is third-party HPLC tested at Janoshik Analytical. COA is downloadable on every product page." },
      { question: "How should I store this?", answer: "Refrigerate after reconstitution. Store lyophilized powder at -20°C." },
      { question: "Can I view the published report?", answer: "Yes. Janoshik task #61141 is available in the product gallery and public testing archive. It identifies Retatrutide 10mg; its batch is reported as Unknown, so it is not unique-vial authentication." },
    ],
    // Purchasable as a pre-order during the restock window (PREORDER_MODE in src/lib/preorder.ts).
    inStock: true,
    stock: 12,
  },
  {
    id: "2",
    name: "GHK-Cu 50 MG",
    slug: "ghk-cu-50mg",
    shortDescription: "A copper-carrying peptide studied in collagen, skin-remodelling, and repair-signalling models.",
    description: "GHK-Cu pairs a small naturally occurring peptide with copper, a mineral cells use in many repair processes. Laboratory and animal research follows how that partnership influences collagen production, tissue remodelling, and inflammatory signalling—the biological housekeeping behind stronger-looking skin and organised wound repair. Supplied as a 50mg lyophilised powder vial.",
    price: catalogPrice("ghk-cu-50mg"),
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
    shortDescription: "A GHRH analogue studied for growth-hormone signalling and changes in fat distribution.",
    description: "Tesamorelin is designed to echo GHRH, the signal that asks the pituitary gland to release growth hormone. Researchers use it to follow the chain from that signal to downstream IGF-1 and body-composition changes, including how visceral fat behaves. The story is about restoring a timed biological message, not adding growth hormone directly.",
    price: catalogPrice("tesamorelin"),
    priceRange: rangeFromVariants(tesVariants),
    image: productTesa,
    category: "Growth Hormone",
    purity: "98.43–98.59% HPLC",
    storage: "Refrigerate after reconstitution.",
    sku: "RTT-TES-5",
    casNumber: "106612-94-6",
    compoundClass: "GHRH analog",
    track: "RUO",
    variants: tesVariants,
    benefits: ["GH secretion stimulation", "Visceral fat reduction research", "Lipodystrophy studies", "Body composition optimization"],
    whatsIncluded: ["1x Research vial", "Published source lab report", "QR verification link", "Dosing reference"],
    whoItsFor: ["Growth hormone researchers", "Body composition labs", "Endocrinology studies"],
    howItWorks: ["Reconstitute as directed", "Follow GH research protocol", "Track GH biomarkers", "Analyze data"],
    faqs: [
      { question: "What category does Tesamorelin fall under?", answer: "It's classified as a GHRH analog, targeting the growth hormone axis." },
      { question: "Can I view the lab report?", answer: "Yes. Janoshik task #164644 is available in the product gallery and the public testing archive. The report identifies sample TSM10; its batch field is blank, so it should not be treated as unique-vial authentication." },
    ],
    inStock: true,
    stock: 4,
  },
  {
    id: "4",
    name: "TZ-2 (Tirz)",
    slug: "tz2-tirz",
    shortDescription: "A dual GIP/GLP-1 signal studied for appetite, glucose control, and body-weight pathways.",
    description: "TZ-2 brings two familiar meal-response signals—GIP and GLP-1—into one molecule. Research models use that combined message to examine how the brain, gut, and pancreas coordinate fullness and glucose control, and how those changes can influence body weight over time. It is a synthetic peptide powder supplied in a vial for controlled research.",
    price: catalogPrice("tz2-tirz"),
    priceRange: rangeFromVariants(tz2Variants),
    image: productTz2,
    category: "GLP",
    tag: "Pre-Order",
    purity: "99.867–99.899% published report",
    storage: "Refrigerate after reconstitution.",
    sku: "RTT-TZ2-5",
    casNumber: "2023788-19-2",
    compoundClass: "GLP-1 / GIP dual agonist",
    track: "RUO",
    variants: tz2Variants,
    benefits: ["Dual GIP/GLP-1 agonism", "Glucose homeostasis research", "Appetite regulation studies", "Body weight reduction research"],
    whatsIncluded: ["1x Research vial", "Published source lab report", "QR verification link", "Storage instructions"],
    whoItsFor: ["Metabolic researchers", "Diabetes research labs", "Weight management studies"],
    howItWorks: ["Select MG variant", "Store per guidelines", "Implement research protocol", "Track metabolic markers"],
    faqs: [
      { question: "Why is this marked Pre-Order?", answer: "TZ-2 is in high demand. Pre-orders guarantee your allocation from the next certified batch." },
      { question: "What does the published report cover?", answer: "Janoshik task #164662 appears in the product gallery and testing archive. It identifies sample T120 and reports 134.42 mg and 132.84 mg; the submitted sample was 20 mg while the listed product is 5 mg per vial, and its batch is Unknown, so it does not identify a PSA lot." },
    ],
    inStock: true,
  },
  {
    id: "5",
    name: "MOTS-C",
    slug: "mots-c",
    shortDescription: "A mitochondria-derived signal studied for cellular fuel choice, insulin response, and exercise adaptation.",
    description: "MOTS-C comes from the cell's energy-producing mitochondria and acts like a message about fuel availability. Animal and cell studies explore how that message shifts glucose use, fat metabolism, and stress adaptation—especially during exercise or metabolic strain. In simple terms, researchers study how cells decide what fuel to use and how efficiently to use it.",
    price: catalogPrice("mots-c"),
    priceRange: rangeFromVariants(motsVariants),
    image: productMots,
    category: "Wellness & Longevity",
    tag: "Pre-Order",
    purity: "99.098% HPLC",
    storage: "Refrigerate after reconstitution.",
    sku: "RTT-MTC-10",
    casNumber: "1627580-64-6",
    compoundClass: "Mitochondrial-derived peptide",
    track: "RUO",
    variants: motsVariants,
    benefits: ["Metabolic homeostasis research", "Insulin sensitivity studies", "Fatty acid oxidation pathways", "Exercise physiology research"],
    whatsIncluded: ["1x Research vial", "Published source lab report", "QR verification link", "Storage instructions"],
    whoItsFor: ["Longevity researchers", "Metabolic labs", "Exercise science studies"],
    howItWorks: ["Select desired quantity", "Reconstitute per protocol", "Administer per research design", "Monitor metabolic markers"],
    faqs: [
      { question: "What makes MOTS-C unique?", answer: "It's one of the few known mitochondrial-derived peptides with direct metabolic regulatory effects." },
      { question: "Can I view the published report?", answer: "Yes. Janoshik task #83567 is available in the product gallery and public testing archive. It identifies MOTS-C 10mg; its batch is reported as Unknown, so it is not unique-vial authentication." },
    ],
    inStock: true,
  },
  {
    id: "6",
    name: "BPC/TB-500 Blend",
    slug: "bpc-tb500-blend",
    shortDescription: "Lyophilised BPC-157 and TB-500 powder in one vial for connective-tissue repair research.",
    description: "This is a vial of synthetic, lyophilised peptide powder—not a liquid dropper product. BPC-157 became a research favourite because rat injury studies reported better tendon function, stronger repair tissue, more organised collagen, and new blood-vessel growth around damaged areas. TB-500 adds a second line of inquiry around cell movement and tissue organisation. Together, the blend lets researchers explore how blood supply, collagen, and repair cells coordinate after injury. These are animal and laboratory findings, not proof of the same outcome in people.",
    price: catalogPrice("bpc-tb500-blend"),
    priceRange: rangeFromVariants(bpcVariants),
    image: productBpc,
    category: "Healing",
    tag: "Pre-Order",
    purity: "≥99%",
    storage: "Refrigerate after reconstitution.",
    sku: "RTT-BTB-10",
    casNumber: "137525-51-0 / 77591-33-4",
    compoundClass: "BPC-157 + TB-500 healing blend",
    track: "RUO",
    variants: bpcVariants,
    benefits: ["Rat tendon and ligament repair models", "Collagen organisation research", "Injury-linked blood-vessel signalling", "Cell-migration and recovery pathways"],
    whatsIncluded: ["1x 10mg lyophilised synthetic peptide powder vial", "Certificate of Analysis", "Batch certification", "Research handling guide"],
    whoItsFor: ["Tissue repair researchers", "Sports medicine labs", "Regenerative medicine studies"],
    howItWorks: ["Reconstitute the blend", "Follow healing protocol", "Track repair biomarkers", "Document recovery data"],
    faqs: [
      { question: "What did animal studies of BPC-157 observe?", answer: "In rat tendon and ligament injury models, researchers reported improved function, stronger repair tissue, better collagen organisation, and repair-linked blood-vessel growth. Those preclinical findings explain the research interest but do not establish human efficacy." },
      { question: "What form is supplied?", answer: "Lyophilised synthetic peptide powder in a sealed vial—not a premixed liquid or dropper bottle." },
    ],
    researchReferences: [
      { label: "Rat Achilles tendon healing and tendocyte growth (J Orthop Res, 2003)", url: "https://pubmed.ncbi.nlm.nih.gov/14554208/" },
      { label: "Rat ligament healing study (J Orthop Res, 2010)", url: "https://pubmed.ncbi.nlm.nih.gov/20225319/" },
      { label: "Angiogenesis and VEGF signalling study (J Mol Med, 2010)", url: "https://pubmed.ncbi.nlm.nih.gov/20388964/" },
    ],
    inStock: true,
  },
  {
    id: "7",
    name: "GLOW70",
    slug: "glow70",
    shortDescription: "A multi-peptide vial for studying collagen, skin renewal, and barrier-support pathways.",
    description: "GLOW70 brings several skin-research signals into one 70mg vial. Rather than following a single pathway, researchers can examine the broader story of ageing skin: how collagen is rebuilt, how surface cells renew, and how the protective barrier responds to stress. It is supplied as lyophilised powder for controlled laboratory work.",
    price: catalogPrice("glow70"),
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
    shortDescription: "An 80mg research blend for studying cellular ageing, mitochondrial renewal, and senescence pathways.",
    description: "KLOW80 is built around a simple ageing question: what changes when older cells repair less efficiently and their energy systems lose resilience? Research models use the blend to examine mitochondrial renewal, cellular senescence, and telomere-related signalling. It maps mechanisms associated with ageing; it does not establish that ageing can be reversed.",
    price: catalogPrice("klow80"),
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
    shortDescription: "A three-amino-acid α-MSH fragment studied in gut, skin, and inflammatory-signalling models.",
    description: "KPV is only three amino acids long, but researchers use it to ask a large question: can a small fragment of α-MSH help quiet excessive inflammatory signalling? Cell and animal models follow its effects at barrier tissues such as the gut lining and skin, including mucosal-repair and immune-cell pathways. Supplied as a 10mg lyophilised powder vial.",
    price: catalogPrice("kpv"),
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
    shortDescription: "A thymic peptide studied as a coordinator of T-cell and innate immune signalling.",
    description: "Thymosin Alpha-1 takes its cue from the thymus, the organ where T-cells learn their immune roles. Researchers study how this 28-amino-acid signal influences T-cell maturation and the first-line immune response. In plain language, it is used to explore immune coordination—how different defence cells receive and act on the same message.",
    price: catalogPrice("thymosin-alpha-1"),
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
    shortDescription: "An EPO-derived peptide studied for repair-receptor signalling without red-blood-cell stimulation.",
    description: "ARA-290, also called cibinetide, was designed from a small repair-related region of erythropoietin. Its research story focuses on the innate repair receptor rather than red-blood-cell production. Animal, laboratory, and early clinical work examine how that pathway responds to nerve irritation, tissue injury, and metabolic inflammation.",
    price: catalogPrice("ara-290"),
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
    shortDescription: "A mitochondria-targeting peptide studied for membrane stability, energy output, and oxidative stress.",
    description: "SS-31 is a four-amino-acid peptide designed to reach mitochondria and bind cardiolipin, a lipid that helps their inner membrane work properly. Researchers use it like a lens on the cell's power station: does stabilising that membrane change energy production or oxidative stress during injury and ageing? The vial supports that mechanistic research question.",
    price: catalogPrice("ss-31"),
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
    shortDescription: "A synthetic three-amino-acid bioregulator studied in brain ageing and stress-response models.",
    description: "Pinealon is a compact synthetic peptide made from three amino acids. Laboratory and animal studies use it to explore how brain cells handle oxidative stress, ageing-related pressure, and changes in cognitive performance. The idea is less about stimulation and more about understanding cellular resilience when neural tissue is under strain.",
    price: catalogPrice("pinealon"),
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
    shortDescription: "A four-amino-acid bioregulator studied in telomere, pineal, and circadian ageing research.",
    description: "Epitalon is a synthetic four-amino-acid peptide developed for ageing research. Studies follow its relationship with telomerase activity, pineal signalling, and circadian rhythms—the cellular clockwork linking chromosome maintenance with sleep-wake timing. It is a tool for investigating those mechanisms, not evidence of extended lifespan in people.",
    price: catalogPrice("epitalon"),
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
    shortDescription: "A synthetic tuftsin analogue studied in stress, learning, and neurochemical-signalling models.",
    description: "Selank is a seven-amino-acid analogue of tuftsin, a naturally occurring immune peptide. Researchers use animal and laboratory models to explore the conversation between stress responses, learning, and brain-signalling molecules such as BDNF. In everyday terms, the research asks how the brain stays adaptable when stress makes clear thinking harder.",
    price: catalogPrice("selank"),
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
    shortDescription: "A synthetic ACTH fragment analogue studied in learning, growth-factor, and brain-injury models.",
    description: "Semax is a seven-amino-acid analogue inspired by a fragment of ACTH. Animal and laboratory research examines how it changes signals linked with BDNF and NGF, two growth factors involved in neural adaptation, and how brain tissue responds in ischaemia models. The research story is about resilience and recovery signalling, not a guaranteed cognitive boost.",
    price: catalogPrice("semax"),
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
];

export const categories = [
  "All",
  "GLP",
  "Growth Hormone",
  "Healing",
  "Recovery",
  "Skin & Hair",
  "Wellness & Longevity",
];

export const tracks: { value: "All" | ProductTrack; label: string; desc: string }[] = [
  { value: "All", label: "All", desc: "Show every product" },
  { value: "RUO", label: "Research (RUO)", desc: "Standard research-use checkout" },
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
