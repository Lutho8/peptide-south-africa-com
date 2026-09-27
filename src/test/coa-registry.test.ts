import { describe, expect, it } from "vitest";
import { getCoasForProduct, staticCoas } from "@/data/coas";
import { getProductBySlug } from "@/data/products";

describe("COA registry", () => {
  const expectedRecords = [
    {
      shortCode: "m01",
      productSlug: "mots-c",
      productSku: "RTT-MTC-10",
      taskNumber: "83567",
      sampleReference: "MOTS-C 10mg",
      verificationUrl: "https://verify.janoshik.com/tests/83567_HGNB5E53261C",
    },
    {
      shortCode: "r01",
      productSlug: "rt3-reta",
      productSku: "RTT-GGG-10",
      taskNumber: "61141",
      sampleReference: "Retatrutide 10mg",
      verificationUrl: "https://verify.janoshik.com/tests/61141_UMR871KAJ2N9",
    },
    {
      shortCode: "z01",
      productSlug: "tz2-tirz",
      productSku: "SOURCE-T120-20",
      taskNumber: "164662",
      sampleReference: "T120",
      verificationUrl: "https://verify.janoshik.com/tests/164662_D9DXNXDK1YM4",
    },
  ];

  it.each(expectedRecords)(
    "keeps $productSlug short code $shortCode permanently bound to its Janoshik report",
    (expected) => {
      expect(staticCoas.find((item) => item.shortCode === expected.shortCode)).toMatchObject(expected);
    },
  );

  it("keeps the Tesamorelin short code permanently bound to Janoshik task 164644", () => {
    const record = staticCoas.find((item) => item.shortCode === "t01");
    expect(record).toMatchObject({
      productSlug: "tesamorelin",
      productSku: "SOURCE-TSM10",
      taskNumber: "164644",
      sampleReference: "TSM10",
      verificationUrl: "https://verify.janoshik.com/tests/164644_ILEI5C8YKHME",
    });
  });

  it("exposes the source-scope limitation instead of claiming unique-vial authentication", () => {
    for (const record of staticCoas) {
      expect(record.sourceNote).toContain("not a unique PSA vial or lot");
    }
    expect(staticCoas.find(c=>c.shortCode === "t01")!.sourceNote).toContain("batch field is blank");
    expect(getCoasForProduct("mots-c")[0].sourceNote).toContain("batch is reported as Unknown");
    expect(getCoasForProduct("rt3-reta")[0].sourceNote).toContain("batch is reported as Unknown");
    expect(staticCoas.find(c=>c.shortCode === "z01")!.sourceNote).toContain("the currently listed Tirzepatide is 10 mg per vial");
  });

  it("never associates a wrong-strength source report with the current offer", () => {
    expect(getCoasForProduct("tesamorelin")).toEqual([]);
    expect(getCoasForProduct("tz2-tirz")).toEqual([]);
    expect(staticCoas.find(c=>c.shortCode === "t01")!.strength).toBe("10 mg");
    expect(staticCoas.find(c=>c.shortCode === "z01")!.strength).toBe("20 mg");
  });

  it("aligns the product purity display with the published report", () => {
    expect(getProductBySlug("tesamorelin")?.purity).toBeUndefined();
    expect(getProductBySlug("mots-c")?.purity).toBe("99.098% HPLC");
    expect(getProductBySlug("rt3-reta")?.purity).toBe("99.060% HPLC");
    expect(getProductBySlug("tz2-tirz")?.purity).toBeUndefined();
  });
});
