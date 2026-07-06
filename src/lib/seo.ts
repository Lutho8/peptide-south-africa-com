const SITE_URL = "https://www.peptide-south-africa.com";
const SITE_NAME = "Peptide South Africa";

import { businessInfo, postalAddressSchema, PUBLISH_NAP } from "@/data/businessInfo";

/** LocalBusiness + MedicalBusiness schema — Cape Town, South Africa. */
export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "additionalType": ["https://schema.org/OnlineStore", "https://schema.org/LocalBusiness"],
  "@id": `${SITE_URL}/#localbusiness`,
  name: businessInfo.legalName,
  url: SITE_URL,
  image: "https://peptide-south-africa.com/apple-touch-icon.png",
  priceRange: "R500 - R4000",
  currenciesAccepted: "ZAR",
  paymentAccepted: "Visa, Mastercard, Instant EFT, Capitec Pay, SnapScan, Zapper, Mobicred, Masterpass",
  description:
    "GP-led, lab-tested peptide protocols for fat loss, healing, and performance. Same-day dispatch from Cape Town across South Africa.",
  ...(PUBLISH_NAP && businessInfo.telephone && !businessInfo.telephone.startsWith("FILL")
    ? { telephone: businessInfo.telephone }
    : {}),
  ...(businessInfo.email ? { email: businessInfo.email } : {}),
  address: postalAddressSchema(),
  geo: {
    "@type": "GeoCoordinates",
    latitude: businessInfo.geo.latitude,
    longitude: businessInfo.geo.longitude,
  },
  areaServed: [{ "@type": "Country", name: "South Africa" }],
  medicalSpecialty: [
    { "@type": "MedicalSpecialty", name: "Endocrinology" },
    { "@type": "MedicalSpecialty", name: "Sports medicine" },
  ],
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
    "Peptide South Africa provides GP-led, personalized peptide protocols and lab-tested research compounds for fat loss, healing, and performance — based in Cape Town, South Africa.",
  areaServed: [{ "@type": "Country", name: "South Africa" }],
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
  inLanguage: "en-ZA",
  publisher: { "@id": `${SITE_URL}/#organization` },
  description:
    "GP-led, lab-tested peptide protocols and research compounds for fat loss, healing and performance — Cape Town, South Africa.",
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
  variants?: { label: string; price: number; pack?: number }[];
}) {
  // Prices are ZAR. The store sells packs; the lowest sellable price is the
  // 3-Pack, so that (not the single-vial anchor) is the schema's headline price.
  const purchasable = (product.variants ?? []).filter((v) => (v.pack ?? 1) > 1);
  const packPrices = purchasable.map((v) => v.price);
  const lowPrice = packPrices.length ? Math.min(...packPrices) : Math.round(product.price);
  const highPrice = packPrices.length ? Math.max(...packPrices) : Math.round(product.price);
  const validUntil = `${new Date().getFullYear() + 1}-12-31`;

  const returnPolicy = {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "ZA",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 14,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/FreeReturn",
  };
  const shipping = {
    "@type": "OfferShippingDetails",
    shippingRate: { "@type": "MonetaryAmount", value: "89", currency: "ZAR" },
    shippingDestination: { "@type": "DefinedRegion", addressCountry: "ZA" },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
      transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" },
    },
  };

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
    ...(product.purity
      ? { additionalProperty: { "@type": "PropertyValue", name: "Purity", value: product.purity } }
      : {}),
    offers: purchasable.length > 1
      ? {
          "@type": "AggregateOffer",
          priceCurrency: "ZAR",
          lowPrice,
          highPrice,
          offerCount: purchasable.length,
          availability: product.inStock
            ? "https://schema.org/InStock"
            : "https://schema.org/PreOrder",
          seller: { "@id": `${SITE_URL}/#organization` },
        }
      : {
          "@type": "Offer",
          url: `${SITE_URL}/product/${product.slug}`,
          priceCurrency: "ZAR",
          price: lowPrice,
          priceValidUntil: validUntil,
          itemCondition: "https://schema.org/NewCondition",
          availability: product.inStock
            ? "https://schema.org/InStock"
            : "https://schema.org/PreOrder",
          areaServed: { "@type": "Country", name: "ZA" },
          seller: { "@id": `${SITE_URL}/#organization` },
          hasMerchantReturnPolicy: returnPolicy,
          shippingDetails: shipping,
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
      { label: "About Us", href: "/about", description: "Our mission, team, and pharmaceutical-grade sourcing standards." },
      { label: "FAQ", href: "/faq", description: "Common questions about peptides, shipping, and protocols." },
      { label: "Research Hub", href: "/research", description: "Evidence-based research tools and peptide database." },
      { label: "Shipping Policy", href: "/shipping", description: "Same-day dispatch from Cape Town across South Africa." },
    ],
  },
};
