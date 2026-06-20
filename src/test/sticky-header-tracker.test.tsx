/**
 * Verifies the Peptide Tracker CTA:
 *   - is rendered as a high-contrast control in the sticky header (desktop nav
 *     + mobile menu), and
 *   - appears in the bottom sticky mobile bar after the user scrolls past the
 *     trigger threshold, and stays present across route changes.
 *
 * Heavy app providers (Supabase auth, cart persistence) are mocked so the test
 * stays focused on UI contract.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: null, isAdmin: false, hasFirstOrder: null, signOut: async () => {} }),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: () => ({ delete: () => ({ eq: () => Promise.resolve({}) }), upsert: () => Promise.resolve({}) }) },
}));

import Header from "@/components/Header";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import { CartProvider } from "@/context/CartContext";
import { TRACKER_URL } from "@/lib/contact";

const ROUTES = ["/", "/shop", "/quiz", "/research"];

function renderAt(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <CartProvider>
        <Routes>
          <Route path="*" element={<>
            <Header />
            <StickyMobileCTA />
            <div style={{ height: 2000 }} />
          </>} />
        </Routes>
      </CartProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  // Force mobile viewport for jsdom.
  Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 844 });
  window.scrollY = 0;
});

afterEach(() => cleanup());

describe("Peptide Tracker CTA – sticky header & mobile bar", () => {
  it.each(ROUTES)("renders a high-contrast Peptide Tracker link in the mobile menu on %s", (route) => {
    renderAt(route);
    const header = screen.getByRole("banner");
    const toggle = within(header).getByRole("button", { name: /toggle menu/i });
    fireEvent.click(toggle);

    // The mobile menu is the <nav> with `lg:hidden`; the desktop nav uses `hidden lg:flex`.
    const navs = within(header).getAllByRole("navigation");
    const mobileNav = navs.find((n) => n.className.includes("lg:hidden") && !n.className.includes("hidden lg:"));
    expect(mobileNav, "expected mobile nav to mount after toggle").toBeTruthy();

    const trackerLinks = within(mobileNav!).getAllByRole("link", { name: /peptide tracker/i });
    expect(trackerLinks.length).toBeGreaterThan(0);
    for (const link of trackerLinks) {
      expect(link).toHaveAttribute("href", TRACKER_URL);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link.className).toMatch(/font-(?:bold|semibold)/);
      // High-contrast contract in the mobile menu = primary brand colour.
      expect(link.className).toMatch(/text-primary/);
    }
  });

  it("shows the bottom sticky Tracker CTA after scrolling on the homepage", () => {
    renderAt("/");
    act(() => {
      window.scrollY = 800;
      window.dispatchEvent(new Event("scroll"));
    });
    // Scope to the StickyMobileCTA container (fixed inset-x-0 bottom-0).
    const sticky = document.querySelector("div.fixed.inset-x-0.bottom-0") as HTMLElement | null;
    expect(sticky, "expected sticky mobile CTA to render after scroll").toBeTruthy();
    const tracker = within(sticky!).getByRole("link", { name: /open peptide tracker/i });
    expect(tracker).toHaveAttribute("href", TRACKER_URL);
    expect(tracker).toHaveAttribute("target", "_blank");
    expect(tracker.className).toMatch(/border-\[#0a2540\]/);
    expect(tracker.className).toMatch(/text-\[#0a2540\]/);
    expect(tracker.className).toMatch(/font-bold/);
  });

  it("keeps the header Tracker CTA visible across simulated route changes", () => {
    for (const route of ROUTES) {
      const { unmount } = renderAt(route);
      const header = screen.getByRole("banner");
      const toggle = within(header).getByRole("button", { name: /toggle menu/i });
      fireEvent.click(toggle);
      expect(within(header).getAllByRole("link", { name: /peptide tracker/i }).length).toBeGreaterThan(0);
      unmount();
    }
  });
});
