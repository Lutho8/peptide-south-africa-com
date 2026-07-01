import { describe, it, expect } from "vitest";
import { categories, getProductsByCategory } from "@/data/products";

describe("shop catalog categories", () => {
  it("categories array contains Recovery and Wellness & Longevity", () => {
    expect(categories).toContain("Recovery");
    expect(categories).toContain("Wellness & Longevity");
  });

  it("Recovery includes KPV, Thymosin Alpha-1, ARA-290", () => {
    const slugs = getProductsByCategory("Recovery").map((p) => p.slug);
    expect(slugs).toEqual(expect.arrayContaining(["kpv", "thymosin-alpha-1", "ara-290"]));
  });

  it("Wellness & Longevity includes SS-31, Pinealon, Epitalon, Selank, Semax", () => {
    const slugs = getProductsByCategory("Wellness & Longevity").map((p) => p.slug);
    expect(slugs).toEqual(
      expect.arrayContaining(["ss-31", "pinealon", "epitalon", "selank", "semax"]),
    );
  });
});
