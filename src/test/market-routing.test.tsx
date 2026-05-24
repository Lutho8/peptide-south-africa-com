// Single-market site (South Africa). marketPath is identity and routing is unprefixed.
import { describe, it, expect } from "vitest";
import { marketPath, buildAlternates, detectMarket } from "@/hooks/useMarket";

describe("marketPath helper", () => {
  it("returns the path unchanged regardless of market argument", () => {
    expect(marketPath("/shop")).toBe("/shop");
    expect(marketPath("/shop", "de")).toBe("/shop");
    expect(marketPath("/shop", "za")).toBe("/shop");
    expect(marketPath("/")).toBe("/");
    expect(marketPath("/product/rt3-reta")).toBe("/product/rt3-reta");
  });

  it("is identity for legal-page paths", () => {
    for (const p of ["/impressum", "/terms", "/privacy", "/shipping", "/refund"]) {
      expect(marketPath(p)).toBe(p);
      expect(marketPath(p, "de")).toBe(p);
      expect(marketPath(p, "za")).toBe(p);
    }
  });
});

describe("detectMarket", () => {
  it("always returns 'default' (single-market site)", () => {
    expect(detectMarket("/")).toBe("default");
    expect(detectMarket("/de/shop")).toBe("default");
    expect(detectMarket("/za")).toBe("default");
  });
});

describe("buildAlternates", () => {
  it.each([
    "/",
    "/shop",
    "/cart",
    "/checkout",
    "/impressum",
    "/terms",
    "/privacy",
    "/shipping",
    "/refund",
    "/product/rt3-reta",
  ])("emits canonical en-ZA + en + x-default for %s", (path) => {
    const alts = buildAlternates(path);
    const map = Object.fromEntries(alts.map((a) => [a.hrefLang, a.href]));
    expect(map["en-ZA"]).toBeTruthy();
    expect(map["en"]).toBe(map["en-ZA"]);
    expect(map["x-default"]).toBe(map["en-ZA"]);
    expect(map["de-DE"]).toBeUndefined();
  });
});
