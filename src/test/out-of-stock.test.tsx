import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StockBadge from "@/components/StockBadge";
import { getProductBySlug, products } from "@/data/products";

/**
 * Out-of-stock weight-loss flagship (RT3 / retatrutide).
 * Founder directive 2026-08-29: the weight-loss product is out of stock and
 * must be clearly labelled and non-purchasable while inventory is restocked.
 */
describe("out-of-stock weight-loss product (rt3-reta)", () => {
  it("is marked out of stock in the catalog with zero units", () => {
    const rt3 = getProductBySlug("rt3-reta");
    expect(rt3, "product rt3-reta").toBeDefined();
    expect(rt3!.inStock).toBe(false);
    expect(rt3!.stock).toBe(0);
  });

  it("every other catalog product remains in stock", () => {
    for (const p of products.filter((p) => p.slug !== "rt3-reta")) {
      expect(p.inStock, p.slug).toBe(true);
    }
  });

  it("StockBadge renders a muted 'Out of Stock' label for rt3-reta", () => {
    render(<StockBadge product={getProductBySlug("rt3-reta")!} />);
    expect(screen.getByText("Out of Stock")).toBeInTheDocument();
  });

  it("StockBadge still renders 'In Stock' for available products", () => {
    // ghk-cu-50mg has stock 8 (> 5), so it takes the plain in-stock branch.
    render(<StockBadge product={getProductBySlug("ghk-cu-50mg")!} />);
    expect(screen.getByText("In Stock")).toBeInTheDocument();
  });
});
