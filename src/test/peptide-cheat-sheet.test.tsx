import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import BlogBody from "@/components/blog/BlogBody";
import { getPost } from "@/data/blog";
import { getBlogImage } from "@/lib/blogImages";

describe("Peptide cheat sheet publisher contract", () => {
  const post = getPost("peptide-cheat-sheet-south-africa");

  it("publishes a South African evidence-led article with authoritative sources", () => {
    expect(post).toBeDefined();
    expect(post?.keyword).toBe("peptide cheat sheet South Africa");
    expect(post?.citations.length).toBeGreaterThanOrEqual(10);
    expect(post?.citations.some((citation) => citation.url.includes("sahpra.org.za"))).toBe(true);
    expect(post?.citations.some((citation) => citation.url.includes("fda.gov"))).toBe(true);
    expect(post?.citations.some((citation) => citation.url.includes("nih.gov"))).toBe(true);
    expect(post?.citations.some((citation) => citation.url.includes("clinicaltrials.gov/study/NCT06662383"))).toBe(true);
    expect(post?.citations.find((citation) => citation.id === "11")?.label).toContain("Treadwell T");
  });

  it("distinguishes sponsor topline results from approval and peer review", () => {
    const text = post?.body.map((block) => "text" in block ? block.text : "").join(" ") ?? "";
    expect(text).toContain("sponsor releases");
    expect(text).toContain("not substitutes for complete peer-reviewed reports");
    expect(text).not.toContain("ongoing Phase 3 obesity research");
  });

  it("keeps the related retatrutide articles non-prescriptive and current", () => {
    const comparison = getPost("retatrutide-vs-tirzepatide-comparison");
    const phaseThree = getPost("retatrutide-triumph-1-phase-3-results");
    const comparisonText = comparison?.body.map((block) => "text" in block ? block.text : "").join(" ") ?? "";
    const phaseThreeText = phaseThree?.body.map((block) => "text" in block ? block.text : "").join(" ") ?? "";

    expect(comparisonText).toContain("28.3%");
    expect(comparisonText).toContain("sponsor release");
    expect(comparison?.citations.some((citation) => citation.url.includes("NCT06662383"))).toBe(true);
    expect(phaseThree?.updatedAt).toBe("2026-08-31");
    expect(phaseThreeText).not.toContain("12-week structured cycles");
    expect(phaseThreeText).not.toContain("9 mg sweet spot");
    expect(phaseThreeText).not.toContain("clinically meaningful entry point");
  });

  it("uses a slug-specific hero image instead of the generic Guides image", () => {
    expect(getBlogImage("Guides", post?.slug)).not.toBe(getBlogImage("Guides"));
  });

  it("renders the evidence table accessibly", () => {
    const table = post?.body.find((block) => block.type === "table");
    expect(table).toBeDefined();
    render(<BlogBody blocks={table ? [table] : []} />);
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Pairing verdict")).toBeInTheDocument();
    expect(screen.getByText("Tirzepatide")).toBeInTheDocument();
  });
});
