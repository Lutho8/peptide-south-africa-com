// Runs before `vite dev` and `vite build` (predev/prebuild hooks).
// Writes public/sitemap.xml from a static route list + product slugs
// extracted from src/data/products.ts. Avoids importing the products
// module directly (it imports image assets that only resolve via Vite).

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://www.peptide-south-africa.com";
const today = new Date().toISOString().slice(0, 10);

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

interface BlogEntry {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
}

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/shop", changefreq: "daily", priority: "0.9" },
  { path: "/build-your-stack", changefreq: "weekly", priority: "0.85" },
  { path: "/blog", changefreq: "weekly", priority: "0.7" },
  { path: "/editorial-policy", lastmod: "2026-08-31", changefreq: "monthly", priority: "0.5" },
  { path: "/fat-loss-protocol", changefreq: "weekly", priority: "0.85" },
  { path: "/quiz", changefreq: "weekly", priority: "0.8" },
  { path: "/research", changefreq: "weekly", priority: "0.6" },
  { path: "/reviews", changefreq: "weekly", priority: "0.8" },
  { path: "/buy-retatrutide-south-africa", changefreq: "weekly", priority: "0.85" },
  { path: "/buy-tirzepatide-south-africa", changefreq: "weekly", priority: "0.85" },
  { path: "/buy-bpc-157-south-africa", changefreq: "weekly", priority: "0.85" },
  { path: "/buy-ghk-cu-south-africa", changefreq: "weekly", priority: "0.85" },
  { path: "/buy-tesamorelin-south-africa", changefreq: "weekly", priority: "0.85" },
  { path: "/buy-mots-c-south-africa", changefreq: "weekly", priority: "0.85" },
  { path: "/impressum", changefreq: "yearly", priority: "0.4" },
  { path: "/faq", changefreq: "monthly", priority: "0.7" },
  { path: "/shipping", changefreq: "yearly", priority: "0.4" },
  { path: "/refund", changefreq: "yearly", priority: "0.4" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
];


function extractProductSlugs(): string[] {
  const src = readFileSync(resolve("src/data/products.ts"), "utf8");
  const slugs = new Set<string>();
  for (const match of src.matchAll(/slug:\s*["']([^"']+)["']/g)) {
    slugs.add(match[1]);
  }
  return [...slugs];
}

/** Read every blog post file for its slug + updatedAt/publishedAt (for <lastmod>). */
function extractBlogPosts(): BlogEntry[] {
  const dir = resolve("src/data/blog/posts");
  const out: BlogEntry[] = [];
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".ts")) continue;
    const src = readFileSync(resolve(dir, file), "utf8");
    const extractField = (field: string) =>
      src.match(new RegExp(`${field}:\\s*(["'])(.*?)\\1`))?.[2];
    const slug = extractField("slug");
    if (!slug) continue;
    const title = extractField("title") ?? slug;
    const description = extractField("metaDescription") ?? title;
    const publishedAt = extractField("publishedAt") ?? today;
    const updatedAt = extractField("updatedAt") ?? publishedAt;
    out.push({ slug, title, description, publishedAt, updatedAt });
  }
  return out;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function altLinks(genericPath: string): string[] {
  const href = `${BASE_URL}${genericPath === "/" ? "/" : genericPath}`;
  return [
    `    <xhtml:link rel="alternate" hreflang="en-ZA" href="${href}" />`,
    `    <xhtml:link rel="alternate" hreflang="en" href="${href}" />`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${href}" />`,
  ];
}

function urlBlock(e: SitemapEntry & { genericPath?: string }) {
  const lines = [
    `  <url>`,
    `    <loc>${BASE_URL}${e.path}</loc>`,
    e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
    e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
    e.priority ? `    <priority>${e.priority}</priority>` : null,
    ...(e.genericPath ? altLinks(e.genericPath) : []),
    `  </url>`,
  ];
  return lines.filter(Boolean).join("\n");
}

const productSlugs = extractProductSlugs();

const productEntries: (SitemapEntry & { genericPath?: string })[] = productSlugs.map((slug) => {
  const generic = `/product/${slug}`;
  return { path: generic, changefreq: "weekly", priority: "0.8", genericPath: generic };
});

const blogPosts = extractBlogPosts();
const blogEntries: (SitemapEntry & { genericPath?: string; lastmod?: string })[] = blogPosts.map(
  ({ slug, updatedAt }) => {
    const generic = `/blog/${slug}`;
    return { path: generic, changefreq: "monthly", priority: "0.7", genericPath: generic, lastmod: updatedAt };
  },
);

const all = [
  ...staticEntries.map((e) => ({ ...e, genericPath: e.path })),
  ...productEntries,
  ...blogEntries,
];

const xml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
  ...all.map(urlBlock),
  `</urlset>`,
  ``,
].join("\n");

writeFileSync(resolve("public/sitemap.xml"), xml);
writeFileSync(
  resolve("public/sitemap-meta.json"),
  JSON.stringify({ generatedAt: `${today}T00:00:00.000Z`, urlCount: all.length }, null, 2) + "\n",
);

const sortedBlogPosts = [...blogPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
const latestEditorialDate = [...blogPosts]
  .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]?.updatedAt ?? today;
const feedXml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`,
  `  <channel>`,
  `    <title>Peptide South Africa Research Updates</title>`,
  `    <link>${BASE_URL}/blog</link>`,
  `    <description>Research-cited peptide explainers, clinical study updates and South African sourcing guidance.</description>`,
  `    <language>en-ZA</language>`,
  `    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />`,
  `    <lastBuildDate>${new Date(`${latestEditorialDate}T08:00:00+02:00`).toUTCString()}</lastBuildDate>`,
  ...sortedBlogPosts.flatMap((post) => [
    `    <item>`,
    `      <title>${escapeXml(post.title)}</title>`,
    `      <link>${BASE_URL}/blog/${post.slug}</link>`,
    `      <guid isPermaLink="true">${BASE_URL}/blog/${post.slug}</guid>`,
    `      <description>${escapeXml(post.description)}</description>`,
    `      <pubDate>${new Date(`${post.publishedAt}T08:00:00+02:00`).toUTCString()}</pubDate>`,
    `    </item>`,
  ]),
  `  </channel>`,
  `</rss>`,
  ``,
].join("\n");
writeFileSync(resolve("public/feed.xml"), feedXml);

const cutoff = new Date();
cutoff.setUTCDate(cutoff.getUTCDate() - 2);
const freshPosts = sortedBlogPosts.filter(
  (post) => new Date(`${post.publishedAt}T23:59:59Z`).getTime() >= cutoff.getTime(),
);
const newsXml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`,
  ...freshPosts.flatMap((post) => [
    `  <url>`,
    `    <loc>${BASE_URL}/blog/${post.slug}</loc>`,
    `    <news:news>`,
    `      <news:publication>`,
    `        <news:name>Peptide South Africa</news:name>`,
    `        <news:language>en</news:language>`,
    `      </news:publication>`,
    `      <news:publication_date>${post.publishedAt}</news:publication_date>`,
    `      <news:title>${escapeXml(post.title)}</news:title>`,
    `    </news:news>`,
    `  </url>`,
  ]),
  `</urlset>`,
  ``,
].join("\n");
writeFileSync(resolve("public/news-sitemap.xml"), newsXml);

console.log(
  `Discovery files written (${all.length} sitemap URLs, ${blogEntries.length} feed items, ${freshPosts.length} fresh news URLs)`,
);
