import { describe, expect, it } from "vitest";
import { getProductBySlug } from "@/data/products";
import { checkoutTotals, toCheckoutSelections } from "@/lib/eftCheckout";
import { normalizeProtocolPricing, type AIProtocol } from "@/lib/quizProtocolFallback";
import type { CartItem } from "@/context/CartContext";
import {
  PRICING,
  WEIGHT_LOSS_SAVING,
  packPrice,
  quoteCheckout,
  quoteMixSlugs,
  variantPrice,
} from "../../supabase/functions/_shared/pricing";

const product = (slug: string) => {
  const match = getProductBySlug(slug);
  if (!match) throw new Error(`Missing fixture ${slug}`);
  return match;
};

const cartLine = (slug: string, variantLabel: string, unitPrice: number, quantity = 1): CartItem => ({
  product: product(slug),
  variantLabel,
  unitPrice,
  quantity,
  lineId: `${slug}:${variantLabel}`,
});

describe("authoritative server pricing", () => {
  it("retains only the approved weight-loss offers and saving", () => {
    expect(PRICING.programOffers.monthly).toMatchObject({ offerId: "weight_loss_monthly_1999", amount: 1999 });
    expect(PRICING.programOffers.full12Week).toMatchObject({ offerId: "weight_loss_12_week_4999", amount: 4999 });
    expect(WEIGHT_LOSS_SAVING).toBe(997);
  });

  it("normalizes stale protocol-service weight-loss pricing", () => {
    const stale = {
      monthlyPrice: "R1,495",
      fullPrice: "R7,499",
      savings: "Save R299",
    } as AIProtocol;
    expect(normalizeProtocolPricing(stale, { goal: "fat-loss" })).toMatchObject({
      monthlyPrice: "R1,999",
      fullPrice: "R4,999",
      savings: "Save R997 vs three monthly payments",
    });
  });

  it("prices a single-vial selection from the catalog", () => {
    expect(quoteCheckout([{ kind: "item", slug: "ghk-cu-50mg", variantLabel: "Single Vial", quantity: 1 }]).subtotal).toBe(700);
  });

  it.each([
    ["pets-bpc-157", 895],
    ["pets-kpv", 795],
    ["pets-recovery-blend", 1195],
    ["pets-immune-thymogen", 845],
    ["pets-mobility-collagen", 395],
  ])("prices the live Pets product %s without accepting a client amount", (slug, amount) => {
    const quote = quoteCheckout([{ kind: "item", slug, quantity: 1 }]);
    expect(quote.subtotal).toBe(amount);
  });

  it("prices a 3-pack at exactly 15% off", () => {
    const quote = quoteCheckout([{ kind: "item", slug: "ghk-cu-50mg", variantLabel: "3-Pack", quantity: 1 }]);
    expect(quote.subtotal).toBe(packPrice("ghk-cu-50mg", 3));
    expect(quote.savings).toBe(700 * 3 - quote.subtotal);
  });

  it("supports mixed eligible single and 3-pack selections without mixing unit levels", () => {
    const quote = quoteCheckout([
      { kind: "item", slug: "ghk-cu-50mg", variantLabel: "Single Vial", quantity: 1 },
      { kind: "item", slug: "tesamorelin", variantLabel: "3-Pack", quantity: 1 },
    ]);
    expect(quote.subtotal).toBe(700 + packPrice("tesamorelin", 3));
  });

  it("applies the 5-pack discount exactly once", () => {
    const slugs = ["mots-c", "ghk-cu-50mg", "ss-31", "tesamorelin", "bpc-tb500-blend"];
    const mix = quoteMixSlugs(slugs, 5);
    const checkout = quoteCheckout([{ kind: "mix_bundle", size: 5, slugs }]);
    expect(mix.total).toBe(Math.round(mix.subtotal * 0.8));
    expect(checkout.subtotal).toBe(mix.total);
    expect(checkout.savings).toBe(mix.savings);
  });

  it("rejects the removed 10-pack even in a direct API quote", () => {
    const slugs = Array(10).fill("ghk-cu-50mg");
    expect(() => quoteCheckout([{ kind: "mix_bundle", size: 10 as never, slugs }])).toThrow();
  });

  it("rounds pack and mixed-bundle totals to whole rand", () => {
    expect(Number.isInteger(packPrice("tesamorelin", 3))).toBe(true);
    expect(Number.isInteger(quoteMixSlugs(Array(5).fill("tesamorelin"), 5).total)).toBe(true);
  });

  it("recalculates quantity changes on the server", () => {
    const one = quoteCheckout([{ kind: "item", slug: "mots-c", variantLabel: "Single Vial", quantity: 1 }]);
    const three = quoteCheckout([{ kind: "item", slug: "mots-c", variantLabel: "Single Vial", quantity: 3 }]);
    expect(three.subtotal).toBe(one.subtotal * 3);
  });

  it("ignores a stale client price and serializes only the selection", () => {
    const selections = toCheckoutSelections([cartLine("ghk-cu-50mg", "Single Vial", 999)]);
    expect(selections[0]).not.toHaveProperty("unitPrice");
    expect(quoteCheckout(selections).subtotal).toBe(700);
  });

  it("ignores a manipulated client price and rejects a manipulated variant", () => {
    const selections = toCheckoutSelections([cartLine("ghk-cu-50mg", "3-Pack", 1)]);
    expect(quoteCheckout(selections).subtotal).toBe(1785);
    expect(() => variantPrice("ghk-cu-50mg", "100-Pack")).toThrow(/Invalid variant/);
  });

  it("matches the visible canonical subtotal and server-confirmed checkout total", () => {
    const visibleSubtotal = variantPrice("ghk-cu-50mg", "Single Vial") + variantPrice("mots-c", "Single Vial");
    const server = quoteCheckout([
      { kind: "item", slug: "ghk-cu-50mg", variantLabel: "Single Vial", quantity: 1 },
      { kind: "item", slug: "mots-c", variantLabel: "Single Vial", quantity: 1 },
    ]);
    expect(server.subtotal).toBe(visibleSubtotal);
    expect(server.total).toBe(checkoutTotals(visibleSubtotal).grandTotal);
  });

  it("rejects malformed bundle sizes instead of trusting a stale bundle", () => {
    expect(() => quoteCheckout([{ kind: "mix_bundle", size: 5, slugs: ["ghk-cu-50mg"] }])).toThrow(/exactly 5/);
  });

  it.each(PRICING.directOnlySlugs)("keeps the Pets product %s out of peptide bundle discounts", (slug) => {
    expect(() => quoteMixSlugs(Array(5).fill(slug), 5)).toThrow(/not eligible for peptide bundles/);
  });

  it("allows every published peptide to proceed through direct checkout", () => {
    expect(() => quoteCheckout([{ kind: "item", slug: "rt3-reta", variantLabel: "Single Vial", quantity: 1 }])).not.toThrow();
    expect(() => quoteMixSlugs(["tz2-tirz", "mots-c", "ghk-cu-50mg", "ss-31", "klow80"], 5)).not.toThrow();
    expect(PRICING.consultOnlySlugs).toHaveLength(0);
  });

  it("BAC can be sold independently with no automatic accessory quantity", () => {
    const q = quoteCheckout([{kind: "item", slug: "bac-water-bacteriostatic",quantity:1}]);
    expect(q.subtotal).toBe(210); expect(q.savings).toBe(0); expect(q.shipping).toBe(89);
    for(const slug of ["alcohol-swabs-20","glass-cartridge-3ml","peptide-pen-needles-10","insulin-syringes-5"])
      expect(()=>quoteCheckout([{kind:"item",slug,quantity:1}])).toThrow(/not currently offered/);
  });
  it("adds only chosen BAC quantities to the pack without discounting BAC",()=>{
    const pack={kind:"item" as const,slug:"ghk-cu-50mg",variantLabel:"3-Pack",quantity:1};
    const plain=quoteCheckout([pack]);
    const added=quoteCheckout([pack,{kind:"item",slug:"bac-water-bacteriostatic",quantity:3}]);
    expect(added.subtotal).toBe(plain.subtotal+630); expect(added.savings).toBe(plain.savings);
  });
  it("BAC cannot be a pack variant or count toward a mixed five",()=>{
    expect(()=>variantPrice("bac-water-bacteriostatic","3-Pack")).toThrow();
    expect(()=>quoteMixSlugs(["bac-water-bacteriostatic",...Array(4).fill("mots-c")],5)).toThrow();
  });
});
