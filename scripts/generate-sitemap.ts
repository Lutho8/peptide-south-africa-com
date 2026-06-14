// Runs before `vite dev` and `vite build` (predev/prebuild hooks).
// Writes public/sitemap.xml from a static route list + product slugs
// extracted from src/data/products.ts. Avoids importing the products
// module directly (it imports image assets that only resolve via Vite).

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://www.peptide-south-africa.com";
const today = new Date().toISOString().slice(0, 10);

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/shop", changefreq: "daily", priority: "0.9" },
  { path: "/fat-loss-protocol", changefreq: "weekly", priority: "0.85" },
  { path: "/quiz", changefreq: "weekly", priority: "0.8" },
  { path: "/research", changefreq: "weekly", priority: "0.6" },
  { path: "/impressum", changefreq: "yearly", priority: "0.4" },
  { path: "/faq", changefreq: "monthly", priority: "0.7" },
  { path: "/track-order", changefreq: "monthly", priority: "0.5" },
  { path: "/shipping", changefreq: "yearly", priority: "0.4" },
  { path: "/refund", changefreq: "yearly", priority: "0.4" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/cart", changefreq: "monthly", priority: "0.2" },
  { path: "/checkout", changefreq: "monthly", priority: "0.2" },
];


function extractProductSlugs(): string[] {
  const src = readFileSync(resolve("src/data/products.ts"), "utf8");
  const slugs = new Set<string>();
  for (const match of src.matchAll(/slug:\s*["']([^"']+)["']/g)) {
    slugs.add(match[1]);
  }
  return [...slugs];
}

function altLinks(genericPath: string): string[] {
  const href = `${BASE_URL}${genericPath === "/" ? "/" : genericPath}`;
  return [
    `    <xhtml:link rel="alternate" hreflang="en-ZA" href="${href}" />`,
    `    <xhtml:link rel="alternate" hreflang="en" href="${href}" />`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${href}" />`,
  ];
}

function urlBlock(e: SitemapEntry & { lastmod?: string; genericPath?: string }) {
  const lines = [
    `  <url>`,
    `    <loc>${BASE_URL}${e.path}</loc>`,
    `    <lastmod>${e.lastmod ?? today}</lastmod>`,
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

const all = [...staticEntries.map((e) => ({ ...e, genericPath: e.path })), ...productEntries];

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
  JSON.stringify({ generatedAt: new Date().toISOString(), urlCount: all.length }, null, 2) + "\n",
);
console.log(`sitemap.xml written (${all.length} entries, ${productEntries.length} products)`);
