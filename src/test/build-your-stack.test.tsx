import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Auth without Supabase session; cart snapshot effect no-ops when user is null.
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: null, hasFirstOrder: undefined }),
}));

// SEO/JsonLd use react-helmet-async, which needs a HelmetProvider — not under test here.
vi.mock("@/components/SEO", () => ({ default: () => null }));
vi.mock("@/components/JsonLd", () => ({ default: () => null }));

import { CartProvider, useCart } from "@/context/CartContext";
import BuildYourStackPage from "@/pages/BuildYourStackPage";

function CartProbe() {
  const { items } = useCart();
  const bundleLines = items.filter((i) => i.bundleId);
  return (
    <div data-testid="cart-probe" data-lines={items.length} data-bundle-lines={bundleLines.length} />
  );
}

function renderBuilder(route = "/build-your-stack") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <CartProvider>
        <BuildYourStackPage />
        <CartProbe />
      </CartProvider>
    </MemoryRouter>,
  );
}

describe("BuildYourStackPage", () => {
  it("renders 5 selector slots by default and switches to 10", () => {
    renderBuilder();
    expect(screen.getAllByLabelText(/Vial \d+/)).toHaveLength(5);
    fireEvent.click(screen.getByRole("button", { name: /10-Pack · 30% off/ }));
    expect(screen.getAllByLabelText(/Vial \d+/)).toHaveLength(10);
  });

  it("prefills slot 1 from the ?prefill= query param", () => {
    renderBuilder("/build-your-stack?prefill=selank");
    const first = screen.getByLabelText("Vial 1") as HTMLSelectElement;
    expect(first.value).toBe("selank");
  });

  it("adds a complete in-stock 5-pack to the cart as grouped bundle lines", () => {
    renderBuilder();
    const slugs = ["selank", "semax", "pinealon", "epitalon", "kpv"]; // all in stock
    slugs.forEach((slug, i) => {
      fireEvent.change(screen.getByLabelText(`Vial ${i + 1}`), { target: { value: slug } });
    });
    fireEvent.click(screen.getAllByRole("button", { name: /Add 5-Pack to Cart/ })[0]);
    const probe = screen.getByTestId("cart-probe");
    expect(probe.dataset.lines).toBe("5");
    expect(probe.dataset.bundleLines).toBe("5");
  });

  it("blocks add-to-cart while a selected vial is out of stock", () => {
    renderBuilder();
    // klow80 is out of stock — options are disabled, so force via change event
    // on an enabled selection set that includes it through the curated stack.
    fireEvent.click(screen.getByRole("button", { name: /Longevity Stack/ }));
    const addButtons = screen.getAllByRole("button", { name: /Add 5-Pack/ });
    expect((addButtons[0] as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getAllByText(/out of stock — swap/i).length).toBeGreaterThan(0);
  });
});
