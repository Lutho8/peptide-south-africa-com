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
    title: "Peptide South Africa — Personalised Peptide Telehealth",
    description:
      "South Africa's first peptide-forward telehealth platform. Get your personalised peptide program for weight loss, longevity, recovery, energy and performance in under 3 minutes.",
    h1: "Get Your Personalised Health Plan in 1 Minute",
    sub: "Complete a quick assessment and discover the peptides designed for your goals.",
  },
  shop: {
    title: "Programs | Peptide South Africa",
    description:
      "Browse personalised peptide programs — weight loss, recovery, longevity, energy and performance. GP-led, lab-tested, delivered across South Africa.",
    h1: "Programs",
    sub: "GP-led peptide programs · Lab-tested · Delivered nationwide",
  },

  productSuffix: { title: "Peptide Program", description: "" },
};

export function pageCopy(page: Page, _market?: Market): PageCopy {
  return COPY[page];
}

export const PRODUCT_SECTIONS = {
  default: { description: "Description", related: "Related Programs" },
  de: { description: "Description", related: "Related Programs" },
  za: { description: "Description", related: "Related Programs" },
} as const;
