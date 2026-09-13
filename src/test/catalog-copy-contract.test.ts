import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { products } from "@/data/products";

const source = (...parts: string[]) => readFileSync(resolve(process.cwd(), ...parts), "utf8");

describe("catalogue copy contract", () => {
  it("keeps every catalogue product available for purchase", () => {
    expect(products.length).toBeGreaterThan(0);
    expect(products.every((product) => product.inStock)).toBe(true);
  });

  it("describes the BPC/TB-500 product as a powder vial with primary research links", () => {
    const product = products.find((item) => item.slug === "bpc-tb500-blend");

    expect(product).toBeDefined();
    expect(product?.description).toMatch(/synthetic, lyophilised peptide powder/i);
    expect(product?.description).toMatch(/rat injury studies/i);
    expect(product?.description).toMatch(/not proof of the same outcome in people/i);
    expect(product?.researchReferences).toHaveLength(3);
    expect(product?.researchReferences?.every((reference) => reference.url.startsWith("https://pubmed.ncbi.nlm.nih.gov/"))).toBe(true);
  });

  it("does not reintroduce false sale restrictions or BPC liquid-route copy", () => {
    const files = [
      source("src", "data", "products.ts"),
      source("src", "pages", "ShopPage.tsx"),
      source("src", "pages", "BuildYourStackPage.tsx"),
      source("src", "components", "Footer.tsx"),
      source("src", "data", "blog", "posts", "bpc-157-protocol-cape-town.ts"),
      source("supabase", "functions", "generate-protocol", "index.ts"),
    ].join("\n");

    expect(files).not.toMatch(/not available for sale|not for sale|sold out|out of stock/i);
    expect(files).not.toMatch(/BPC.{0,80}oral|oral.{0,80}BPC/i);
    expect(files).not.toMatch(/not for human or animal use/i);
  });
});
