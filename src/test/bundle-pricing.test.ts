import { describe, it, expect } from "vitest";
import { products, getProductBySlug } from "@/data/products";
import {
  CURATED_STACKS,
  MIX_BUNDLE_TIERS,
  allocateMixLinePrices,
  cartBundleSavings,
  quoteMixBundle,
  resolveStackProducts,
  singleVialPrice,
} from "@/lib/bundlePricing";
import { FIRST_ORDER_PCT } from "@/context/CartContext";

const bySlug = (slug: string) => {
  const p = getProductBySlug(slug);
  expect(p, `product ${slug}`).toBeDefined();
  return p!;
};

describe("3-pack tier (15% off) — all catalog products", () => {
  it.each(products.filter((p) => p.variants?.some((v) => v.pack === 3)).map((p) => [p.slug] as const))(
    "%s: 3-Pack price = round(3 × single × 0.85)",
    (slug) => {
      const p = bySlug(slug);
      const single = singleVialPrice(p);
      const pack3 = p.variants!.find((v) => v.pack === 3)!;
      expect(pack3.price).toBe(Math.round(single * 3 * 0.85));
      // 3-Pack is variants[0] → pre-selected default on the PDP (bundle-first)
      expect(p.variants![0].pack).toBe(3);
    },
  );
});

describe("5-pack pick & mix (20% off)", () => {
  it("prices a mixed selection at subtotal × 0.80 with correct savings", () => {
    const sel = ["rt3-reta", "tz2-tirz", "mots-c", "ghk-cu-50mg", "ghk-cu-50mg"].map(bySlug);
    const subtotal = 1250 + 895 + 485 + 630 + 630; // 3890
    const q = quoteMixBundle(sel, 5);
    expect(q.subtotal).toBe(subtotal);
    expect(q.total).toBe(Math.round(subtotal * 0.8)); // 3112
    expect(q.savings).toBe(subtotal - q.total); // 778
    expect(q.discountPct).toBe(20);
  });

  it("rejects selections that aren't exactly 5", () => {
    const sel = ["rt3-reta", "tz2-tirz"].map(bySlug);
    expect(() => quoteMixBundle(sel, 5)).toThrow();
  });

  it("allocated line prices sum exactly to the bundle total", () => {
    const sel = ["rt3-reta", "tesamorelin", "bpc-tb500-blend", "glow70", "klow80"].map(bySlug);
    const q = quoteMixBundle(sel, 5);
    const lines = allocateMixLinePrices(sel, 5);
    const sum = Math.round(lines.reduce((s, n) => s + n, 0) * 100) / 100;
    expect(sum).toBe(q.total);
    expect(lines).toHaveLength(5);
  });
});

describe("10-pack researcher value (30% off)", () => {
  it("10 × GHK-Cu: R6,300 → R4,410 (save R1,890)", () => {
    const sel = Array(10).fill(bySlug("ghk-cu-50mg"));
    const q = quoteMixBundle(sel, 10);
    expect(q.subtotal).toBe(6300);
    expect(q.total).toBe(4410);
    expect(q.savings).toBe(1890);
    expect(q.discountPct).toBe(30);
  });

  it("5 × RT3 + 5 × GLOW70: R11,650 → R8,155 (save R3,495)", () => {
    const sel = [...Array(5).fill(bySlug("rt3-reta")), ...Array(5).fill(bySlug("glow70"))];
    const q = quoteMixBundle(sel, 10);
    expect(q.subtotal).toBe(11650);
    expect(q.total).toBe(8155);
    expect(q.savings).toBe(3495);
  });

  it("allocation absorbs cent drift when single × 0.7 isn't a whole number", () => {
    // 895 × 0.7 = 626.50 — mixed selection exercises the remainder path.
    const sel = [
      ...Array(9).fill(bySlug("tz2-tirz")),
      bySlug("rt3-reta"),
    ];
    const q = quoteMixBundle(sel, 10);
    const lines = allocateMixLinePrices(sel, 10);
    const sum = Math.round(lines.reduce((s, n) => s + n, 0) * 100) / 100;
    expect(sum).toBe(q.total);
  });
});

