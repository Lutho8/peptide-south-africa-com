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
    title: "Premium Research Peptides | Cape Town, South Africa",
    description:
      "Buy premium research peptides in Cape Town, South Africa. 99%+ HPLC purity, COA on every batch, same-day local courier dispatch. Retatrutide, Tirzepatide, BPC-157, GHK-Cu & more.",
    h1: "Premium Research Peptides — Cape Town, South Africa",
    sub: "99%+ HPLC purity. COA on every batch. Same-day local courier dispatch nationwide.",
  },
  shop: {
    title: "Shop Research Peptides | Fast SA Delivery | Ride The Tide",
    description:
      "Browse HPLC-verified research peptides with fast local courier delivery across South Africa. Retatrutide, Tirzepatide, BPC-157, TB-500, GHK-Cu, Tesamorelin & blends.",
    h1: "Shop Research Peptides",
    sub: "HPLC-verified · COA on every batch · Same-day SA dispatch",
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
