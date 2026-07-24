import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Guardrail: FloatingVial, ProductCard, and ProductImageZoom MUST source their
 * vial styling from `src/lib/vialDesign.ts`. This test fails the build if a
 * contributor reintroduces raw `bg-vial-*` / `shadow-vial` / `ring-vial-*`
 * class literals into the two flat components (ProductCard, ProductImageZoom)
 * or removes the shared imports from any of the three.
 *
 * FloatingVial legitimately renders raw vial-token classes inside its 3D
 * markup (cap, glass, liquid, ink) so it's exempt from the class-literal ban —
 * but it MUST still import at least one token constant AND use the shared
 * VIAL_TEST_ID constant instead of a raw "vial-frame" string.
 */

const read = (p: string) =>
  readFileSync(resolve(__dirname, "..", "..", p), "utf8");

const TARGETS = {
  floatingVial: "src/components/FloatingVial.tsx",
  productCard: "src/components/ProductCard.tsx",
  productImageZoom: "src/components/ProductImageZoom.tsx",
  cartDrawer: "src/components/CartDrawer.tsx",
  cartPage: "src/pages/CartPage.tsx",
  checkoutPage: "src/pages/CheckoutPage.tsx",
  checkoutSuppliesRail: "src/components/CheckoutSuppliesRail.tsx",
} as const;

// Flat consumers must never inline raw vial class literals — all styling
// flows through `@/lib/vialDesign`. FloatingVial is exempt (see file header).
const FLAT_TARGETS: Array<[string, string]> = [
  ["productCard", TARGETS.productCard],
  ["productImageZoom", TARGETS.productImageZoom],
  ["cartDrawer", TARGETS.cartDrawer],
  ["cartPage", TARGETS.cartPage],
  ["checkoutPage", TARGETS.checkoutPage],
  ["checkoutSuppliesRail", TARGETS.checkoutSuppliesRail],
];


const RAW_VIAL_CLASS = /(?<![\w-])(?:bg-vial-[\w-]+|shadow-vial|ring-vial-[\w-]+|border-vial-[\w-]+|text-vial-[\w-]+)/g;

function stripImportLines(src: string): string {
  return src
    .split("\n")
    .filter((line) => !/^\s*import\s/.test(line))
    .join("\n");
}

describe("vial design tokens guardrail", () => {
  it.each(Object.entries(TARGETS))(
    "%s imports from @/lib/vialDesign",
    (_name, path) => {
      const src = read(path);
      expect(src).toMatch(/from ["']@\/lib\/vialDesign["']/);
    },
  );

  it.each(Object.entries(TARGETS))(
    "%s uses VIAL_TEST_ID constant, not a raw 'vial-frame' string literal",
    (_name, path) => {
      const src = read(path);
      // The literal string "vial-frame" may appear only inside the import
      // statement or not at all. Any `data-testid="vial-frame"` is a violation.
      expect(src).not.toMatch(/data-testid=["']vial-frame["']/);
    },
  );

  it.each(FLAT_TARGETS)(
    "%s contains no raw vial class literals outside imports",
    (_name, path) => {
      const body = stripImportLines(read(path));
      const matches = body.match(RAW_VIAL_CLASS) ?? [];
      expect(matches, `Found raw vial classes in ${path}: ${matches.join(", ")}`).toEqual([]);
    },
  );
});

