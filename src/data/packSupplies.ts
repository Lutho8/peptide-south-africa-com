import type { Product } from "@/data/products";
import { BAC_SLUG, BAC_NOTICE, LIVE_CATALOG } from "../../supabase/functions/_shared/catalog-release";
import { PACK_SUPPLY_SLUGS, type PackSupplySlug } from "../../supabase/functions/_shared/pricing";
const listing = LIVE_CATALOG[BAC_SLUG];
export const packSupplies: Record<PackSupplySlug, Product> = {
  [BAC_SLUG]: {
    id: "pack-supply-bac-water", name: listing.name, slug: BAC_SLUG,
    sku: listing.sku, strength: listing.strength, price: listing.price,
    image: "/products/bac-water-10ml.webp", category: "Supplies", track: "RUO", inStock: true,
    shortDescription: "Optional BAC water 10 ml, sold separately at R210 per vial.",
    description: BAC_NOTICE, benefits: [], whatsIncluded: ["1 sealed 10 ml BAC water vial"],
    whoItsFor: [], howItWorks: [], faqs: [{ question: "Is BAC water included in a peptide pack?", answer: BAC_NOTICE }],
  },
};
export { PACK_SUPPLY_SLUGS };
