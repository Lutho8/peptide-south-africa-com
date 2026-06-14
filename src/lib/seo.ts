const SITE_URL = "https://peptide-south-africa.com";
const SITE_NAME = "Peptide South Africa";

/** LocalBusiness + MedicalBusiness schema — South Africa telehealth. */
export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["MedicalBusiness", "OnlineStore", "LocalBusiness"],
  "@id": `${SITE_URL}/#localbusiness`,
  name: SITE_NAME,
  url: SITE_URL,
  image: `${SITE_URL}/favicon.png`,
  priceRange: "R1,500 – R6,000",
  currenciesAccepted: "ZAR",
  paymentAccepted: "Visa, Mastercard, Instant EFT, Capitec Pay, SnapScan, Zapper, Mobicred, Masterpass",
  description:
    "South Africa's first peptide-forward telehealth platform. GP-led personalised peptide programs for weight loss, longevity, recovery, energy and performance.",
  address: {
    "@type": "PostalAddress",
    addressCountry: "ZA",
    addressRegion: "Western Cape",
    addressLocality: "Cape Town",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -33.9249,
    longitude: 18.4241,
  },
  areaServed: [{ "@type": "Country", name: "South Africa" }],
  medicalSpecialty: ["Endocrinology", "WeightLoss", "SportsMedicine", "Longevity"],
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "08:00",
    closes: "17:00",
  },
};

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  description:
    "Peptide South Africa is South Africa's first peptide-forward telehealth platform — personalised, GP-led peptide programs for weight loss, longevity, recovery, energy and performance.",
  areaServed: [{ "@type": "Country", name: "South Africa" }],
  knowsAbout: [
    "Peptide therapy",
    "GLP-1 receptor agonists",
    "Retatrutide",
    "Tirzepatide",
    "BPC-157",
    "Tesamorelin",
    "Longevity protocols",
    "Personalised telehealth",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Peptide Programs",
    itemListElement: [
      { "@type": "OfferCatalog", name: "Weight Loss", description: "Personalised GLP-1 program for sustainable weight loss." },
      { "@type": "OfferCatalog", name: "Recovery", description: "Tissue repair and recovery peptide programs." },
      { "@type": "OfferCatalog", name: "Longevity", description: "Mitochondrial and longevity peptide programs." },
    ],
  },
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "en-ZA",
  publisher: { "@id": `${SITE_URL}/#organization` },
  description:
    "South Africa's first peptide-forward telehealth platform — personalised peptide programs for weight loss, longevity, recovery, energy and performance.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
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
      url: `${SITE_URL}/product/${product.slug}`,
      priceCurrency: "ZAR",
      price: Math.round(product.price),
      priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
      itemCondition: "https://schema.org/NewCondition",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/PreOrder",
      seller: { "@id": `${SITE_URL}/#organization` },
      shippingDetails: [
        {
          "@type": "OfferShippingDetails",
          shippingRate: { "@type": "MonetaryAmount", value: "89", currency: "ZAR" },
          shippingDestination: { "@type": "DefinedRegion", addressCountry: "ZA" },
        },
      ],
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
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/** Entity relationship clusters for internal linking */
export const entityClusters = {
  fatLoss: {
    title: "Weight Loss & Metabolic Health",
    links: [
      { label: "Weight Loss Program", href: "/fat-loss-protocol", description: "Personalised GLP-1 program with clinical oversight." },
      { label: "RT3 (Retatrutide)", href: "/product/rt3-reta", description: "Triple agonist targeting GLP-1, GIP, and glucagon receptors." },
      { label: "TZ-2 (Tirzepatide)", href: "/product/tz2-tirz", description: "Dual GIP/GLP-1 receptor agonist." },
      { label: "Take the Assessment", href: "/assessment", description: "Get your personalised peptide program in under 3 minutes." },
    ],
  },
  healing: {
    title: "Recovery",
    links: [
      { label: "BPC-157", href: "/product/bpc-157", description: "Tissue repair and gut healing." },
      { label: "GHK-Cu", href: "/product/ghk-cu-50mg", description: "Wound healing and collagen synthesis." },
      { label: "Research Hub", href: "/research", description: "Clinical data on recovery peptides." },
    ],
  },
  growthHormone: {
    title: "Performance & Longevity",
    links: [
      { label: "Tesamorelin", href: "/product/tesamorelin", description: "GHRH analog for body composition." },
      { label: "MOTS-C", href: "/product/mots-c", description: "Mitochondrial peptide for performance." },
      { label: "How It Works", href: "/#how-it-works", description: "Our GP-led telehealth process." },
    ],
  },
  trust: {
    title: "Trust & Transparency",
    links: [
      { label: "About Us", href: "/about", description: "Mission, team, and pharmaceutical-grade sourcing." },
      { label: "FAQ", href: "/faq", description: "Common questions about programs, clinical review and shipping." },
      { label: "Research Hub", href: "/research", description: "Evidence-based research tools." },
      { label: "Shipping Policy", href: "/shipping", description: "Same-day dispatch across South Africa." },
    ],
  },
};
