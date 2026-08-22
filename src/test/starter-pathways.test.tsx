import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  STARTER_PATHWAYS,
  STORE_LINKS,
  guidedReviewLink,
  productStoreLink,
  resolveStarterProducts,
  starterBuilderLink,
} from "@/data/starterPathways";

vi.mock("@/components/SEO", () => ({ default: () => null }));
vi.mock("@/components/JsonLd", () => ({ default: () => null }));

import StarterPathwaysPage from "@/pages/StarterPathwaysPage";

describe("new-customer starter pathways", () => {
  it("defines one resolvable five-product research map for each decade", () => {
    expect(STARTER_PATHWAYS.map((pathway) => pathway.id)).toEqual(["30s", "40s", "50s", "60s"]);
    for (const pathway of STARTER_PATHWAYS) {
      expect(pathway.slugs).toHaveLength(5);
      const products = resolveStarterProducts(pathway);
      expect(products).toHaveLength(5);
      expect(products.every((product) => (product.track ?? "RUO") === "RUO")).toBe(true);
    }
  });

  it("builds canonical internal links for store, guided review and product pages", () => {
    expect(STORE_LINKS.startHere).toBe("/start-here");
    expect(starterBuilderLink("40s")).toBe("/build-your-stack?starter=40s");
    expect(guidedReviewLink("50s")).toBe("/quiz?intent=consult&ageBand=50s");
    expect(productStoreLink("ss-31")).toBe("/product/ss-31");
  });

  it("renders obvious guided, research-store and dashboard actions", () => {
    render(<MemoryRouter><StarterPathwaysPage /></MemoryRouter>);
    expect(screen.getByRole("link", { name: /Start guided assessment/i })).toHaveAttribute("href", STORE_LINKS.guidedReview);
    expect(screen.getByRole("link", { name: /Browse research catalog/i })).toHaveAttribute("href", STORE_LINKS.researchShop);
    expect(screen.getByRole("link", { name: /Open customer dashboard/i })).toHaveAttribute("href", STORE_LINKS.account);
    expect(screen.getAllByRole("link", { name: /Open prefilled research stack/i })).toHaveLength(4);
  });
});
