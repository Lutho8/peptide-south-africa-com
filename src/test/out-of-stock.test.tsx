import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StockBadge from "@/components/StockBadge";
import { getProductBySlug, products } from "@/data/products";
import { productSchema } from "@/lib/seo";

/**
 * Out-of-stock weight-loss set (rt3-reta, tesamorelin, tz2-tirz).
 * Founder directive 2026-08-29: the weight-loss products are out of stock and
 * must be clearly labelled "Pre-Order — Reserve Yours!" and non-purchasable
 * while inventory is restocked.
 */
const OUT_OF_STOCK_SLUGS = ["rt3-reta", "tesamorelin", "tz2-tirz"];

describe("out-of-stock weight-loss products", () => {
  it("all three weight-loss products are marked out of stock with zero units", () => {
    for (const slug of OUT_OF_STOCK_SLUGS) {
      const product = getProductBySlug(slug);
      expect(product, `product ${slug}`).toBeDefined();
      expect(product!.inStock, slug).toBe(false);
      expect(product!.stock, slug).toBe(0);
    }
  });

  it("every other catalog product remains in stock", () => {
    for (const p of products.filter((p) => !OUT_OF_STOCK_SLUGS.includes(p.slug))) {
      expect(p.inStock, p.slug).toBe(true);
    }
  });

  it("StockBadge renders the 'Pre-Order — Reserve Yours!' label for out-of-stock products", () => {
    render(<StockBadge product={getProductBySlug("rt3-reta")!} />);
    expect(screen.getByText("Pre-Order — Reserve Yours!")).toBeInTheDocument();
  });

  it("StockBadge still renders 'In Stock' for available products", () => {
    // ghk-cu-50mg has stock 8 (> 5), so it takes the plain in-stock branch.
    render(<StockBadge product={getProductBySlug("ghk-cu-50mg")!} />);
    expect(screen.getByText("In Stock")).toBeInTheDocument();
  });

  it("JSON-LD offers advertise OutOfStock for the weight-loss products", () => {
    for (const slug of OUT_OF_STOCK_SLUGS) {
      const schema = productSchema(getProductBySlug(slug)!) as {
        offers: { availability: string };
      };
      expect(schema.offers.availability, slug).toBe("https://schema.org/OutOfStock");
    }
  });
});
