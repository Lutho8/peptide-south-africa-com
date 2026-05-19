import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

// --- Mocks for providers / network -----------------------------------------
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
      upsert: async () => ({ data: null, error: null }),
      delete: () => ({ eq: async () => ({ data: null, error: null }) }),
    }),
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    functions: { invoke: async () => ({ data: null, error: null }) },
  },
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: null, isAdmin: false, signOut: () => {}, refreshOrders: async () => {} }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/context/CurrencyContext", () => ({
  useCurrency: () => ({
    currency: "EUR",
    rate: 20,
    format: (n: number) => `€${n.toFixed(2)}`,
    display: (n: number) => ({ primary: `€${n.toFixed(2)}`, secondary: null }),
    convert: (n: number) => n,
  }),
  CurrencyProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockCart = {
  items: [
    {
      lineId: "l1",
      product: { id: "1", name: "RT3", slug: "rt3-reta", image: "/x.png", category: "GLP" },
      variantLabel: "5mg",
      unitPrice: 23.2,
      quantity: 1,
    },
  ],
  isCartOpen: true,
  setIsCartOpen: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  addToCart: () => {},
  subtotal: 23.2,
  totalPrice: 23.2,
  discountAmount: 0,
  discountCode: "RIDETHETIDE10",
  isDiscountEligible: false,
  totalItems: 1,
  clearCart: () => {},
};

vi.mock("@/context/CartContext", () => ({
  useCart: () => mockCart,
  CartProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// --- Helpers ---------------------------------------------------------------
function renderAt(path: string, ui: React.ReactNode) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>
    </HelmetProvider>,
  );
}

const hrefs = (testId?: string) =>
  Array.from(
    (testId ? screen.getByTestId(testId) : document.body).querySelectorAll("a[href]"),
  ).map((a) => a.getAttribute("href") || "");

beforeEach(() => cleanup());

// --- Imports under test (after mocks) --------------------------------------
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import CartPage from "@/pages/CartPage";
import { products } from "@/data/products";
import { marketPath, buildAlternates } from "@/hooks/useMarket";

const product = products[0]; // RT3 (multi-variant)

// ---------------------------------------------------------------------------
describe("marketPath helper", () => {
  it("prefixes /de and /za, keeps default unprefixed", () => {
    expect(marketPath("/shop", "default")).toBe("/shop");
    expect(marketPath("/shop", "de")).toBe("/de/shop");
    expect(marketPath("/shop", "za")).toBe("/za/shop");
    expect(marketPath("/", "de")).toBe("/de");
    expect(marketPath("/product/rt3-reta", "za")).toBe("/za/product/rt3-reta");
  });
});

describe.each([
  { market: "de", base: "/de" },
  { market: "za", base: "/za" },
] as const)("market-aware navigation under $base", ({ base }) => {
  it("ProductCard links to /{market}/product/:slug and #variants", () => {
    renderAt(`${base}/shop`, <ProductCard product={product} />);
    const all = hrefs();
    expect(all).toContain(`${base}/product/${product.slug}`);
    // Multi-variant CTA navigates; assert button label is "Select Size"
    expect(screen.getByText(/select size/i)).toBeInTheDocument();
  });

  it("Footer shop + impressum links carry market prefix", () => {
    renderAt(`${base}/`, <Footer />);
    const all = hrefs();
    expect(all).toContain(`${base}/shop`);
    expect(all).toContain(`${base}/impressum`);
    expect(all).toContain(`${base}/shop?category=Weight+Loss`);
  });

  it("CartDrawer checkout + view-cart CTAs use market prefix", () => {
    renderAt(`${base}/`, <CartDrawer />);
    const all = hrefs();
    expect(all).toContain(`${base}/checkout`);
    expect(all).toContain(`${base}/cart`);
  });

  it("CartPage continue-shopping + checkout link with market prefix", () => {
    renderAt(`${base}/cart`, <CartPage />);
    const all = hrefs();
    expect(all).toContain(`${base}/shop`);
    expect(all).toContain(`${base}/checkout`);
    expect(all).toContain(`${base}/product/${product.slug}`);
  });
});

// ---------------------------------------------------------------------------
describe("hreflang alternates", () => {
  it.each([
    "/",
    "/shop",
    "/cart",
    "/checkout",
    "/checkout/success",
    "/checkout/cancel",
    "/impressum",
    "/product/rt3-reta",
  ])("buildAlternates(%s) emits 4 reciprocal entries", (path) => {
    const alts = buildAlternates(path);
    const map = Object.fromEntries(alts.map((a) => [a.hrefLang, a.href]));
    expect(map["en"]).toContain(path === "/" ? "ridethetide.site" : path);
    expect(map["de-DE"]).toContain(`/de${path === "/" ? "" : path}`);
    expect(map["en-ZA"]).toContain(`/za${path === "/" ? "" : path}`);
    expect(map["x-default"]).toBe(map["en"]);
  });
});
