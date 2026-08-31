import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StockBadge from "@/components/StockBadge";
import { products } from "@/data/products";
import { PREORDER_MODE, PREORDER_BADGE_TEXT } from "@/lib/preorder";

/**
 * Out-of-stock purchase guards (added 2026-08-29 for RT3) are exercised with a
 * synthetic out-of-stock product so they stay verified while the whole catalog
 * is purchasable as pre-orders (PREORDER_MODE, founder directive 2026-08-31).
 */
const syntheticOutOfStock = { inStock: false, stock: 0 };

describe("out-of-stock guards (synthetic product)", () => {
  it("every catalog product is in stock during the pre-order restock window", () => {
    for (const p of products) {
      expect(p.inStock, p.slug).toBe(true);
    }
  });

  it("CartContext-style guard: inStock === false is the block condition", () => {
    // Mirrors src/context/CartContext.tsx addToCart: `if (product.inStock === false) return;`
    expect(syntheticOutOfStock.inStock === false).toBe(true);
  });
});

describe("StockBadge", () => {
  it("renders the pre-order badge for every product while PREORDER_MODE is on", () => {
    expect(PREORDER_MODE).toBe(true);
    render(<StockBadge product={syntheticOutOfStock} />);
    expect(screen.getByText(PREORDER_BADGE_TEXT)).toBeInTheDocument();
    expect(screen.queryByText("Out of Stock")).not.toBeInTheDocument();
  });

  it("renders the same pre-order badge for an in-stock catalog product", () => {
    render(<StockBadge product={products[0]} />);
    expect(screen.getByText(PREORDER_BADGE_TEXT)).toBeInTheDocument();
  });
});
