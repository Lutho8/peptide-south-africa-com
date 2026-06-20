/**
 * End-to-end-style coverage for the quiz -> shop deep-link contract.
 *
 * Two passes per outcome:
 *   1. URL derivation matches the canonical QuizFunnelPage logic and points to
 *      the right product / stack / category.
 *   2. Following the URL into CartProvider and adding the stack results in the
 *      expected product IDs sitting in the cart (preservation guarantee).
 *
 * We avoid mounting the whole ShopPage (heavy SEO/Supabase deps) and instead
 * exercise the same matching + cart-add path the page uses.
 */
import { describe, it, expect, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { type ReactNode } from "react";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: null, isAdmin: false, hasFirstOrder: null, signOut: async () => {} }),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: () => ({ delete: () => ({ eq: () => Promise.resolve({}) }), upsert: () => Promise.resolve({}) }) },
}));

import { products } from "@/data/products";
import { CartProvider, useCart } from "@/context/CartContext";
import { QUIZ_OUTCOMES, deriveDeepLink } from "./fixtures/quiz-outcomes";

const wrapper = ({ children }: { children: ReactNode }) => <CartProvider>{children}</CartProvider>;

describe("Quiz deep-link routing", () => {
  for (const tc of QUIZ_OUTCOMES) {
    it(`routes "${tc.name}" to the correct ${tc.expectedKind} URL`, () => {
      const { matchedIds, url, kind } = deriveDeepLink(tc.peptides, tc.goal, products);
      expect(kind).toBe(tc.expectedKind);
      expect(matchedIds).toEqual(tc.expectedProductIds);
      expect(url).toBe(tc.expectedUrl(matchedIds));
    });
  }
});

describe("Quiz deep-link cart preservation", () => {
  for (const tc of QUIZ_OUTCOMES.filter((c) => c.expectedKind === "stack")) {
    it(`"${tc.name}" — visiting /shop?stack=... and adding preserves all items`, () => {
      // Parse the deep-link the way ShopPage does.
      const url = new URL(tc.expectedUrl(tc.expectedProductIds), "http://test.local");
      const stackIds = (url.searchParams.get("stack") ?? "").split(",").filter(Boolean);
      const byId = new Map(products.map((p) => [p.id, p]));
      const stackProducts = stackIds.map((id) => byId.get(id)!).filter(Boolean);
      expect(stackProducts.map((p) => p.id)).toEqual(tc.expectedProductIds);

      const { result } = renderHook(() => useCart(), { wrapper });
      expect(result.current.items).toEqual([]);

      act(() => {
        stackProducts.forEach((p) => {
          const v = p.variants?.[0];
          result.current.addToCart(p, v ? { variantLabel: v.label, unitPrice: v.price, silent: true } : { silent: true });
        });
      });

      const cartIds = result.current.items.map((i) => i.product.id).sort();
      expect(cartIds).toEqual([...tc.expectedProductIds].sort());
      expect(result.current.totalItems).toBe(tc.expectedProductIds.length);
    });
  }

  it("single-product outcome adds exactly that product", () => {
    const tc = QUIZ_OUTCOMES.find((c) => c.expectedKind === "product")!;
    const { result } = renderHook(() => useCart(), { wrapper });
    const product = products.find((p) => p.id === tc.expectedProductIds[0])!;
    act(() => {
      const v = product.variants?.[0];
      result.current.addToCart(product, v ? { variantLabel: v.label, unitPrice: v.price, silent: true } : { silent: true });
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].product.id).toBe(tc.expectedProductIds[0]);
  });
});
