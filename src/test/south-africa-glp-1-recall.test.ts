import { describe, expect, it } from "vitest";
import { getPost } from "@/data/blog";
import { getBlogImage } from "@/lib/blogImages";

describe("South Africa GLP-1 recall publisher contract", () => {
  const post = getPost("south-africa-glp-1-recall-2026");
  const bodyText = post?.body
    .flatMap((block) => {
      if ("text" in block) return [block.text];
      if ("items" in block) return block.items;
      if ("rows" in block) return block.rows.flat();
      return [];
    })
    .join(" ") ?? "";

  it("publishes current South African regulatory analysis with primary sources", () => {
    expect(post).toBeDefined();
    expect(post?.publishedAt).toBe("2026-09-02");
    expect(post?.category).toBe("South African Regulation");
    expect(post?.citations.filter((citation) => citation.url.includes("sahpra.org.za")).length)
      .toBeGreaterThanOrEqual(6);
    expect(post?.citations.some((citation) => citation.url.includes("who.int"))).toBe(true);
  });

  it("separates registration, compounding, Section 21 and research labels", () => {
    expect(bodyText).toContain("SAHPRA-registered medicine");
    expect(bodyText).toContain("Patient-specific compounding");
    expect(bodyText).toContain("Section 21 access");
    expect(bodyText).toContain("Research-labelled material");
  });

  it("contains no consumer dosing or self-titration protocol", () => {
    expect(bodyText.toLowerCase()).not.toContain("starting dose");
    expect(bodyText.toLowerCase()).not.toContain("titrate");
    expect(bodyText.toLowerCase()).not.toContain("cycle length");
    expect(bodyText).toContain("It contains no dosing guidance");
  });

  it("uses a unique slug-specific 1200 by 675 hero image", () => {
    const image = getBlogImage(post?.category ?? "", post?.slug);
    expect(image).not.toBe(getBlogImage(post?.category ?? ""));
    expect(image).toContain("south-africa-glp-1-recall-2026-1200x675");
  });
});
