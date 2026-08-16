import { describe, expect, it } from "vitest";
import { getCoasForProduct, staticCoas } from "@/data/coas";
import { getProductBySlug } from "@/data/products";

describe("COA registry", () => {
  it("keeps the Tesamorelin short code permanently bound to Janoshik task 164644", () => {
    const record = staticCoas.find((item) => item.shortCode === "t01");
    expect(record).toMatchObject({
      productSlug: "tesamorelin",
      productSku: "RTT-TES-10",
      taskNumber: "164644",
      sampleReference: "TSM10",
      verificationUrl: "https://verify.janoshik.com/tests/164644_ILEI5C8YKHME",
    });
  });

  it("exposes the source-scope limitation instead of claiming unique-vial authentication", () => {
    const record = getCoasForProduct("tesamorelin")[0];
    expect(record.sourceNote).toContain("batch field is blank");
    expect(record.sourceNote).toContain("not a unique PSA vial or lot");
  });

  it("aligns the product purity display with the published report", () => {
    expect(getProductBySlug("tesamorelin")?.purity).toBe("98.43–98.59% HPLC");
  });
});

