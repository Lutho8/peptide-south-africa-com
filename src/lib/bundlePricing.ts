// Bundle pricing engine — 3-tier architecture.
//
//   3-Pack (per-product)      → 15% off  (built into product variants, ×0.85)
//   5-Pack Pick & Mix         → 20% off  (any 5 vials across the catalog)
//   10-Pack "Researcher Value"→ 30% off  (any 10 vials across the catalog)
//
// All prices are ZAR and VAT-inclusive (15%) — never display excl. VAT.
// The first-order code PEPTIDESA10 (10%) stacks ON TOP of bundle pricing:
// it is applied by CartContext to the already-discounted cart subtotal,
// i.e. sequentially: singles → bundle discount → PEPTIDESA10.

import { products, type Product } from "@/data/products";

/** Discount multiplier per pick & mix bundle size. */
export const MIX_BUNDLE_TIERS = {
  5: { multiplier: 0.8, discountPct: 20, label: "5-Pack Pick & Mix" },
  10: { multiplier: 0.7, discountPct: 30, label: "10-Pack Researcher Value" },
} as const;

export type MixBundleSize = keyof typeof MIX_BUNDLE_TIERS;

/** 3-pack tier (implemented via product variants in products.ts). */
export const PACK3_DISCOUNT_PCT = 15;

/** Round to whole rand (site convention for vial pricing). */
const round0 = (n: number) => Math.round(n);
/** Round to cents. */
const round2 = (n: number) => Math.round(n * 100) / 100;

/** Single-vial ZAR price for a product (variant pack === 1, falls back to product.price). */
export function singleVialPrice(p: Product): number {
  return p.variants?.find((v) => v.pack === 1)?.price ?? p.price;
}

export interface MixQuote {
  size: MixBundleSize;
  /** Sum of single-vial prices for the selection. */
  subtotal: number;
  /** Discounted bundle total = round(subtotal × multiplier). */
  total: number;
  /** subtotal − total. */
  savings: number;
  discountPct: number;
  label: string;
}

/** Price a pick & mix selection. `selection` must contain exactly `size` products. */
export function quoteMixBundle(selection: Product[], size: MixBundleSize): MixQuote {
  if (selection.length !== size) {
    throw new Error(`A ${size}-pack needs exactly ${size} vials, got ${selection.length}`);
  }
  const tier = MIX_BUNDLE_TIERS[size];
  const subtotal = selection.reduce((s, p) => s + singleVialPrice(p), 0);
  const total = round0(subtotal * tier.multiplier);
  return {
    size,
    subtotal,
    total,
    savings: subtotal - total,
    discountPct: tier.discountPct,
    label: tier.label,
  };
}

/**
 * Allocate a bundle's discounted total across its per-vial cart lines so the
 * line prices sum EXACTLY to the quoted bundle total (no cent drift at
 * checkout). Each vial gets round2(single × multiplier); any rounding
 * remainder is absorbed by the last line.
 */
export function allocateMixLinePrices(selection: Product[], size: MixBundleSize): number[] {
  const tier = MIX_BUNDLE_TIERS[size];
  const quote = quoteMixBundle(selection, size);
  const raw = selection.map((p) => round2(singleVialPrice(p) * tier.multiplier));
  const sumButLast = raw.slice(0, -1).reduce((s, n) => s + n, 0);
  raw[raw.length - 1] = round2(quote.total - sumButLast);
  return raw;
}

// ---------------------------------------------------------------------------
// Pre-curated 5-pack stacks (quick-select in the builder).
// Compositions per the bundle-pricing brief; totals are always computed live
// from src/data/products.ts so they can never drift from catalog pricing.
// ---------------------------------------------------------------------------

export interface CuratedStack {
  id: string;
  name: string;
  tagline: string;
  /** Exactly 5 product slugs (duplicates allowed). */
  slugs: string[];
}

export const CURATED_STACKS: CuratedStack[] = [
  {
    id: "fat-loss",
    name: "Fat Loss Stack",
    tagline: "Metabolic research combination",
    slugs: ["rt3-reta", "tz2-tirz", "mots-c", "ghk-cu-50mg", "glow70"],
  },
  {
    id: "recovery",
    name: "Recovery Stack",
    tagline: "Tissue repair & recovery focus",
    slugs: ["bpc-tb500-blend", "tesamorelin", "ghk-cu-50mg", "glow70", "mots-c"],
  },
  {
    id: "longevity",
    name: "Longevity Stack",
    tagline: "Aging & cellular renewal protocol",
    slugs: ["klow80", "mots-c", "ghk-cu-50mg", "glow70", "tesamorelin"],
  },
  {
    id: "performance",
    name: "Performance Stack",
    tagline: "Comprehensive research protocol",
    slugs: ["rt3-reta", "tesamorelin", "bpc-tb500-blend", "glow70", "klow80"],
  },
];

export function resolveStackProducts(stack: CuratedStack): (Product | undefined)[] {
  return stack.slugs.map((slug) => products.find((p) => p.slug === slug));
}

// ---------------------------------------------------------------------------
// Cart-level bundle savings helpers (used by cart drawer / cart / checkout).
// ---------------------------------------------------------------------------

/** Minimal cart-line shape needed to compute savings (mirrors CartItem). */
export interface SavingsLine {
  product: Product;
  variantLabel?: string;
  unitPrice: number;
  quantity: number;
  compareAtPrice?: number;
}

/**
 * Total rand saved through bundle pricing across the cart:
 * pick & mix lines (compareAtPrice − unitPrice) plus 3-pack variant lines
 * (3 × single − pack price).
 */
export function cartBundleSavings(items: SavingsLine[]): number {
  return round2(
    items.reduce((sum, i) => {
      if (i.compareAtPrice !== undefined) {
        return sum + (i.compareAtPrice - i.unitPrice) * i.quantity;
      }
      const packVariant = i.product.variants?.find(
        (v) => v.label === i.variantLabel && (v.pack ?? 1) > 1,
      );
      if (packVariant?.pack) {
        const single = singleVialPrice(i.product);
        return sum + (single * packVariant.pack - i.unitPrice) * i.quantity;
      }
      return sum;
    }, 0),
  );
}

/** Suggested low-cost add-ons for the free-shipping nudge (in-stock only, cheapest first). */
export function shippingNudgeSuggestions(limit = 2): Product[] {
  return products
    .filter((p) => p.inStock)
    .sort((a, b) => singleVialPrice(a) - singleVialPrice(b))
    .slice(0, limit);
}
