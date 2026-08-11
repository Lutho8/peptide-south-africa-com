import { render, screen } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import BlogPostPage from "@/pages/BlogPostPage";

function renderArticle() {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={["/blog/retatrutide-heart-rate-clinical-trial-evidence"]}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPostPage />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe("retatrutide research-education article", () => {
  it("renders the approved research-only disclaimer and no pathway CTA or related cards", () => {
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
  });
});
