import { describe, expect, it } from "vitest";
import { getProductBySlug } from "@/data/products";
import { quoteCheckout, variantPrice } from "../../supabase/functions/_shared/pricing";
import { CATALOG_VERSION, validateStorefrontRequest } from "../../supabase/functions/_shared/catalog-release";

describe("DUSK authoritative checkout", () => {
  it.each([["selank",799],["semax",699],["cerebrolysin",599],["epitalon",599],["pinealon",620]] as const)("quotes %s at its advertised single-vial price", (slug,price) => {
    const product=getProductBySlug(slug)!;
    expect(product.inStock).toBe(true);
    expect(product.documentationPending).toBe(true);
    expect(product.price).toBe(price);
    expect(variantPrice(slug,"Single Vial")).toBe(price);
    const quote=quoteCheckout([{kind:"item",slug,sku:product.sku,variantLabel:"Single Vial",quantity:1}]);
    expect(quote.subtotal).toBe(price);
    expect(quote.shipping).toBe(89);
    expect(quote.total).toBe(price+89);
  });
  it("charges the three core single vials at R2,018 with free shipping, without an implicit blend discount", () => {
    const quote=quoteCheckout(["epitalon","pinealon","selank"].map(slug=>({kind:"item" as const,slug,variantLabel:"Single Vial",quantity:1})));
    expect(quote.subtotal).toBe(2018);
    expect(quote.total).toBe(2018);
    expect(quote.shipping).toBe(0);
    expect(quote.savings).toBe(0);
  });
  it("requires the new catalogue version to prevent stale-price checkout", () => {
    expect(()=>validateStorefrontRequest({catalogVersion:CATALOG_VERSION})).not.toThrow();
    expect(()=>validateStorefrontRequest({catalogVersion:"psa-sa-stock-2026-09-27"})).toThrow(/catalogue changed/);
  });
});
