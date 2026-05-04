# Sitemap submission, BreadcrumbList JSON-LD, and SEO/JSX audit

## 1. Submit sitemap to Google Search Console (manual — you must do this)

I cannot programmatically submit to Google Search Console — it requires your authenticated Google account and ownership verification of `www.ridethetide.site`. Here is the exact procedure:

**A. Verify the domain (once)**
1. Open https://search.google.com/search-console
2. Add property → "URL prefix" → `https://www.ridethetide.site`
3. Choose **HTML tag** verification, copy the `content="…"` value
4. Tell me the value — I'll uncomment the `<meta name="google-site-verification">` line in `index.html` and paste it in
5. Publish the project, then click **Verify** in Search Console

**B. Submit the sitemap**
1. In Search Console → **Sitemaps** (left nav)
2. Enter `sitemap.xml` → **Submit**
3. Status should turn to "Success" within minutes

**C. Request indexing for key pages**
- Use **URL Inspection** at the top, paste each URL, click **Request indexing**
- Google rate-limits to ~10–12 manual requests per day. Prioritize:
  1. `/` (home)
  2. `/shop`
  3. `/fat-loss-protocol`
  4. `/quiz`
  5. Top product pages (`/product/rt3-reta`, `/product/tz2-tirz`, `/product/tesamorelin`, `/product/bpc-tb500-blend`, `/product/ghk-cu-50mg`)
- For the rest, the sitemap submission + internal linking will pick them up over 1–2 weeks
- Repeat the same flow at https://www.bing.com/webmasters for Bing/ChatGPT search visibility

I'll also add a `Sitemap:` directive line to `robots.txt` if it's missing, so crawlers auto-discover it.

## 2. BreadcrumbList JSON-LD — fix domain bug

`src/components/Breadcrumbs.tsx` already emits BreadcrumbList JSON-LD, but it hardcodes `https://tide-shop-clone.lovable.app` (the old preview URL) instead of the canonical `https://www.ridethetide.site`. Google will treat these breadcrumbs as pointing to a different site and ignore them.

**Fix:** Replace the hardcoded URL with the canonical site URL constant (`https://www.ridethetide.site`).

This single fix activates breadcrumb rich results on every page that already uses `<Breadcrumbs>`: Shop, Product, FAQ, About, Clinician, Research Hub, Shipping, Refund, Terms, Privacy.

**Pages missing breadcrumbs** that should have them (will add):
- `/fat-loss-protocol` (Home › Fat Loss Protocol)
- `/quiz` (Home › Free Quiz)
- `/track-order` (Home › Track Order)

## 3. Page JSX / duplicate-SEO audit

Findings from scanning Shop, Checkout, Cart, Quiz, FatLoss, Product:

| Page | Issue | Fix |
|---|---|---|
| **CheckoutPage** | `<SEO />` rendered **twice** — once in the early-return "thank-you" branch (line 24) and once in the main return (line 116). React Helmet de-dupes by tag but the doubled component still risks unstable canonical/title flicker between submitted/unsubmitted state. Also line 115 opens `<>` but the inner `<div>` is the only child — fragment is unnecessary. | Hoist a single `<SEO />` to the top of the component (above the early-return branch) and remove the duplicate; drop the unnecessary `<>` wrappers where there is only one child. |
| **CartPage** | `<>` wrapper around `<SEO />` + single `<div>` — fragment is fine but unnecessary. No duplicate SEO. | Leave fragment (harmless), confirm no duplicate. |
| **ShopPage** | Single `<SEO />`, fragment wraps SEO + Breadcrumbs + content — **correct**. | No change. |
| **QuizFunnelPage** | Single `<SEO />` inside fragment — **correct**. Will add a `<Breadcrumbs />` for the rich result. | Add breadcrumbs only. |
| **FatLossProtocolPage** | Single `<SEO />` — **correct**. No breadcrumbs. | Add breadcrumbs only. |
| **ProductPage** | Single `<SEO />` + Breadcrumbs — **correct**. | No change. |

I'll also grep all other pages (`Home`, `About`, `FAQ`, `Auth`, `Clinician`, `ResearchHub`, policy pages, `TrackOrder`) for the same duplicate-SEO and broken-fragment patterns and clean any I find.

## Files to edit

- `src/components/Breadcrumbs.tsx` — fix canonical domain in JSON-LD
- `src/pages/CheckoutPage.tsx` — remove duplicate `<SEO />`, tidy fragments
- `src/pages/QuizFunnelPage.tsx` — add `<Breadcrumbs />`
- `src/pages/FatLossProtocolPage.tsx` — add `<Breadcrumbs />`
- `src/pages/TrackOrderPage.tsx` — add `<Breadcrumbs />`
- `public/robots.txt` — confirm `Sitemap:` directive
- `index.html` — (later) paste your Google verification meta tag once you provide it

## What I cannot do for you

- Programmatic Search Console submission (requires your Google login + ownership verification). You must follow the manual steps in §1. I can prep the verification meta tag the moment you give me the value.

## Verification

After implementation:
1. Run a quick build to confirm no JSX errors.
2. You publish, then test breadcrumb JSON-LD with https://search.google.com/test/rich-results on `/shop` and a product URL.
3. Submit the sitemap per §1.B.