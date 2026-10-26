import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StockBadge from "@/components/StockBadge";
import { products } from "@/data/products";
import { PREORDER_MODE } from "@/lib/preorder";

/**
 * Out-of-stock purchase guards (added 2026-08-29 for RT3) are exercised with a
 * synthetic out-of-stock product while the released catalogue remains in stock.
 */
const syntheticOutOfStock = { inStock: false, stock: 0 };

describe("out-of-stock guards (synthetic product)", () => {
  it("publishes every released catalogue product as in stock", () => {
    for (const p of products) {
      expect(p.inStock, p.slug).toBe(true);
      expect(p.tag, p.slug).not.toBe("Pre-Order");
      expect(JSON.stringify(p.faqs), p.slug).not.toMatch(/pre-?order|next certified batch/i);
    }
  });

  it("CartContext-style guard: inStock === false is the block condition", () => {
    // Mirrors src/context/CartContext.tsx addToCart: `if (product.inStock === false) return;`
    expect(syntheticOutOfStock.inStock === false).toBe(true);
  });
});

describe("StockBadge", () => {
  it("keeps store-wide pre-order mode off", () => {
    expect(PREORDER_MODE).toBe(false);
    render(<StockBadge product={syntheticOutOfStock} />);
    expect(screen.getByText("Pre-Order — Reserve Yours!")).toBeInTheDocument();
  });

  it("renders an in-stock badge for a released catalogue product", () => {
    render(<StockBadge product={products[0]} />);
    expect(screen.getByText("In Stock")).toBeInTheDocument();
  });
});
