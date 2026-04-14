const SITE_URL = "https://tide-shop-clone.lovable.app";
const SITE_NAME = "Ride The Tide";

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  description:
    "Ride The Tide provides GP-led, personalized peptide protocols with German-certified compounds for fat loss, healing, and performance — serving South Africa.",
  areaServed: {
    "@type": "Country",
    name: "South Africa",
  },
  knowsAbout: [
    "Peptide therapy",
    "Fat loss protocols",
    "Retatrutide",
    "BPC-157",
    "Tesamorelin",
    "GLP-1 receptor agonists",
    "Growth hormone releasing peptides",
    "Personalized health protocols",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Peptide Protocols & Research Compounds",
    itemListElement: [
      {
        "@type": "OfferCatalog",
        name: "Fat Loss Protocols",
        description: "Personalized peptide protocols for targeted fat reduction using GLP-1 agonists.",
      },
      {
        "@type": "OfferCatalog",
        name: "Healing & Recovery",
        description: "BPC-157 and tissue repair peptides for accelerated recovery.",
      },
      {
        "@type": "OfferCatalog",
        name: "Growth Hormone",
        description: "Tesamorelin and GHRH analogs for body composition research.",
      },
    ],
  },
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  publisher: { "@id": `${SITE_URL}/#organization` },
  description: "Personalized peptide protocols with German-certified compounds. GP-led fat loss, healing, and performance programs in South Africa.",
};

export function productSchema(product: {
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  category: string;
  purity?: string;
  inStock: boolean;
  sku?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    url: `${SITE_URL}/product/${product.slug}`,
    sku: product.sku || product.slug,
    brand: { "@type": "Brand", name: SITE_NAME },
    category: product.category,
    ...(product.purity ? { additionalProperty: { "@type": "PropertyValue", name: "Purity", value: product.purity } } : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: "ZAR",
      price: product.price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/PreOrder",
      seller: { "@id": `${SITE_URL}/#organization` },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "47",
    },
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

/** Entity relationship clusters for internal linking */
export const entityClusters = {
  fatLoss: {
    title: "Fat Loss & Metabolic Health",
    links: [
      { label: "Fat Loss Protocol", href: "/fat-loss-protocol", description: "Our structured fat loss program using GLP-1 agonists and metabolic peptides." },
      { label: "RT3 (Retatrutide)", href: "/product/rt3-reta", description: "Triple agonist targeting GLP-1, GIP, and glucagon receptors." },
      { label: "TZ-2 (Tirzepatide)", href: "/product/tz2-tirz", description: "Dual GIP/GLP-1 receptor agonist for metabolic research." },
      { label: "Take the Quiz", href: "/quiz", description: "Get a personalized protocol recommendation based on your goals." },
    ],
  },
  healing: {
    title: "Healing & Recovery",
    links: [
      { label: "BPC-157", href: "/product/bpc-157", description: "Body Protection Compound for tissue repair and gut healing research." },
      { label: "GHK-Cu", href: "/product/ghk-cu-50mg", description: "Copper peptide for wound healing and collagen synthesis." },
      { label: "Research Hub", href: "/research", description: "Access 500+ citations and clinical data on healing peptides." },
    ],
  },
  growthHormone: {
    title: "Growth Hormone & Performance",
    links: [
      { label: "Tesamorelin", href: "/product/tesamorelin", description: "GHRH analog for growth hormone secretion studies." },
      { label: "MOTS-C", href: "/product/mots-c", description: "Mitochondrial peptide for metabolic and exercise research." },
      { label: "About Our Protocols", href: "/about", description: "Learn about our evidence-based, GP-led approach." },
    ],
  },
  trust: {
    title: "Trust & Transparency",
    links: [
      { label: "About Us", href: "/about", description: "Our mission, team, and German-certified quality standards." },
      { label: "FAQ", href: "/faq", description: "Common questions about peptides, shipping, and protocols." },
      { label: "Research Hub", href: "/research", description: "Evidence-based research tools and peptide database." },
      { label: "Shipping Policy", href: "/shipping", description: "Fast delivery across South Africa with tracking." },
    ],
  },
};
