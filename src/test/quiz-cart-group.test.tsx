import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: null }),
}));

import { CartProvider, useCart } from "@/context/CartContext";
import { products } from "@/data/products";

const wrapper = ({ children }: { children: ReactNode }) => <CartProvider>{children}</CartProvider>;

describe("quiz cart group replacement", () => {
  beforeEach(() => window.localStorage.clear());

  it("replaces a previous quiz plan without duplicating its products", () => {
    const product = products.find((candidate) => candidate.slug === "bpc-tb500-blend")!;
    const threePack = product.variants!.find((variant) => variant.pack === 3)!;
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.replaceCartGroup("quiz-protocol", [{
        product,
        variantLabel: threePack.label,
        unitPrice: threePack.price,
        quantity: 1,
      }]);
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(1);

    act(() => {
      result.current.replaceCartGroup("quiz-protocol", [{
        product,
        variantLabel: threePack.label,
        unitPrice: threePack.price,
        quantity: 2,
      }]);
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.subtotal).toBe(threePack.price * 2);
  });

  it("preserves manually added cart lines when the quiz plan changes", () => {
    const product = products.find((candidate) => candidate.slug === "bpc-tb500-blend")!;
    const threePack = product.variants!.find((variant) => variant.pack === 3)!;
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addToCart(product));
    act(() => {
      result.current.replaceCartGroup("quiz-protocol", [{
        product,
        variantLabel: threePack.label,
        unitPrice: threePack.price,
        quantity: 1,
      }]);
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items.some((item) => item.groupId === undefined)).toBe(true);
    expect(result.current.items.some((item) => item.groupId === "quiz-protocol")).toBe(true);
  });
});
