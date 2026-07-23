import { describe, it, expect } from "vitest";
import { categories, getProductsByCategory, getProductBySlug } from "@/data/products";

describe("BAC Water + Accessories catalog", () => {
  it("categories include BAC Water and Accessories", () => {
    expect(categories).toContain("BAC Water");
    expect(categories).toContain("Accessories");
  });

  it("BAC Water product exists with 3ml and 10ml ZAR variants", () => {
    const bac = getProductBySlug("bac-water-bacteriostatic");
    expect(bac).toBeDefined();
    expect(bac?.category).toBe("BAC Water");
    const labels = bac?.variants?.map((v) => v.label) ?? [];
    expect(labels).toEqual(expect.arrayContaining(["3ml", "10ml"]));
    expect(bac?.price).toBe(89);
  });

  it("Accessories category exposes all four SKUs", () => {
    const slugs = getProductsByCategory("Accessories").map((p) => p.slug);
    expect(slugs).toEqual(
      expect.arrayContaining([
        "alcohol-swabs-20",
        "glass-cartridge-3ml",
        "peptide-pen-needles-10",
        "insulin-syringes-5",
      ]),
    );
  });

  it("all accessories are in stock and priced in ZAR", () => {
    for (const slug of [
      "alcohol-swabs-20",
      "glass-cartridge-3ml",
      "peptide-pen-needles-10",
      "insulin-syringes-5",
    ]) {
      const p = getProductBySlug(slug);
      expect(p, slug).toBeDefined();
      expect(p?.inStock).toBe(true);
      expect(p?.price).toBeGreaterThan(0);
    }
  });
});
