import { render, screen } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import AppShell from "@/AppShell";

function renderArticle() {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={["/blog/retatrutide-heart-rate-clinical-trial-evidence"]}>
        <AppShell />
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe("retatrutide research-education article", () => {
  it("renders the approved article in an education-only shell", () => {
    renderArticle();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Retatrutide and Heart Rate: What the Evidence Actually Shows",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/No South African regulatory-status or availability claim is made here/),
    ).toHaveLength(2);
    expect(screen.queryByText("Cape Town Peptide Club")).not.toBeInTheDocument();
    expect(screen.queryByText("Visit the Club")).not.toBeInTheDocument();
    expect(screen.queryByText("Keep reading")).not.toBeInTheDocument();
    expect(screen.queryByText("Shop")).not.toBeInTheDocument();
    expect(screen.queryByText("Book Consult")).not.toBeInTheDocument();
    expect(screen.queryByText("Peptides4Pets")).not.toBeInTheDocument();
    expect(screen.queryByText("WhatsApp Community")).not.toBeInTheDocument();
    expect(screen.queryByText("For Clinicians")).not.toBeInTheDocument();
    expect(screen.queryByText("Affiliate Program")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Text us on WhatsApp")).not.toBeInTheDocument();
    expect(
      screen.getByText(/No products, services, protocols or treatment pathways are offered/),
    ).toBeInTheDocument();
  });
});
