import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FloatingVial from "@/components/FloatingVial";
import ProductCard from "@/components/ProductCard";
import ProductImageZoom from "@/components/ProductImageZoom";
import { CartProvider } from "@/context/CartContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { AuthProvider } from "@/hooks/useAuth";
import { products } from "@/data/products";

// Force FloatingVial into its enabled branch (skip reduced-motion guard).
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

function withProviders(children: React.ReactNode) {
  return (
    <MemoryRouter>
      <AuthProvider>
        <CurrencyProvider>
          <CartProvider>{children}</CartProvider>
        </CurrencyProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("vial branding — white + light-teal medical/luxury tokens", () => {
  it("FloatingVial renders the shared vial tokens and label", () => {
    const { getByTestId, container } = render(<FloatingVial />);
    const node = getByTestId("floating-vial");
    const html = node.outerHTML;
    // Token-driven classes present
    expect(html).toContain("bg-vial-glass");
    expect(html).toContain("bg-vial-liquid");
    expect(html).toContain("bg-vial-cap");
    expect(html).toContain("shadow-vial");
    expect(html).toContain("text-vial-ink");
    // Wordmark preserved
    expect(container.textContent).toContain("PEPTIDE SOUTH AFRICA");
    expect(container.textContent).toContain("≥99% HPLC");
    expect(node).toMatchSnapshot();
  });

  it("ProductCard wraps the vial image in the shared studio plate", () => {
    const product = products[0];
    const { getByTestId } = render(
      withProviders(<ProductCard product={product} />),
    );
    const frame = getByTestId("vial-frame");
    expect(frame).toHaveClass("bg-vial-surface");
    expect(frame).toHaveClass("shadow-vial");
    expect(frame).toHaveClass("ring-vial-border");
    // Teal accent band + dot marker exist inside the frame
    expect(frame.querySelector(".bg-vial-accent")).not.toBeNull();
    expect(frame.querySelector(".bg-vial-accent-strong")).not.toBeNull();
    expect(frame).toMatchSnapshot();
  });

  it("ProductImageZoom (desktop) uses the shared vial tokens", () => {
    const { getByTestId } = render(
      <ProductImageZoom src="/x.jpg" alt="Vial" />,
    );
    const frame = getByTestId("vial-frame");
    expect(frame).toHaveClass("bg-vial-surface");
    expect(frame).toHaveClass("shadow-vial");
    expect(frame).toHaveClass("border-vial-border");
    expect(frame.querySelector(".bg-vial-accent")).not.toBeNull();
  });
});
