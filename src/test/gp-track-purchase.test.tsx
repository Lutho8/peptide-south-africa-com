import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: null }),
}));

import ProductCard from "@/components/ProductCard";
import { CartProvider, useCart } from "@/context/CartContext";
import { products, type Product } from "@/data/products";

function RouteProbe() {
  const location = useLocation();
  const { totalItems } = useCart();
  return <output data-testid="route-probe">{location.pathname}{location.search}|{totalItems}</output>;
}

function renderCard(slug: string, override?: Partial<Product>) {
  const product = { ...products.find((candidate) => candidate.slug === slug)!, ...override };
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
  it("keeps the future GP-track route isolated from direct checkout", () => {
    renderCard("rt3-reta", { track: "GP" });
    fireEvent.click(screen.getByRole("button", { name: /book consult/i }));
    expect(screen.getByTestId("route-probe")).toHaveTextContent("/quiz?intent=consult|0");
  });

  it("adds a current RUO catalogue product directly to the cart", () => {
    renderCard("rt3-reta");
    fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));
    expect(screen.getByTestId("route-probe")).toHaveTextContent("/shop|1");
  });
});
