// Authoritative ZAR pricing shared by the storefront, Vercel and Supabase.
import { BAC_SLUG, LIVE_CATALOG, isLivePeptide, liveListing } from "./catalog-release.ts";

export const PRICING = {
  currency: "ZAR",
  vatRate: 0.15,
  shipping: { country: "South Africa", method: "Local courier (The Courier Guy / Aramex)", flat: 89, freeOver: 1500 },
  programOffers: {
    monthly: { offerId: "weight_loss_monthly_1999", amount: 1999, label: "Monthly plan" },
    full12Week: { offerId: "weight_loss_12_week_4999", amount: 4999, label: "Full 12-week program" },
  },
  consultOnlySlugs: [],
  directOnlySlugs: ["pets-bpc-157", "pets-kpv", "pets-recovery-blend", "pets-immune-thymogen", "pets-mobility-collagen"],
  packDiscounts: { 3: 0.15, 5: 0.20 },
  // Dormant source prices remain readable for historical catalogue records.
  // variantPrice/quoteCheckout, not this raw lookup, enforce sale eligibility.
  catalog: {
    "rt3-reta": LIVE_CATALOG["rt3-reta"].price,
    "ghk-cu-50mg": LIVE_CATALOG["ghk-cu-50mg"].price,
    tesamorelin: LIVE_CATALOG.tesamorelin.price,
    "tz2-tirz": LIVE_CATALOG["tz2-tirz"].price,
    "mots-c": LIVE_CATALOG["mots-c"].price,
    "bpc-tb500-blend": LIVE_CATALOG["bpc-tb500-blend"].price,
    klow80: LIVE_CATALOG.klow80.price,
    kpv: LIVE_CATALOG.kpv.price,
    "ss-31": LIVE_CATALOG["ss-31"].price,
    "bac-water-bacteriostatic": LIVE_CATALOG[BAC_SLUG].price,
    glow70: 1080, "thymosin-alpha-1": 1500, "ara-290": 1235,
    pinealon: 855, epitalon: 855, selank: 740, semax: 740,
    "alcohol-swabs-20": 59, "glass-cartridge-3ml": 39,
    "peptide-pen-needles-10": 49, "insulin-syringes-5": 59,
    "pets-bpc-157": 895, "pets-kpv": 795, "pets-recovery-blend": 1195,
    "pets-immune-thymogen": 845, "pets-mobility-collagen": 395,
  },
  explicitVariants: {},
} as const;
export type CatalogSlug = keyof typeof PRICING.catalog;
export type MixBundleSize = 5;
export const PACK_SUPPLY_SLUGS = [BAC_SLUG] as const;
export type PackSupplySlug = typeof PACK_SUPPLY_SLUGS[number];
export function isPackSupplySlug(slug: string): slug is PackSupplySlug { return slug === BAC_SLUG; }
/** Legacy packaging helper only. It never preselects, includes or limits BAC. */
export function recommendedBacWaterQuantity(pack: 3 | 5): number { return pack === 3 ? 2 : 3; }
export const roundRand = (amount: number) => Math.round(amount);
export const roundCents = (amount: number) => Math.round(amount * 100) / 100;
export function catalogPrice(slug: string): number {
  if (!Object.prototype.hasOwnProperty.call(PRICING.catalog, slug)) throw new Error(`Unknown product: ${slug}`);
  const amount = (PRICING.catalog as Record<string, number>)[slug];
  if (!Number.isFinite(amount)) throw new Error(`Unknown product: ${slug}`);
  return amount;
}
export function isConsultOnlySlug(slug: string): boolean { return (PRICING.consultOnlySlugs as readonly string[]).includes(slug); }
export function isDirectOnlySlug(slug: string): boolean { return (PRICING.directOnlySlugs as readonly string[]).includes(slug); }
export function assertSaleable(slug: string): void {
  if (!liveListing(slug) && !isDirectOnlySlug(slug)) throw new Error(`Product is not currently offered: ${slug}`);
}
/** Raw pack calculation is also used while constructing dormant source records. */
export function packPrice(slug: string, pack: 1 | 3 | 5): number {
  if (![1, 3, 5].includes(pack)) throw new Error("Only single vials, 3-packs and 5-packs are offered");
  if (slug === BAC_SLUG && pack !== 1) throw new Error("BAC water is sold separately without a pack discount");
  const single = catalogPrice(slug);
  return pack === 1 ? single : roundRand(single * pack * (1 - PRICING.packDiscounts[pack]));
}
export function variantPack(variantLabel?: string | null): 1 | 3 | 5 {
  if (!variantLabel || /^single vial$/i.test(variantLabel)) return 1;
  if (/^3-pack$/i.test(variantLabel)) return 3;
  if (/^5-pack$/i.test(variantLabel)) return 5;
  throw new Error("Invalid variant. Please choose a current single vial, 3-pack or 5-pack.");
}
export function variantPrice(slug: string, variantLabel?: string | null): number {
  assertSaleable(slug);
  return packPrice(slug, variantPack(variantLabel));
}
export function quoteMixSlugs(slugs: string[], size: MixBundleSize) {
  if (size !== 5) throw new Error("Only the 5-pack pick and mix is offered");
  if (!Array.isArray(slugs) || slugs.length !== 5) throw new Error("A 5-pack needs exactly 5 products");
  const subtotal = slugs.reduce((sum, slug) => {
    if (typeof slug !== "string" || !isLivePeptide(slug)) throw new Error("Only currently listed peptides can be included in a peptide bundle; BAC is separate");
    return sum + catalogPrice(slug);
  }, 0);
  const discountPct = PRICING.packDiscounts[5];
  const total = roundRand(subtotal * (1 - discountPct));
  return { subtotal, total, savings: subtotal - total, discountPct: discountPct * 100 };
}
/** Merchandise value AFTER pack savings and paid add-ons, BEFORE delivery. */
export function shippingForSubtotal(subtotal: number): number {
  if (!Number.isFinite(subtotal) || subtotal < 0) throw new Error("Invalid merchandise total");
  return roundCents(subtotal) >= PRICING.shipping.freeOver ? 0 : PRICING.shipping.flat;
}
export type CheckoutSelection =
  | { kind: "item"; slug: string; sku?: string; variantLabel?: string | null; quantity: number }
  | { kind: "mix_bundle"; size: MixBundleSize; slugs: string[]; quantity?: number };
