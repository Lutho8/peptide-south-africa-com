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
      "99%+ HPLC-verified research peptides — Retatrutide, Tirzepatide, BPC-157, GHK-Cu. COA on every batch, same-day Cape Town courier.",
    h1: "Premium Research Peptides — Cape Town, South Africa",
    sub: "99%+ HPLC purity. COA on every batch. Same-day local courier dispatch nationwide.",
  },
  shop: {
    title: "Shop Research Peptides | Fast SA Delivery | Peptide South Africa",
    description:
      "HPLC-verified research peptides with same-day SA courier. Retatrutide, Tirzepatide, BPC-157, TB-500, GHK-Cu, Tesamorelin & blends.",
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
