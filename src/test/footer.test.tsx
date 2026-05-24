import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock auth hook so Footer renders without Supabase/session.
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: null,
    isAdmin: false,
    signOut: async () => {},
  }),
}));

// Mock nocobase capture to avoid network in newsletter form.
vi.mock("@/lib/nocobase", () => ({
  captureLead: vi.fn(),
}));

// Skip the payments-banner image grid in tests.
vi.mock("@/components/PaymentMethodsBanner", () => ({
  default: () => null,
}));

import Footer from "@/components/Footer";

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  );
}

describe("Footer legal bar", () => {
  it("renders all five legal links in the canonical order", () => {
    renderFooter();
    const nav = screen.getByRole("navigation", { name: /legal/i });
    const links = within(nav).getAllByRole("link");
    expect(links.map((l) => l.textContent)).toEqual([
      "Impressum",
      "Terms & Conditions",
      "Privacy Policy",
      "Shipping Policy",
      "Refund Policy",
    ]);
  });

  it("points each legal link at the expected canonical path", () => {
    renderFooter();
    const nav = screen.getByRole("navigation", { name: /legal/i });
    const expected: Record<string, string> = {
      Impressum: "/impressum",
      "Terms & Conditions": "/terms",
      "Privacy Policy": "/privacy",
      "Shipping Policy": "/shipping",
      "Refund Policy": "/refund",
    };
    for (const [label, href] of Object.entries(expected)) {
      const link = within(nav).getByRole("link", { name: label });
      expect(link.getAttribute("href")).toBe(href);
    }
  });

  it("renders Impressum as the first link in the legal bar", () => {
    renderFooter();
    const nav = screen.getByRole("navigation", { name: /legal/i });
    const firstLink = within(nav).getAllByRole("link")[0];
    expect(firstLink.textContent).toBe("Impressum");
    expect(firstLink.getAttribute("href")).toBe("/impressum");
  });
});