export interface ServerCheckoutQuote {
  subtotal: number; savings: number; shipping: number; total: number;
  freeShippingApplied: boolean; description: string;
}
export function quoteCheckout(selections: CheckoutSelection[]): ServerCheckoutQuote {
  if (!Array.isArray(selections) || selections.length === 0) throw new Error("Cart is empty");
  if (selections.length > 100) throw new Error("Too many cart lines");
  let subtotal = 0;
  let savings = 0;
  const descriptions: string[] = [];
  for (const selection of selections) {
    if (!selection || typeof selection !== "object") throw new Error("Invalid cart line");
    const quantity = selection.quantity ?? 1;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new Error("Invalid quantity");
    if (selection.kind === "item") {
      const listing = liveListing(selection.slug);
      if (selection.sku && selection.sku !== listing?.sku) throw new Error("Product strength changed. Please rebuild your cart.");
      const amount = variantPrice(selection.slug, selection.variantLabel);
      const pack = variantPack(selection.variantLabel);
      subtotal += amount * quantity;
      savings += Math.max(0, catalogPrice(selection.slug) * pack - amount) * quantity;
      descriptions.push(`${listing?.name ?? selection.slug} (${pack} vial${pack === 1 ? "" : "s"}${listing ? `; ${listing.sku}` : ""}) x${quantity}`);
    } else if (selection.kind === "mix_bundle") {
      const quote = quoteMixSlugs(selection.slugs, selection.size);
      subtotal += quote.total * quantity;
      savings += quote.savings * quantity;
      descriptions.push(`5-Pack (${selection.slugs.map((slug) => liveListing(slug)!.name).join(", ")}) x${quantity}`);
    } else {
      throw new Error("Invalid cart line");
    }
  }
  subtotal = roundCents(subtotal);
  savings = roundCents(savings);
  const shipping = shippingForSubtotal(subtotal);
  return { subtotal, savings, shipping, total: roundCents(subtotal + shipping), freeShippingApplied: shipping === 0, description: descriptions.join(", ").slice(0, 500) };
}
// Historic program display constant; not another store discount.
export const WEIGHT_LOSS_SAVING = 997;
export const formatZarWhole = (amount: number): string => `R${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
