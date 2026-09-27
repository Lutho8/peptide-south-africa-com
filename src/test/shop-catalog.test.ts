import { describe, it, expect } from "vitest";
import { categories, getProductsByCategory } from "@/data/products";

describe("shop catalog categories", () => {
  it("categories array contains Recovery and Wellness & Longevity", () => {
    expect(categories).toContain("Recovery");
    expect(categories).toContain("Wellness & Longevity");
  });

  it("Recovery includes only stocked KPV", () => {
    const slugs = getProductsByCategory("Recovery").map((p) => p.slug);
    expect(slugs).toEqual(["kpv"]);
  });

  it("Wellness & Longevity contains only stocked MOTS-C, KLOW and SS-31", () => {
    const slugs = getProductsByCategory("Wellness & Longevity").map((p) => p.slug);
    expect(slugs).toEqual(
      ["mots-c", "klow80", "ss-31"],
    );
  });
});
