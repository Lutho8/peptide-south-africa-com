import { describe, it, expect } from "vitest";
import { products } from "@/data/products";
import { productSchema } from "@/lib/seo";

const slugs = [
  "kpv",
  "thymosin-alpha-1",
  "ara-290",
  "ss-31",
  "pinealon",
  "epitalon",
  "selank",
  "semax",
];

describe("new peptide JSON-LD Product schema", () => {
  for (const slug of slugs) {
    it(`${slug}: offers priceCurrency=ZAR, availability=InStock, areaServed=ZA`, () => {
      const p = products.find((x) => x.slug === slug);
      expect(p, slug).toBeDefined();
      const schema = productSchema({
        name: p!.name,
        slug: p!.slug,
        description: p!.description,
        price: p!.price,
        image: typeof p!.image === "string" ? p!.image : "",
        category: p!.category,
        purity: p!.purity,
        inStock: p!.inStock,
        sku: p!.sku,
      }) as any;
      expect(schema.offers.priceCurrency).toBe("ZAR");
      expect(schema.offers.price).toBe(Math.round(p!.price));
      expect(schema.offers.availability).toBe("https://schema.org/InStock");
      expect(schema.offers.areaServed.name).toBe("ZA");
    });
  }
});
