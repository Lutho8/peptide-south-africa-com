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
  it("routes a GP-track product into the medical quiz without adding it directly", () => {
    // tz2-tirz is the in-stock GP-track product (rt3-reta is currently out of
    // stock, so its card renders the OOS state instead of the quiz CTA).
    renderCard("tz2-tirz");
    fireEvent.click(screen.getByRole("button", { name: /start quiz/i }));
    expect(screen.getByTestId("route-probe")).toHaveTextContent("/quiz?product=tz2-tirz|0");
  });

  it("still adds an RUO product directly to the cart", () => {
    renderCard("ghk-cu-50mg");
    fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));
    expect(screen.getByTestId("route-probe")).toHaveTextContent("/shop|1");
  });
});
