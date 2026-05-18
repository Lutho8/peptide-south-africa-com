// Runs before `vite dev` and `vite build` (predev/prebuild hooks).
// Writes public/sitemap.xml from a static route list + product slugs
// extracted from src/data/products.ts. Avoids importing the products
// module directly (it imports image assets that only resolve via Vite).

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://www.ridethetide.site";
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
  { path: "/clinician", changefreq: "monthly", priority: "0.7" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/faq", changefreq: "monthly", priority: "0.7" },
  { path: "/track-order", changefreq: "monthly", priority: "0.5" },
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

/** Paths that have /de and /za market variants. */
const MARKETABLE = new Set<string>(["/", "/shop"]);

function altLinks(genericPath: string): string[] {
  const suffix = genericPath === "/" ? "" : genericPath;
  return [
    `    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}${suffix || "/"}" />`,
    `    <xhtml:link rel="alternate" hreflang="en-ZA" href="${BASE_URL}/za${suffix}" />`,
    `    <xhtml:link rel="alternate" hreflang="de-DE" href="${BASE_URL}/de${suffix}" />`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${suffix || "/"}" />`,
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
const productGenericPaths = productSlugs.map((s) => `/product/${s}`);
productGenericPaths.forEach((p) => MARKETABLE.add(p));

const productEntries: (SitemapEntry & { genericPath?: string })[] = productSlugs.flatMap((slug) => {
  const generic = `/product/${slug}`;
  return [
    { path: generic, changefreq: "weekly", priority: "0.8", genericPath: generic },
    { path: `/de${generic}`, changefreq: "weekly", priority: "0.8", genericPath: generic },
    { path: `/za${generic}`, changefreq: "weekly", priority: "0.8", genericPath: generic },
  ];
});

// Expand marketable static entries (/, /shop) into 3 variants each.
const expandedStatic: (SitemapEntry & { genericPath?: string })[] = staticEntries.flatMap((e) => {
  if (!MARKETABLE.has(e.path)) return [e];
  const generic = e.path;
  const suffix = generic === "/" ? "" : generic;
  return [
    { ...e, genericPath: generic },
    { ...e, path: `/de${suffix || "/"}`.replace(/\/$/, suffix ? "" : "/"), genericPath: generic },
    { ...e, path: `/za${suffix || "/"}`.replace(/\/$/, suffix ? "" : "/"), genericPath: generic },
  ];
});

const all = [...expandedStatic, ...productEntries];

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
