// Build-time prerendering for the SPA.
//
// Pipeline (wired into `build` after `vite build`):
//   1. Vite already produced dist/ (client bundle + dist/index.html).
//   2. We SSR-build src/entry-server.tsx to a temp ESM bundle.
//   3. For each SEO route we render full HTML + Helmet head, then inject both
//      into a copy of dist/index.html written at the route's static path
//      (e.g. dist/shop/index.html, dist/blog/<slug>/index.html).
//
// Crawlers now receive fully-populated HTML (content + meta + JSON-LD) without
// executing JS; the client still hydrates normally on load. Vercel serves the
// static file for each path and the SPA rewrite handles everything else.
//
// Routes that are user-specific or transactional (cart, checkout, account,
// admin, order status) are intentionally NOT prerendered — they have no SEO
// value and depend on client/session state.

import { build } from "vite";
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from "fs";
import { resolve, dirname } from "path";
import { pathToFileURL } from "url";

const DIST = resolve("dist");
const TMP = resolve(".ssr-tmp");

// ---- Static SEO routes (no params) -----------------------------------------
const staticRoutes = [
  "/",
  "/shop",
  "/build-your-stack",
  "/blog",
  "/faq",
  "/research",
  "/fat-loss-protocol",
  "/quiz",
  "/testing",
  "/shipping",
  "/refund",
  "/terms",
  "/privacy",
  "/impressum",
  "/affiliate",
  "/community",
  "/buy-retatrutide-south-africa",
  "/buy-bpc-157-south-africa",
  "/buy-tirzepatide-south-africa",
  "/buy-ghk-cu-south-africa",
  "/buy-tesamorelin-south-africa",
];

function extractSlugs(file, key = "slug") {
  const src = readFileSync(resolve(file), "utf8");
  const re = new RegExp(`${key}:\\s*["']([^"']+)["']`, "g");
  return [...new Set([...src.matchAll(re)].map((m) => m[1]))];
}

function blogSlugs() {
  const dir = resolve("src/data/blog/posts");
  const out = [];
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".ts")) continue;
    const s = readFileSync(resolve(dir, f), "utf8").match(/slug:\s*["']([^"']+)["']/)?.[1];
    if (s) out.push(s);
  }
  return out;
}

async function main() {
  const productRoutes = extractSlugs("src/data/products.ts").map((s) => `/product/${s}`);
  const blogRoutes = blogSlugs().map((s) => `/blog/${s}`);
  const routes = [...staticRoutes, ...productRoutes, ...blogRoutes];

  console.log(`Prerendering ${routes.length} routes ` +
    `(${staticRoutes.length} static, ${productRoutes.length} products, ${blogRoutes.length} blog)…`);

  // 2. SSR-build entry-server to a temp ESM bundle we can import.
  await build({
    logLevel: "error",
    build: {
      ssr: resolve("src/entry-server.tsx"),
      outDir: TMP,
      emptyOutDir: true,
      ssrEmitAssets: false,
      rollupOptions: { output: { entryFileNames: "entry-server.mjs" } },
    },
  });

  const { render } = await import(pathToFileURL(resolve(TMP, "entry-server.mjs")).href);

  const template = readFileSync(resolve(DIST, "index.html"), "utf8");
  let ok = 0;
  const failures = [];

  for (const route of routes) {
    try {
      const { html, head } = render(route);
      let page = template;

      // Inject SSR markup into the root div.
      page = page.replace('<div id="root"></div>', `<div id="root">${html}</div>`);

      // Merge Helmet head. Remove the build-time <title> so the route title wins.
      const headTags = [head.title, head.meta, head.link, head.script]
        .filter(Boolean)
        .join("\n    ");
      if (headTags) {
        page = page.replace(/<title>.*?<\/title>/s, "");
        page = page.replace("</head>", `    ${headTags}\n  </head>`);
      }

      const outPath =
        route === "/"
          ? resolve(DIST, "index.html")
          : resolve(DIST, route.replace(/^\//, ""), "index.html");
      mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(outPath, page);
      ok++;
    } catch (err) {
      failures.push({ route, error: err?.message ?? String(err) });
    }
  }

  if (!process.env.KEEP_SSR_TMP) rmSync(TMP, { recursive: true, force: true });

  console.log(`✓ Prerendered ${ok}/${routes.length} routes.`);
  if (failures.length) {
    console.error(`✗ ${failures.length} route(s) failed:`);
    for (const f of failures) console.error(`  ${f.route}: ${f.error}`);
    // Non-fatal: the SPA still serves these via client render + rewrite.
    // Fail the build only if EVERYTHING failed (indicates a real SSR break).
    if (ok === 0) process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
