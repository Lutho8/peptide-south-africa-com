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
