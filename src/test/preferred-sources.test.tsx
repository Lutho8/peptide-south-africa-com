import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PreferredSourcesButton from "@/components/PreferredSourcesButton";

describe("Preferred Sources button", () => {
  it("renders Google's official declarative publisher hook", () => {
    const { container } = render(<PreferredSourcesButton />);

    expect(screen.getByText(/make us a preferred source on Google/i)).toBeInTheDocument();
    const googleButton = container.querySelector("[google-add-preferred-source-btn]");
    expect(googleButton).not.toBeNull();
    expect(googleButton).toHaveAttribute("data-theme", "light");
    expect(googleButton).toHaveAttribute("data-lang", "en");
  });
});
