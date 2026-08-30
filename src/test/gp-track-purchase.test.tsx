import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: null }),
}));

import ProductCard from "@/components/ProductCard";
import { CartProvider, useCart } from "@/context/CartContext";
import { products } from "@/data/products";

function RouteProbe() {
  const location = useLocation();
  const { totalItems } = useCart();
  return <output data-testid="route-probe">{location.pathname}{location.search}|{totalItems}</output>;
}

function renderCard(slug: string) {
  const product = products.find((candidate) => candidate.slug === slug)!;
  return render(
    <MemoryRouter initialEntries={["/shop"]}>
      <CartProvider>
        <ProductCard product={product} />
        <RouteProbe />
      </CartProvider>
    </MemoryRouter>,
  );
}

describe("GP-track purchase routing", () => {
  it("out-of-stock GP-track product shows the pre-order CTA and routes to the PDP", () => {
    // Both GP-track products (rt3-reta, tz2-tirz) are currently out of stock;
    // the OOS pre-order state overrides the BOOK CONSULT routing.
    renderCard("rt3-reta");
    fireEvent.click(screen.getByRole("button", { name: /pre-order — reserve yours!/i }));
    expect(screen.getByTestId("route-probe")).toHaveTextContent("/product/rt3-reta|0");
  });

  it("still adds an RUO product directly to the cart", () => {
    renderCard("ghk-cu-50mg");
    fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));
    expect(screen.getByTestId("route-probe")).toHaveTextContent("/shop|1");
  });
});
