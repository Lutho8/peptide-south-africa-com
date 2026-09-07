import { describe, expect, it } from "vitest";
import { getPost } from "@/data/blog";
import { getBlogImage } from "@/lib/blogImages";

describe("South Africa medicine import rules article", () => {
  const post = getPost("south-africa-medicine-import-rules-2026");

  it("publishes a dated, source-led regulatory analysis", () => {
    expect(post).toBeDefined();
    expect(post?.publishedAt).toBe("2026-09-07");
    expect(post?.updatedAt).toBe("2026-09-07");
    expect(post?.category).toBe("South African Regulation");
    expect(post?.citations.length).toBeGreaterThanOrEqual(10);
    expect(post?.citations.filter((citation) => citation.url.includes("sahpra.org.za")).length)
      .toBeGreaterThanOrEqual(8);
    expect(post?.citations.some((citation) => citation.url.includes("gov.za"))).toBe(true);
    expect(post?.faqs.length).toBeGreaterThanOrEqual(5);
  });

  it("distinguishes the Gazette from SAHPRA's correction notice", () => {
    const body = JSON.stringify(post?.body);
    expect(body).toContain("Government Notice 7780");
    expect(body).toContain("requested repeal and replacement");
    expect(body).toContain("public comment");
    expect(body).toContain("does not automatically prove fraud");
  });

  it("uses a unique 1200 by 675 editorial image", () => {
    const image = getBlogImage(post?.category ?? "", post?.slug);
    expect(image).toContain("south-africa-medicine-import-rules-2026-1200x675");
  });
});
