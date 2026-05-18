## Current state

- `public/robots.txt` exists and correctly allows Googlebot/Bingbot/AI crawlers, disallows `/admin`, `/checkout`, `/cart`, `/auth`, and references `Sitemap: https://www.ridethetide.site/sitemap.xml`.
- `public/sitemap.xml` exists as a static file with homepage, shop, all 8 product URLs, and supporting pages.
- `ProductPage.tsx` already emits `Product` JSON-LD (via `productSchema`) plus `FAQPage`/`BreadcrumbList`.
- `HomePage.tsx` already emits `Organization` + `WebSite` + `LocalBusiness` schemas.
- `ShopPage.tsx` only emits an `ItemList` schema — missing `Organization`/`WebSite`.
- Google Search Console META verification tag is already in `index.html` (token `3FxnDg7…`) and the site is published.

## Plan

### 1. robots.txt + sitemap (low-risk improvements)
- robots.txt is already correct — no change needed beyond confirming `/shop`, `/product/*`, `/fat-loss-protocol`, `/quiz`, `/research` are all crawlable (they are, since only `/admin`, `/cart`, `/checkout`, `/auth` are disallowed).
- Convert the hand-edited `public/sitemap.xml` to a generator script so new products auto-appear:
  - Add `scripts/generate-sitemap.ts` that imports `products` from `src/data/products.ts` and writes `public/sitemap.xml` with static routes + one `<url>` per product slug.
  - Wire `predev` + `prebuild` npm scripts to run it via `bunx tsx`.
  - Keep `<lastmod>` set to build date so Google sees freshness.

### 2. Schema additions
- `ShopPage.tsx`: also emit `organizationSchema` and `websiteSchema` JSON-LD alongside the existing `ItemList` so the shop page reinforces site-level entities for rich results.
- `ProductPage.tsx`: confirm `Product` schema includes `brand`, `offers.priceCurrency=ZAR`, `availability`, `aggregateRating` (already present in `productSchema`) — no change needed.

### 3. Google Search Console verify + site-add
Run these via `code--exec` against the connector gateway:
1. `POST /siteVerification/v1/webResource?verificationMethod=META` with `identifier=https://www.ridethetide.site/` to verify the deployed meta tag.
2. `PUT /webmasters/v3/sites/https%3A%2F%2Fwww.ridethetide.site%2F` to add the property.
3. `POST /webmasters/v3/sites/{site}/sitemaps/{sitemapUrl}` to submit `sitemap.xml`.
4. Report back the verified property + sitemap submission status.

Note: per-URL "Request indexing" is not available via API — once the property is added and the sitemap is submitted, Google will crawl autonomously. I'll list the top URLs the user should manually click "Request Indexing" on in Search Console.

### Files to touch
- `scripts/generate-sitemap.ts` (new)
- `package.json` (add `predev`/`prebuild`)
- `src/pages/ShopPage.tsx` (add 2 JsonLd blocks)
- No changes to `robots.txt`, `ProductPage.tsx`, `HomePage.tsx`, or `index.html`.
