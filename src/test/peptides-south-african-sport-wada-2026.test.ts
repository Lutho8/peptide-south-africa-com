import { describe, expect, it } from "vitest";
import { getPost } from "@/data/blog";
import { getBlogImage } from "@/lib/blogImages";

describe("2026 WADA peptide guide for South African sport", () => {
  const post = getPost("peptides-south-african-sport-wada-2026");

  it("publishes a current, source-led South African anti-doping analysis", () => {
    expect(post).toBeDefined();
    expect(post?.publishedAt).toBe("2026-09-09");
    expect(post?.updatedAt).toBe("2026-09-09");
    expect(post?.category).toBe("South African Regulation");
    expect(post?.citations.length).toBeGreaterThanOrEqual(10);
    expect(post?.citations.filter((citation) => citation.url.includes("drugfreesport.org.za")).length)
      .toBeGreaterThanOrEqual(7);
    expect(post?.citations.some((citation) => citation.url.includes("wada-ama.org"))).toBe(true);
    expect(post?.citations.some((citation) => citation.url.includes("sahpra.org.za"))).toBe(true);
    expect(post?.faqs.length).toBeGreaterThanOrEqual(5);
  });

  it("separates prohibited substances, monitoring, medicine regulation, and evidence", () => {
    const body = JSON.stringify(post?.body);
    expect(body).toContain("BPC-157");
    expect(body).toContain("TB-500");
    expect(body).toContain("MOTS-c");
    expect(body).toContain("CJC-1295");
    expect(body).toContain("semaglutide and tirzepatide");
    expect(body).toContain("monitoring does not itself make");
    expect(body).toContain("Anti-doping status, medicine registration and evidence are separate");
    expect(body).toContain("no dosing or cycle instructions");
  });

  it("uses a unique 1200 by 675 editorial image", () => {
    const image = getBlogImage(post?.category ?? "", post?.slug);
    expect(image).toContain("peptides-south-african-sport-wada-2026-1200x675");
  });
});
