import type { Market } from "@/hooks/useMarket";

interface PageCopy {
  title: string;
  description: string;
  h1?: string;
  sub?: string;
}

type Page = "home" | "shop" | "productSuffix";

const COPY: Record<Page, PageCopy> = {
  home: {
    title: "Research Peptides Cape Town | Peptide South Africa",
    description:
      "Research-use peptides with published analytical reports and clear source or lot scope where available. Local fulfilment from Cape Town across South Africa.",
    h1: "Premium Research Peptides — Cape Town, South Africa",
    sub: "Research-use only. Published reports where available. Local courier delivery across South Africa.",
  },
  shop: {
    title: "Shop Research Peptides | Fast SA Delivery | Peptide South Africa",
    description:
      "Browse research-use peptides with compound details, storage guidance and published analytical reports where available. Delivery across South Africa.",
    h1: "Shop Research Peptides",
    sub: "Research-use only · Report scope shown · Delivery across South Africa",
  },

  productSuffix: { title: "Research Peptide", description: "" },
};

export function pageCopy(page: Page, _market?: Market): PageCopy {
  return COPY[page];
}

export const PRODUCT_SECTIONS = {
  default: { description: "Description", related: "Related Products" },
  de: { description: "Description", related: "Related Products" },
  za: { description: "Description", related: "Related Products" },
} as const;
