import { describe, it, expect } from "vitest";
import { products } from "@/data/products";

const cases: { slug: string; base: number }[] = [
  { slug: "kpv", base: 1120 },
  { slug: "thymosin-alpha-1", base: 1500 },
  { slug: "ara-290", base: 1235 },
  { slug: "ss-31", base: 1615 },
  { slug: "pinealon", base: 855 },
  { slug: "epitalon", base: 855 },
  { slug: "selank", base: 740 },
  { slug: "semax", base: 740 },
];

const fmt = (n: number) => `R${n.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`;

describe("new peptide ZAR pricing", () => {
  for (const { slug, base } of cases) {
    it(`${slug}: 3-Pack and Single Vial prices match base R${base}`, () => {
      const p = products.find((x) => x.slug === slug);
      expect(p, `product ${slug}`).toBeDefined();
      const pack3 = Math.round(base * 3 * 0.92);
      expect(p!.variants?.[0].label).toBe("3-Pack");
      expect(p!.variants?.[0].price).toBe(pack3);
      expect(p!.variants?.[1].label).toBe("Single Vial");
      expect(p!.variants?.[1].price).toBe(base);
      expect(p!.priceRange).toBe(`${fmt(base)} – ${fmt(pack3)}`);
    });
  }
});
