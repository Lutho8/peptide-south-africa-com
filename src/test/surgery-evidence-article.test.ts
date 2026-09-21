import { describe, it, expect } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { readFileSync } from "node:fs";
import { post } from "../data/blog/posts/glp-1-surgery-south-africa";
import { getPost } from "../data/blog";
import { getBlogImage } from "../lib/blogImages";
import BlogPostPage from "../pages/BlogPostPage";

describe("South African GLP-1 surgery evidence article", () => {
  const body = JSON.stringify(post.body);
  it("uses the real publication date and declares editorial synthesis", () => {
    expect(post.publishedAt).toBe("2026-09-21");
    expect(post.updatedAt).toBe(post.publishedAt);
    expect(body).toContain("original editorial synthesis");
    expect(body).toContain("not a new September safety alert");
    expect(getPost(post.slug)).toBe(post);
  });
  it("resolves every citation and cites the selected primary sources", () => {
    const ids = post.citations.map(c => c.id);
    const refs = [...body.matchAll(/<sup>(\d+)<\/sup>/g)].map(m => m[1]);
    expect(new Set(ids).size).toBe(6);
    expect(new Set(refs)).toEqual(new Set(ids));
    for (const c of post.citations) {
      expect(["www.gov.uk", "sajaa.co.za", "jamanetwork.com", "www.asahq.org", "cpoc.org.uk", "medsafety.sahpra.org.za"]).toContain(new URL(c.url).hostname);
      expect(c.url).toMatch(/^https:\/\//);
    }
  });
  it("preserves evidence limits and avoids self-directed medicine changes", () => {
    expect(body).toContain("not a randomised comparison");
    expect(body).toContain("not a national GLP-1 protocol");
    expect(body).toContain("Do not stop or alter prescribed treatment");
    expect(body).toContain("Preclinical experiments and veterinary findings");
    expect(body).not.toMatch(/\b\d+\s*(mg|mcg)\b/i);
  });
  it("uses a unique compact image and valid related articles", () => {
    expect(getBlogImage(post.category, post.slug)).toContain("glp-1-surgery-south-africa-1200x675.webp");
    for (const slug of post.related) expect(getPost(slug)).toBeDefined();
    expect(post.faqs).toHaveLength(5);
  });
  it("renders the article with matching structured data but no promotional club card", async () => {
    const view = render(createElement(HelmetProvider, {},
      createElement(MemoryRouter, { initialEntries: [`/blog/${post.slug}`] },
        createElement(Routes, {}, createElement(Route, {
          path: "/blog/:slug", element: createElement(BlogPostPage),
        })))));
    expect(view.container.textContent).toContain(post.title);
    expect(view.container.textContent).toContain("Must everyone stop a GLP-1 medicine seven days before surgery?");
    expect(view.container.textContent).not.toContain("Visit the Club");
    expect(post.cta).toBe("none");
    await waitFor(() => {
      const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')]
        .map(el => JSON.parse(el.textContent ?? "{}"));
      const article = schemas.find(s => s["@type"] === "BlogPosting");
      const faq = schemas.find(s => s["@type"] === "FAQPage");
      expect(article?.datePublished).toBe(post.publishedAt);
      expect(article?.citation).toEqual(post.citations.map(c => c.url));
      expect(article?.image.width).toBe(1200);
      expect(article?.image.height).toBe(675);
      expect(faq?.mainEntity.map((q: { name: string }) => q.name)).toEqual(post.faqs.map(f => f.q));
    });
    cleanup();
  });
  it("includes the new URL in RSS and both sitemaps without redating older posts", () => {
    for (const file of ["feed.xml", "sitemap.xml"]) {
      const xml = readFileSync(`public/${file}`, "utf8");
      expect(xml).toContain(`/blog/${post.slug}`);
    }
    // News entries deliberately expire after 48 hours. Future builds must not
    // fail or refresh publication dates just to keep this article in News.
    const news = readFileSync("public/news-sitemap.xml", "utf8");
    if (news.includes(`/blog/${post.slug}`)) {
      expect(news).toContain(`<news:publication_date>${post.publishedAt}</news:publication_date>`);
    }
    expect(getPost("glp-1-abdominal-pain-sahpra-reporting")?.publishedAt).toBe("2026-09-14");
  });
});
