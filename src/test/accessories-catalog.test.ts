import { describe, it, expect } from "vitest";
import { categories, getProductsByCategory, getProductBySlug } from "@/data/products";

const INCLUDED_SUPPLY_SLUGS = [
  "alcohol-swabs-20",
  "glass-cartridge-3ml",
  "peptide-pen-needles-10",
  "insulin-syringes-5",
] as const;

describe("only stocked paid supplies", () => {
  it("does not expose unpurchased accessories as products", () => {
    for (const slug of INCLUDED_SUPPLY_SLUGS) {
      expect(getProductBySlug(slug), slug).toBeUndefined();
    }
  });

  it("exposes BAC separately with no implied kit or free supply", () => {
    expect(getProductBySlug("bac-water-bacteriostatic")).toMatchObject({name: "BAC water 10 ml", price: 210, strength: "10 ml"});
    expect(categories).toContain("Supplies");
    expect(categories).not.toContain("BAC Water");
    expect(categories).not.toContain("Accessories");
    expect(getProductsByCategory("BAC Water")).toEqual([]);
    expect(getProductsByCategory("Accessories")).toEqual([]);
  });
});
