import type { Product } from "@/data/products";
import bacWater from "@/assets/vials/bac-water.jpg";
import alcoholSwabs from "@/assets/accessories/alcohol-swabs.jpg";
import glassCartridge from "@/assets/accessories/glass-cartridge.jpg";
import penNeedles from "@/assets/accessories/pen-needles.jpg";
import insulinSyringes from "@/assets/accessories/insulin-syringes.jpg";
import { catalogPrice, PACK_SUPPLY_SLUGS, type PackSupplySlug } from "../../supabase/functions/_shared/pricing";

/**
 * Checkout-only fulfilment supplies. Keep these out of `products`: that is the
 * public catalogue source used by shop filters, product routes, and sitemaps.
 */
export const packSupplies: Record<PackSupplySlug, Product> = {
  "bac-water-bacteriostatic": {
    id: "pack-supply-bac-water", name: "BAC Water (Bacteriostatic)", slug: "bac-water-bacteriostatic",
    shortDescription: "Checkout-only pack supply.", description: "Available only with a qualifying peptide pack.",
    price: catalogPrice("bac-water-bacteriostatic"), image: bacWater, category: "Pack supplies", track: "RUO",
    benefits: [], whatsIncluded: ["1× sealed BAC water vial"], whoItsFor: [], howItWorks: [], faqs: [], inStock: true,
  },
  "alcohol-swabs-20": {
    id: "pack-supply-alcohol-swabs", name: "Alcohol Prep Swabs (20-pack)", slug: "alcohol-swabs-20",
    shortDescription: "Checkout-only pack supply.", description: "Available only with a qualifying peptide pack.",
    price: catalogPrice("alcohol-swabs-20"), image: alcoholSwabs, category: "Pack supplies", track: "RUO",
    benefits: [], whatsIncluded: ["20× alcohol prep swabs"], whoItsFor: [], howItWorks: [], faqs: [], inStock: true,
  },
  "glass-cartridge-3ml": {
    id: "pack-supply-glass-cartridge", name: "Sterile Glass Cartridge (3ml)", slug: "glass-cartridge-3ml",
    shortDescription: "Checkout-only pack supply.", description: "Available only with a qualifying peptide pack.",
    price: catalogPrice("glass-cartridge-3ml"), image: glassCartridge, category: "Pack supplies", track: "RUO",
    benefits: [], whatsIncluded: ["1× sterile 3ml cartridge"], whoItsFor: [], howItWorks: [], faqs: [], inStock: true,
  },
  "peptide-pen-needles-10": {
    id: "pack-supply-pen-needles", name: "Peptide Pen Needles (10-pack)", slug: "peptide-pen-needles-10",
    shortDescription: "Checkout-only pack supply.", description: "Available only with a qualifying peptide pack.",
    price: catalogPrice("peptide-pen-needles-10"), image: penNeedles, category: "Pack supplies", track: "RUO",
    benefits: [], whatsIncluded: ["10× pen needles"], whoItsFor: [], howItWorks: [], faqs: [], inStock: true,
  },
  "insulin-syringes-5": {
    id: "pack-supply-insulin-syringes", name: "Insulin Syringes 1ml U-100 (5-pack)", slug: "insulin-syringes-5",
    shortDescription: "Checkout-only pack supply.", description: "Available only with a qualifying peptide pack.",
    price: catalogPrice("insulin-syringes-5"), image: insulinSyringes, category: "Pack supplies", track: "RUO",
    benefits: [], whatsIncluded: ["5× insulin syringes"], whoItsFor: [], howItWorks: [], faqs: [], inStock: true,
  },
};

export { PACK_SUPPLY_SLUGS };
