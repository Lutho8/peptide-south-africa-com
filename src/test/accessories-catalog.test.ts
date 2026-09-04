import { describe, it, expect } from "vitest";
import { categories, getProductsByCategory, getProductBySlug } from "@/data/products";

const INCLUDED_SUPPLY_SLUGS = [
  "bac-water-bacteriostatic",
  "alcohol-swabs-20",
  "glass-cartridge-3ml",
  "peptide-pen-needles-10",
  "insulin-syringes-5",
] as const;

describe("supplies included with fulfilled orders", () => {
  it("does not expose included supplies as standalone products", () => {
    for (const slug of INCLUDED_SUPPLY_SLUGS) {
      expect(getProductBySlug(slug), slug).toBeUndefined();
    }
  });

  it("does not expose supply-only catalogue filters", () => {
    expect(categories).not.toContain("BAC Water");
    expect(categories).not.toContain("Accessories");
    expect(getProductsByCategory("BAC Water")).toEqual([]);
    expect(getProductsByCategory("Accessories")).toEqual([]);
  });
});
