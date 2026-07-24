import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

/**
 * Empty-state coverage for CheckoutSuppliesRail. Playwright is the wrong
 * tool for this (the component returns null and renders no DOM), so we
 * assert it here by mocking the supplies slug list to empty.
 */

vi.mock("@/data/bundles", () => ({
  CHECKOUT_SUPPLIES_SLUGS: [] as string[],
}));

vi.mock("@/context/CartContext", () => ({
  useCart: () => ({ items: [], addToCart: vi.fn(), updateQuantity: vi.fn() }),
}));

vi.mock("@/context/CurrencyContext", () => ({
  useCurrency: () => ({ format: (n: number) => `R${n}` }),
}));

import CheckoutSuppliesRail from "@/components/CheckoutSuppliesRail";

describe("CheckoutSuppliesRail — empty state", () => {
  it("renders nothing when no in-stock supplies are configured", () => {
    const { container } = render(
      <MemoryRouter>
        <CheckoutSuppliesRail />
      </MemoryRouter>,
    );
    expect(container.firstChild).toBeNull();
    expect(container.querySelector('[data-testid="checkout-supplies-rail"]')).toBeNull();
  });
});
