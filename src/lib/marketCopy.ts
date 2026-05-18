import type { Market } from "@/hooks/useMarket";

interface PageCopy {
  title: string;
  description: string;
  h1?: string;
  sub?: string;
}

type Page = "home" | "shop" | "productSuffix";

const COPY: Record<Page, Record<Market, PageCopy>> = {
  home: {
    default: {
      title: "Premium Research Peptides Online | Germany & South Africa",
      description:
        "Buy premium research peptides online in Germany & South Africa. 99%+ HPLC purity, COA on every batch, discreet shipping. Retatrutide, Tirzepatide, BPC-157, GHK-Cu & more.",
      h1: "Premium Research Peptides for Germany & South Africa",
      sub: "99%+ HPLC purity. COA on every batch. Discreet shipping to both markets.",
    },
    de: {
      title: "Forschungspeptide online kaufen | Deutschland | Ride The Tide",
      description:
        "Premium-Forschungspeptide online kaufen in Deutschland. 99%+ HPLC-Reinheit, COA pro Charge, diskreter Versand per DHL. Retatrutid, Tirzepatid, BPC-157, GHK-Cu und mehr.",
      h1: "Premium-Forschungspeptide für Deutschland",
      sub: "99%+ HPLC-Reinheit. Analysenzertifikat pro Charge. Diskreter DHL-Versand, 4–7 Werktage.",
    },
    za: {
      title: "Buy Research Peptides Online | South Africa | Ride The Tide",
      description:
        "Buy premium research peptides online in South Africa. 99%+ HPLC purity, COA on every batch, same-day local courier dispatch. Retatrutide, Tirzepatide, BPC-157, GHK-Cu & more.",
      h1: "Premium Research Peptides for South Africa",
      sub: "99%+ HPLC purity. COA on every batch. Same-day local courier dispatch nationwide.",
    },
  },
  shop: {
    default: {
      title: "Shop Research Peptides | Retatrutide, Tirzepatide, BPC-157",
      description:
        "Browse our full range of HPLC-verified research peptides. Retatrutide, Tirzepatide, BPC-157, TB-500, GHK-Cu, Tesamorelin & blends. Fast shipping to Germany & South Africa.",
      h1: "Shop Research Peptides",
      sub: "HPLC-verified · COA on every batch · Discreet shipping",
    },
    de: {
      title: "Forschungspeptide-Shop | Retatrutid, Tirzepatid, BPC-157",
      description:
        "Unser komplettes Sortiment HPLC-geprüfter Forschungspeptide. Retatrutid, Tirzepatid, BPC-157, TB-500, GHK-Cu, Tesamorelin und Blends. Schneller DHL-Versand in Deutschland.",
      h1: "Forschungspeptide-Shop",
      sub: "HPLC-geprüft · Analysenzertifikat pro Charge · Diskreter DHL-Versand",
    },
    za: {
      title: "Shop Research Peptides | Fast SA Delivery | Ride The Tide",
      description:
        "Browse HPLC-verified research peptides with fast local courier delivery across South Africa. Retatrutide, Tirzepatide, BPC-157, TB-500, GHK-Cu, Tesamorelin & blends.",
      h1: "Shop Research Peptides",
      sub: "HPLC-verified · COA on every batch · Same-day SA dispatch",
    },
  },
  productSuffix: {
    default: { title: "Research Peptide", description: "" },
    de: { title: "Forschungspeptid", description: "" },
    za: { title: "Research Peptide", description: "" },
  },
};

export function pageCopy(page: Page, market: Market): PageCopy {
  return COPY[page][market];
}

/** Section headings used on the product page; German for /de. */
export const PRODUCT_SECTIONS = {
  default: { description: "Description", related: "Related Products" },
  de: { description: "Beschreibung", related: "Ähnliche Produkte" },
  za: { description: "Description", related: "Related Products" },
} as const;
