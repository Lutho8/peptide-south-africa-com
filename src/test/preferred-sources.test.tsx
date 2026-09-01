import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PreferredSourcesButton from "@/components/PreferredSourcesButton";

describe("Preferred Sources button", () => {
  it("renders Google's preferred-source deep link", () => {
    render(<PreferredSourcesButton />);

    expect(screen.getByText(/make us a preferred source on Google/i)).toBeInTheDocument();
    const googleButton = screen.getByRole("link", { name: /add Peptide South Africa/i });
    expect(googleButton).toHaveAttribute(
      "href",
      "https://www.google.com/preferences/source?q=peptide-south-africa.com",
    );
    expect(googleButton).toHaveAttribute("target", "_blank");
  });

  it("loads Google's preferred-source client once for progressive enhancement", () => {
    render(<PreferredSourcesButton />);
    render(<PreferredSourcesButton compact />);

    const scripts = document.querySelectorAll(
      'script[src="https://news.google.com/swg/js/v1/publisher.js"]',
    );
    expect(scripts).toHaveLength(1);
    expect(scripts[0]).toHaveAttribute("preferred-sources-control", "manual");
  });
});