describe("pre-curated stacks", () => {
  it("defines exactly 4 stacks of 5 resolvable products each", () => {
    expect(CURATED_STACKS).toHaveLength(4);
    for (const stack of CURATED_STACKS) {
      const resolved = resolveStackProducts(stack);
      expect(resolved.filter(Boolean)).toHaveLength(5);
    }
  });

  it("Longevity Stack: R4,230 → R3,384 (save R846)", () => {
    const stack = CURATED_STACKS.find((s) => s.id === "longevity")!;
    const q = quoteMixBundle(resolveStackProducts(stack) as never, 5);
    expect(q.subtotal).toBe(4230);
    expect(q.total).toBe(3384);
    expect(q.savings).toBe(846);
  });

  it("Performance Stack: R5,320 → R4,256 (save R1,064)", () => {
    const stack = CURATED_STACKS.find((s) => s.id === "performance")!;
    const q = quoteMixBundle(resolveStackProducts(stack) as never, 5);
    expect(q.subtotal).toBe(5320);
    expect(q.total).toBe(4256);
    expect(q.savings).toBe(1064);
  });

  it("Fat Loss and Recovery stacks price from live catalog data", () => {
    const fatLoss = CURATED_STACKS.find((s) => s.id === "fat-loss")!;
    const qF = quoteMixBundle(resolveStackProducts(fatLoss) as never, 5);
    // 1250 + 895 + 485 + 630 + 1080 = 4340 (brief's R4,310 had an arithmetic slip)
    expect(qF.subtotal).toBe(4340);
    expect(qF.total).toBe(3472);

    const recovery = CURATED_STACKS.find((s) => s.id === "recovery")!;
    const qR = quoteMixBundle(resolveStackProducts(recovery) as never, 5);
    // 955 + 775 + 630 + 1080 + 485 = 3925 (brief's R3,905 had an arithmetic slip)
    expect(qR.subtotal).toBe(3925);
    expect(qR.total).toBe(3140);
  });
});

describe("PEPTIDESA10 stacks on top of bundle discounts (Section 7)", () => {
  it("3-Pack RT3 → 15% off → additional 10% = R2,869 (23.5% total)", () => {
    const rt3 = bySlug("rt3-reta");
    const pack3 = rt3.variants!.find((v) => v.pack === 3)!;
    expect(pack3.price).toBe(3188); // 3750 × 0.85, rounded

    // CartContext applies the first-order code to the bundle-discounted subtotal.
    const afterCode = pack3.price * (1 - FIRST_ORDER_PCT);
    expect(Math.round(afterCode)).toBe(2869);

    const originalSingles = singleVialPrice(rt3) * 3; // 3750
    const totalSavings = originalSingles - afterCode; // ≈ 880.8
    const pct = (totalSavings / originalSingles) * 100;
    expect(Math.round(pct * 10) / 10).toBe(23.5);
  });

  it("cartBundleSavings reports 3-pack and pick & mix savings together", () => {
    const rt3 = bySlug("rt3-reta");
    const ghk = bySlug("ghk-cu-50mg");
    const pack3 = rt3.variants!.find((v) => v.pack === 3)!;
    const items = [
      // 3-Pack line added from PDP
      { product: rt3, variantLabel: pack3.label, unitPrice: pack3.price, quantity: 1 },
      // one pick & mix vial line (20% off GHK single of 630 → 504)
      { product: ghk, unitPrice: 504, compareAtPrice: 630, quantity: 1 },
    ];
    // 3750 − 3188 = 562, plus 126 = 688
    expect(cartBundleSavings(items)).toBe(688);
  });
});

describe("NEW 3-Pack pricing table (all 8 core products)", () => {
  it.each([
    ["rt3-reta", 1250, 3188],
    ["tz2-tirz", 895, 2282],
    ["klow80", 1260, 3213],
    ["glow70", 1080, 2754],
    ["tesamorelin", 775, 1976],
    ["bpc-tb500-blend", 955, 2435],
    ["ghk-cu-50mg", 630, 1607],
    ["mots-c", 485, 1237],
  ] as const)("%s: single R%d → 3-Pack R%d", (slug, single, pack3Price) => {
    const p = bySlug(slug);
    expect(singleVialPrice(p)).toBe(single);
    expect(p.variants!.find((v) => v.pack === 3)!.price).toBe(pack3Price);
  });
});
