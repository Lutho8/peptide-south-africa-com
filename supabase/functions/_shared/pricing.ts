// Authoritative PSA pricing configuration.
//
// This module is intentionally dependency-free so it can be consumed by both
// Supabase Edge Functions (the payment authority) and the storefront bundle.
// All amounts are VAT-inclusive South African rand and round to whole rand.

export const PRICING = {
  currency: "ZAR",
  vatRate: 0.15,
  shipping: {
    country: "South Africa",
    method: "Local courier (The Courier Guy / Aramex)",
    flat: 89,
    freeOver: 1500,
  },
  programOffers: {
    monthly: {
      offerId: "weight_loss_monthly_1999",
      amount: 1999,
      label: "Monthly plan",
    },
    full12Week: {
      offerId: "weight_loss_12_week_4999",
      amount: 4999,
      label: "Full 12-week program",
    },
  },
  consultOnlySlugs: ["rt3-reta", "tz2-tirz"],
  packDiscounts: {
    3: 0.15,
    5: 0.20,
    10: 0.30,
  },
  catalog: {
    "rt3-reta": 1250,
    "ghk-cu-50mg": 630,
    tesamorelin: 775,
    "tz2-tirz": 895,
    "mots-c": 485,
    "bpc-tb500-blend": 955,
    glow70: 1080,
    klow80: 1260,
    kpv: 1120,
    "thymosin-alpha-1": 1500,
    "ara-290": 1235,
    "ss-31": 1615,
    pinealon: 855,
    epitalon: 855,
    selank: 740,
    semax: 740,
    "bac-water-bacteriostatic": 89,
    "alcohol-swabs-20": 59,
    "glass-cartridge-3ml": 39,
    "peptide-pen-needles-10": 49,
    "insulin-syringes-5": 59,
  },
  explicitVariants: {
    "bac-water-bacteriostatic": {
      "10ml": 199,
      "3ml": 89,
    },
  },
} as const;

export type CatalogSlug = keyof typeof PRICING.catalog;
export type MixBundleSize = 5 | 10;

export const roundRand = (amount: number) => Math.round(amount);
export const roundCents = (amount: number) => Math.round(amount * 100) / 100;

export function catalogPrice(slug: string): number {
  const amount = (PRICING.catalog as Record<string, number>)[slug];
  if (!Number.isFinite(amount)) throw new Error(`Unknown product: ${slug}`);
  return amount;
}

export function isConsultOnlySlug(slug: string): boolean {
  return (PRICING.consultOnlySlugs as readonly string[]).includes(slug);
}

function assertCheckoutEligible(slug: string): void {
  if (isConsultOnlySlug(slug)) {
    throw new Error("This clinician-guided product requires a consultation");
  }
}

export function packPrice(slug: string, pack: 1 | 3): number {
  const single = catalogPrice(slug);
  return pack === 1 ? single : roundRand(single * pack * (1 - PRICING.packDiscounts[3]));
}

export function variantPrice(slug: string, variantLabel?: string | null): number {
  const explicit = (PRICING.explicitVariants as Record<string, Record<string, number>>)[slug];
  if (explicit) {
    if (!variantLabel || explicit[variantLabel] === undefined) {
      throw new Error(`Invalid variant for ${slug}`);
    }
    return explicit[variantLabel];
  }
  if (!variantLabel) return catalogPrice(slug);
  if (/^single vial$/i.test(variantLabel)) return packPrice(slug, 1);
  if (/^3-pack$/i.test(variantLabel)) return packPrice(slug, 3);
  throw new Error(`Invalid variant for ${slug}`);
}

export function variantPack(variantLabel?: string | null): number {
  if (!variantLabel) return 1;
  if (/^3-pack$/i.test(variantLabel)) return 3;
  return 1;
}

export function quoteMixSlugs(slugs: string[], size: MixBundleSize) {
  if (slugs.length !== size) throw new Error(`A ${size}-pack needs exactly ${size} products`);
  const subtotal = slugs.reduce((sum, slug) => {
    assertCheckoutEligible(slug);
    return sum + catalogPrice(slug);
  }, 0);
  const discountPct = PRICING.packDiscounts[size];
  const total = roundRand(subtotal * (1 - discountPct));
  return { subtotal, total, savings: subtotal - total, discountPct: discountPct * 100 };
}

export type CheckoutSelection =
  | { kind: "item"; slug: string; variantLabel?: string | null; quantity: number }
  | { kind: "mix_bundle"; size: MixBundleSize; slugs: string[]; quantity?: number };

export interface ServerCheckoutQuote {
  subtotal: number;
  savings: number;
  shipping: number;
  total: number;
  freeShippingApplied: boolean;
  description: string;
}

export function quoteCheckout(selections: CheckoutSelection[]): ServerCheckoutQuote {
  if (!Array.isArray(selections) || selections.length === 0) throw new Error("Cart is empty");
  let subtotal = 0;
  let savings = 0;
  const descriptions: string[] = [];

  for (const selection of selections) {
    const quantity = selection.quantity ?? 1;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new Error("Invalid quantity");
    if (selection.kind === "item") {
      assertCheckoutEligible(selection.slug);
      const amount = variantPrice(selection.slug, selection.variantLabel);
      const pack = variantPack(selection.variantLabel);
      subtotal += amount * quantity;
      savings += Math.max(0, catalogPrice(selection.slug) * pack - amount) * quantity;
      descriptions.push(`${selection.slug}${selection.variantLabel ? ` (${selection.variantLabel})` : ""} x${quantity}`);
      continue;
    }
    if (selection.kind === "mix_bundle") {
      const quote = quoteMixSlugs(selection.slugs, selection.size);
      subtotal += quote.total * quantity;
      savings += quote.savings * quantity;
      descriptions.push(`${selection.size}-Pack (${selection.slugs.join(", ")}) x${quantity}`);
      continue;
    }
    throw new Error("Invalid cart line");
  }

  subtotal = roundCents(subtotal);
  savings = roundCents(savings);
  const shipping = subtotal >= PRICING.shipping.freeOver ? 0 : PRICING.shipping.flat;
  return {
    subtotal,
    savings,
    shipping,
    total: roundCents(subtotal + shipping),
    freeShippingApplied: shipping === 0,
    description: descriptions.join(", ").slice(0, 500),
  };
}

// Founder-approved published saving. Kept explicit because the instructed
// customer-facing figure is R997 (rather than the arithmetic R998).
export const WEIGHT_LOSS_SAVING = 997;

/** Stable whole-rand display formatting across browsers and Edge runtimes. */
export const formatZarWhole = (amount: number): string =>
  `R${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
