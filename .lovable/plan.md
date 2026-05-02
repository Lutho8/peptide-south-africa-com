# SEO + GEO Overhaul — Outrank researchpeptides.co.za

## The core problem

Right now every route serves the **same `<title>` and `<meta description>`** from `index.html` ("Ride The Tide — Personalized Peptide Protocols"). Googlebot does render JS, but:

- There is **no `sitemap.xml`** and `robots.txt` doesn't reference one — Google has no list of URLs to crawl.
- There are **no per-page meta tags** (title, description, canonical, OG) — every product, the shop, FAQ, about, etc. all look identical to crawlers on first byte.
- There is **no `llms.txt`** for GEO (Generative Engine Optimization — ChatGPT/Perplexity/Claude/Gemini visibility).
- The site isn't registered with **Google Search Console** / **Bing Webmaster Tools** (no verification meta tag).
- No localized signals for **South Africa** (hreflang, geo meta, LocalBusiness schema with SA address).

Competitors like researchpeptides.co.za rank because they have unique titles, deep product descriptions, sitemaps, and SA-specific signals. We need to match and exceed all of that.

## Plan — 4 phases

### Phase 1 — Crawlability foundation

1. **Generate `public/sitemap.xml`** at build time covering: home, /shop, every `/product/:slug` from `src/data/products.ts`, /quiz, /fat-loss-protocol, /research, /about, /faq, /shipping, /refund, /terms, /privacy, /clinician, /track-order. Include `<lastmod>`, `<changefreq>`, `<priority>`. A small Vite plugin or prebuild script will write it automatically so it stays in sync with products.
2. **Update `public/robots.txt`**: add `Sitemap: https://www.ridethetide.site/sitemap.xml`, disallow `/admin`, `/checkout`, `/cart`, `/auth`.
3. **Add `public/llms.txt` and `public/llms-full.txt`** — the emerging standard for AI search engines (ChatGPT, Perplexity, Claude). Lists site purpose, key pages, products, and a short brand summary so LLMs cite Ride The Tide accurately.
4. **Pre-rendering**: install `vite-plugin-prerender-spa` (or `react-snap`) to generate static HTML snapshots of every public route at build time. This is the single biggest win — Google sees fully rendered HTML with unique titles/descriptions/content per URL instead of an empty `<div id="root">`.

### Phase 2 — Per-page meta tags (React 19 native)

5. Use **React 19's built-in `<title>`, `<meta>`, `<link rel="canonical">`** support (no library needed; React hoists them to `<head>`). Create `src/components/SEO.tsx` — a single component each page renders with:
   - `<title>` (≤60 chars, keyword-led, ends with "| Ride The Tide")
   - `<meta name="description">` (≤160 chars, benefit + CTA)
   - `<link rel="canonical">`
   - Open Graph + Twitter card overrides
   - Optional `<meta name="robots" content="noindex">` for /admin, /cart, /checkout, /auth
6. **Apply SEO component to every page** with SA-targeted, keyword-rich copy:
   - Home: "Buy Peptides Online South Africa | GP-Led Protocols"
   - Shop: "Research Peptides South Africa — Retatrutide, BPC-157, Tesamorelin"
   - Product pages: dynamic `${product.name} — Buy in South Africa | 99% Purity COA`
   - Fat Loss: "Peptide Fat Loss Protocol South Africa | GLP-1 Therapy"
   - Quiz: "Free Peptide Protocol Quiz — Personalized Recommendation"
   - And matching descriptions for each.

### Phase 3 — Schema & GEO signals

7. **Expand `src/lib/seo.ts`**:
   - Convert `organizationSchema` to **`MedicalBusiness` + `LocalBusiness`** with SA address, geo coordinates, opening hours, telephone, currency ZAR, areaServed=ZA.
   - Add **`Product` schema with `offers.priceCurrency: ZAR`, `availability`, `aggregateRating`, `review`** for every product (already partial — extend to include real reviews from DB, GTIN/MPN where possible).
   - Add **`BreadcrumbList`** (already present — verify on all pages).
   - Add **`HowTo` / `MedicalWebPage`** schema on Fat Loss Protocol page.
   - Add **`WebSite` with `SearchAction`** (sitelinks search box).
8. **Geo meta tags** in head: `geo.region=ZA`, `geo.placename=South Africa`, `ICBM` coordinates, `<html lang="en-ZA">`, `<link rel="alternate" hreflang="en-za">`.
9. **Google Search Console + Bing verification** meta tags (placeholders the user fills in once after first publish).

### Phase 4 — Content & GEO depth (the part that beats competitors)

10. **Expand product page copy** — researchpeptides.co.za ranks partly on long-form product descriptions. Add a "Research Background" section per product (300–500 words) pulling from existing `benefits`/`whatsIncluded` fields plus citation links to PubMed studies.
11. **Add `/blog` foundation** (route + index page reading from a new `blog_posts` Supabase table) with 3 seed articles targeting high-intent SA queries: "Best peptides for fat loss in South Africa", "Retatrutide vs Tirzepatide — which is right for you?", "How to store peptides — South African climate guide". Each post: SEO component, JSON-LD `Article` schema, internal links to products. *(Table + seed content; admin UI can be a follow-up.)*
12. **Internal linking audit** — ensure every page uses the existing `RelatedContent` cluster pattern (already built) so PageRank flows to product pages.
13. **`<img alt>` audit** — pass through hero, product, testimonial images and add SA + peptide keywords to alt text where missing.
14. **Performance pass** — add `loading="lazy"` to below-fold images, `width`/`height` attrs to prevent CLS (Core Web Vitals are a ranking signal).

## Technical notes

- Pre-rendering is done at build time with `vite-plugin-prerender` reading routes from a static list — no SSR server needed, output is static HTML per route uploaded with the bundle.
- React 19 native `<title>`/`<meta>` hoisting avoids adding `react-helmet-async` (smaller bundle, no provider wrapping).
- The sitemap generator runs as a Vite plugin in `vite.config.ts` `closeBundle` hook — no manual maintenance.
- `llms.txt` is a plain markdown file; format follows llmstxt.org spec.
- All copy stays in ZAR / South African English to match audience.
- No backend logic changes — purely presentation, build config, and one optional `blog_posts` table.

## Files created / edited

**Create**: `public/llms.txt`, `public/llms-full.txt`, `scripts/generate-sitemap.mjs` (or inline Vite plugin), `src/components/SEO.tsx`, `src/pages/BlogPage.tsx` + `src/pages/BlogPostPage.tsx`, migration for `blog_posts`.
**Edit**: `index.html` (geo meta, hreflang, lang=en-ZA, GSC placeholder), `public/robots.txt`, `vite.config.ts` (prerender + sitemap plugins), `src/lib/seo.ts` (LocalBusiness/MedicalBusiness, SearchAction), every page in `src/pages/` (add SEO component), `src/App.tsx` (add /blog routes), `src/data/products.ts` (extended descriptions where thin).

## What this delivers

- Unique indexable HTML per URL (the #1 reason we're invisible today).
- A discoverable sitemap and AI-friendly `llms.txt`.
- SA-localized schema + geo signals so Google ranks us in `.co.za` results.
- Long-form product + blog content to compete with researchpeptides.co.za on keyword breadth.
- Verification hooks ready for Google Search Console submission.

After approval and deploy, expect first indexing in 3–7 days; ranking gains compound over 4–8 weeks.
