import { describe, it, expect } from "vitest";
import { post } from "../data/blog/posts/glp-1-abdominal-pain-sahpra-reporting";
import { getBlogImage } from "../lib/blogImages";

describe("South African GLP-1 safety article", () => {
  it("preserves the actual publication date and identifies source-led analysis", () => {
    expect(post.publishedAt).toBe("2026-09-14");
    expect(post.updatedAt).toBe(post.publishedAt);
    expect(JSON.stringify(post.body)).toContain("original editorial synthesis");
    expect(JSON.stringify(post.body)).toContain("29 January 2026");
  });
  it("resolves every citation and uses only the selected authority domains", () => {
    const ids = new Set(post.citations.map(c => c.id));
    for (const match of JSON.stringify(post.body).matchAll(/<sup>(\d+)<\/sup>/g)) {
      expect(ids.has(match[1])).toBe(true);
    }
    for (const c of post.citations) {
      expect(["www.gov.uk", "www.niddk.nih.gov", "medsafety.sahpra.org.za", "www.sahpra.org.za"]).toContain(new URL(c.url).hostname);
    }
  });
  it("supplies FAQs and a unique image rather than the category fallback", () => {
    expect(post.faqs).toHaveLength(4);
    expect(getBlogImage(post.category, post.slug)).toContain("glp-1-safety-reporting-1200x675.webp");
  });
});
