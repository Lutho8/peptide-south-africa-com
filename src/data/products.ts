import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";
import product7 from "@/assets/product-7.jpg";
import product8 from "@/assets/product-8.jpg";

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number;
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
}

export const products: Product[] = [
  {
    id: "1",
    name: "Fat Loss Kit",
    slug: "fat-loss-kit",
    shortDescription: "Targeted support for sustainable fat loss and metabolic optimization.",
    description: "Our Fat Loss Kit combines the most effective research-backed peptides for accelerated fat metabolism, appetite regulation, and lean body composition. Designed for researchers focused on GLP-1 pathways and metabolic enhancement.",
    price: 1599,
    image: product1,
    category: "Weight Loss",
    tag: "Best Seller",
    benefits: ["Accelerated fat metabolism", "Appetite regulation support", "Lean muscle preservation", "Metabolic rate optimization"],
    whatsIncluded: ["2x Research vials", "Dosing guide", "Research protocol", "Certificate of Analysis"],
    whoItsFor: ["Researchers studying GLP-1 pathways", "Body composition optimization", "Metabolic health studies"],
    howItWorks: ["Select your research goal", "Follow the included protocol", "Track your findings", "Adjust based on data"],
    faqs: [
      { question: "How long does a kit last?", answer: "Each kit provides approximately 30 days of research material at standard dosing protocols." },
      { question: "Is this lab tested?", answer: "Yes, every batch comes with a Certificate of Analysis confirming 99%+ purity." },
    ],
    inStock: true,
  },
  {
    id: "2",
    name: "Growth Hormone Bundle",
    slug: "growth-hormone-bundle",
    shortDescription: "Premium GH secretagogue blend for growth hormone research.",
    description: "A comprehensive bundle featuring top-tier growth hormone secretagogues. Ideal for researchers exploring Ipamorelin, CJC-1295, and synergistic GH-releasing peptide combinations.",
    price: 2299,
    image: product2,
    category: "Growth Hormone",
    tag: "Popular",
    benefits: ["Enhanced GH secretion research", "Synergistic peptide combinations", "Deep sleep support studies", "Recovery optimization"],
    whatsIncluded: ["3x Research vials", "Stacking guide", "Research protocol", "Certificate of Analysis"],
    whoItsFor: ["Growth hormone researchers", "Recovery and regeneration studies", "Anti-aging research"],
    howItWorks: ["Review the stacking guide", "Prepare research materials", "Follow timed protocols", "Record observations"],
    faqs: [
      { question: "Can these be stacked?", answer: "Yes, the bundle is designed for synergistic use. See the included stacking guide." },
      { question: "What purity level?", answer: "All peptides are independently verified at 99%+ purity." },
    ],
    inStock: true,
  },
  {
    id: "3",
    name: "Healing & Recovery Guide",
    slug: "healing-recovery-guide",
    shortDescription: "BPC-157 and TB-500 combination for tissue repair research.",
    description: "The ultimate healing stack featuring BPC-157 and TB-500 — two of the most studied peptides for tissue repair, angiogenesis, and accelerated recovery in preclinical models.",
    price: 1349,
    image: product3,
    category: "Healing",
    benefits: ["Tissue repair acceleration", "Angiogenesis promotion", "Anti-inflammatory pathways", "Joint and tendon support"],
    whatsIncluded: ["2x Research vials", "Healing protocol", "Dosing calculator access", "Certificate of Analysis"],
    whoItsFor: ["Tissue repair researchers", "Sports medicine studies", "Regenerative medicine"],
    howItWorks: ["Identify target tissue", "Follow repair protocol", "Monitor healing markers", "Document results"],
    faqs: [
      { question: "How quickly do researchers see results?", answer: "Most research protocols show observable changes within 2-4 weeks." },
    ],
    inStock: true,
  },
  {
    id: "4",
    name: "Lean Muscle Growth Kit",
    slug: "lean-muscle-growth-kit",
    shortDescription: "Optimized peptide stack for lean mass and strength research.",
    description: "Engineered for researchers studying muscle protein synthesis, IGF-1 pathways, and lean tissue development. This kit provides everything needed for comprehensive anabolic research.",
    price: 110,
    priceRange: "$110 – $195",
    image: product4,
    category: "Growth Hormone",
    tag: "New",
    benefits: ["Muscle protein synthesis support", "IGF-1 pathway activation", "Strength and endurance studies", "Body recomposition research"],
    whatsIncluded: ["3x Research vials", "Muscle growth protocol", "Nutrition guide", "Certificate of Analysis"],
    whoItsFor: ["Muscle biology researchers", "Strength and performance labs", "Body composition studies"],
    howItWorks: ["Assess baseline metrics", "Implement protocol", "Progressive tracking", "Optimize variables"],
    faqs: [
      { question: "Are there different sizes?", answer: "Yes, this kit comes in Standard (30-day) and Extended (60-day) research options." },
    ],
    inStock: true,
  },
  {
    id: "5",
    name: "Skin Health Blend",
    slug: "skin-health-blend",
    shortDescription: "GHK-Cu based formula for skin rejuvenation and collagen research.",
    description: "Featuring GHK-Cu and supporting peptides, this blend targets collagen synthesis, skin elasticity, and cellular renewal pathways. Backed by extensive dermatological research.",
    price: 65,
    image: product5,
    category: "Skin & Hair",
    benefits: ["Collagen synthesis stimulation", "Skin elasticity improvement", "Cellular renewal support", "Antioxidant pathway activation"],
    whatsIncluded: ["2x Research vials", "Skin protocol", "Application guide", "Certificate of Analysis"],
    whoItsFor: ["Dermatological researchers", "Anti-aging skin studies", "Cosmetic peptide research"],
    howItWorks: ["Prepare research solution", "Apply per protocol", "Track skin biomarkers", "Evaluate over 8 weeks"],
    faqs: [
      { question: "Is this for topical or injectable research?", answer: "This blend is designed for injectable research protocols. See guide for details." },
    ],
    inStock: true,
  },
  {
    id: "6",
    name: "Longevity Research Kit",
    slug: "longevity-research-kit",
    shortDescription: "Epitalon and MOTS-C for telomere and mitochondrial research.",
    description: "Explore the cutting edge of longevity science with Epitalon and MOTS-C. Study telomerase activation, mitochondrial function, and cellular aging pathways.",
    price: 145,
    image: product6,
    category: "Longevity",
    tag: "Premium",
    benefits: ["Telomerase activation studies", "Mitochondrial function research", "Cellular aging pathways", "NAD+ pathway support"],
    whatsIncluded: ["2x Research vials", "Longevity protocol", "Research journal template", "Certificate of Analysis"],
    whoItsFor: ["Longevity researchers", "Aging biology labs", "Mitochondrial function studies"],
    howItWorks: ["Baseline biomarker assessment", "Protocol implementation", "Longitudinal tracking", "Data analysis"],
    faqs: [
      { question: "How long is a typical longevity research cycle?", answer: "Most protocols recommend 3-6 month research cycles for meaningful data." },
    ],
    inStock: true,
  },
  {
    id: "7",
    name: "Cognitive Enhancement Guide",
    slug: "cognitive-enhancement-guide",
    shortDescription: "Semax and Selank for nootropic and neuroprotection research.",
    description: "A comprehensive nootropic research package featuring Semax and Selank — two well-studied neuropeptides for cognitive enhancement, focus, and neuroprotection research.",
    price: 85,
    image: product7,
    category: "Cognitive",
    benefits: ["Cognitive function studies", "Neuroprotection research", "Focus and memory pathways", "BDNF expression studies"],
    whatsIncluded: ["2x Research vials (nasal)", "Cognitive protocol", "Assessment tools", "Certificate of Analysis"],
    whoItsFor: ["Neuroscience researchers", "Cognitive enhancement studies", "Neuroprotection labs"],
    howItWorks: ["Cognitive baseline testing", "Nasal administration protocol", "Periodic assessments", "Compare to baseline"],
    faqs: [
      { question: "What's the difference between Semax and Selank?", answer: "Semax focuses on cognitive enhancement while Selank targets anxiolytic and mood pathways." },
    ],
    inStock: true,
  },
  {
    id: "8",
    name: "Immune Support Bundle",
    slug: "immune-support-bundle",
    shortDescription: "Thymosin Alpha-1 based immune modulation research kit.",
    description: "Built around Thymosin Alpha-1, this bundle supports immune system research including T-cell modulation, innate immunity pathways, and immune resilience studies.",
    price: 95,
    image: product8,
    category: "Immune",
    benefits: ["T-cell modulation research", "Innate immunity pathways", "Immune resilience studies", "Cytokine balance research"],
    whatsIncluded: ["2x Research vials", "Immune protocol", "Biomarker tracking sheet", "Certificate of Analysis"],
    whoItsFor: ["Immunology researchers", "Autoimmune studies", "General immune health research"],
    howItWorks: ["Immune panel baseline", "Protocol administration", "Track immune markers", "Analyze response data"],
    faqs: [
      { question: "Can this be combined with other kits?", answer: "Yes, Thymosin Alpha-1 is commonly studied alongside healing and longevity peptides." },
    ],
    inStock: true,
  },
];

export const categories = [
  "All",
  "Weight Loss",
  "Growth Hormone",
  "Healing",
  "Skin & Hair",
  "Longevity",
  "Cognitive",
  "Immune",
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "All") return products;
  return products.filter((p) => p.category === category);
}
