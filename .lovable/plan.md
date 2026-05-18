## Goal

Add SEO-clean per-market URLs at `/de/*` and `/za/*` for **Home, Shop, and Product** pages, with proper hreflang/canonical reciprocity, an updated sitemap that lists all variants, internal nav that points at the right market, and Search Console verification + sitemap submission for `www.ridethetide.site`.

---

## 1. Routing — add `/de` and `/za` variants

Update `src/App.tsx` so the same three page components mount on three paths each:

- `/` , `/de` , `/za` → `HomePage`
- `/shop` , `/de/shop` , `/za/shop` → `ShopPage`
- `/product/:slug` , `/de/product/:slug` , `/za/product/:slug` → `ProductPage`

All other routes (about, faq, research, cart, checkout, admin, etc.) stay single-URL — out of scope per your scope choice.

## 2. `useMarket()` hook (new) — single source of truth

Create `src/hooks/useMarket.ts`. It reads the first path segment via `useLocation`:

- `/de/...` → `{ market: "de", lang: "de", currency: "EUR", basePath: "/de" }`
- `/za/...` → `{ market: "za", lang: "en", currency: "ZAR", basePath: "/za" }`
- anything else → `{ market: "default", lang: "en", currency: "EUR", basePath: "" }`

Also exports `marketPath(path: string, market)` — prefixes `/de` or `/za` to a generic path. Used by Header, Footer, ProductCard, breadcrumbs.

Behaviour wiring:
- `CurrencyContext`: on mount and on market change, if `market !== "default"` and the persisted currency differs, switch to the market's currency. Manual currency-toggle still wins for that session.
- `CheckoutPage` shipping-country localStorage initializer: if `market === "de"` default to Germany, if `"za"` default to South Africa, else fall back to existing logic.

No content branching — page bodies render identically; only meta + currency change.

## 3. Per-route SEO and hreflang

Extend `src/components/SEO.tsx`:

- New prop `alternates?: { hrefLang: string; href: string }[]` — when provided, emit those `<link rel="alternate" hreflang>` tags **instead of** the current static block.
- Canonical = the page's own URL (the variant it is on). Each variant's canonical points at itself — this is what makes per-region indexing work alongside hreflang. Self-canonical + reciprocal hreflang is the only Google-blessed pattern here.
- `lang` prop is already wired to `<html lang>`; pass `"de"` from /de pages, `"en"` from /za and default.

In each of the three pages, build the alternates set:

```
en-ZA  → https://www.ridethetide.site/za<path>
de-DE  → https://www.ridethetide.site/de<path>
en     → https://www.ridethetide.site<path>       (default / x-default)
x-default → same as above
```

Pages:
- `HomePage` — variants for `/`, `/de`, `/za`.
- `ShopPage` — variants for `/shop`, `/de/shop`, `/za/shop`.
- `ProductPage` — variants for `/product/:slug`, `/de/product/:slug`, `/za/product/:slug`. Product JSON-LD's `offers.priceCurrency` flips EUR↔ZAR based on `useMarket()` (price values themselves stay in EUR — that's already the source of truth and `useCurrency().convert` handles display).

## 4. German copy for /de variants

Add a `MARKET_COPY` map in `src/lib/marketCopy.ts` keyed by `market` for the three pages. Translate:
- meta title + description (DE for `/de`, English for `/za` and default).
- Hero H1 + sub-headline on HomePage.
- Page H1 + intro line on ShopPage.
- Product page section headings: "Beschreibung", "Spezifikationen", "Versand & Rückgabe", "Ähnliche Produkte". Product names stay in their original form (chemical names).

Body content beyond those headings stays English in v1 — flagged in "Out of scope" below.

## 5. Internal navigation — preserve market across clicks

- `Header.tsx` nav links: route through `marketPath()` so a user on `/de/shop` clicking "Home" goes to `/de`, not `/`.
- `Footer.tsx` shop column links similarly.
- `ProductCard.tsx` → use `marketPath` when building the product URL.
- Add a tiny **market switcher** in the header (next to the existing currency toggle) with three options: DE 🇩🇪 / ZA 🇿🇦 / Global. Selecting one navigates to the equivalent path on the new market.

Out-of-scope routes (cart/checkout/about/faq/research) keep their existing single-URL links — clicking them from a /de page drops the prefix; that is fine and intentional.

## 6. Sitemap — list every variant

Update `scripts/generate-sitemap.ts`:

- For each "marketable" path (`/`, `/shop`, `/product/<slug>`), emit three `<url>` entries: default, `/de` variant, `/za` variant.
- Each `<url>` includes the full `xhtml:hreflang` alternate links for itself and its siblings (using the `xmlns:xhtml="http://www.w3.org/1999/xhtml"` namespace). This is Google's recommended way to declare hreflang at the sitemap level and is the most reliable signal for crawlers that don't execute JS.
- All other static entries stay single-URL.
- Priorities: defaults stay as-is; `/de` and `/za` variants inherit the same priority.

## 7. robots.txt

No structural change. Confirm the existing single `Sitemap:` directive still points at `https://www.ridethetide.site/sitemap.xml`.

## 8. Search Console verification + submission

Run as a shell flow in this turn via `code--exec`:

1. `GET /webmasters/v3/sites` to see if `https://www.ridethetide.site/` is already verified.
2. If not verified: `POST /siteVerification/v1/token` with `{ site: { identifier: "https://www.ridethetide.site/", type: "SITE" }, verificationMethod: "META" }`. Take the returned `content="…"` token and add it as a `<meta name="google-site-verification" …>` in `index.html` **in addition to** the existing one (the existing one is from a previous owner/verification — leaving it preserves that verification while adding the new one).
3. Ask the user to publish/deploy so the new meta tag is on the live HTML, then continue in this same turn after they confirm. (Verification must hit the live origin — the preview URL does not match the property identifier.)
4. `POST /siteVerification/v1/webResource?verificationMethod=META` to trigger Google's check.
5. `PUT /webmasters/v3/sites/https%3A%2F%2Fwww.ridethetide.site%2F` to add the site to Search Console.
6. `PUT /webmasters/v3/sites/https%3A%2F%2Fwww.ridethetide.site%2F/sitemaps/https%3A%2F%2Fwww.ridethetide.site%2Fsitemap.xml` to submit the sitemap.
7. `GET /webmasters/v3/sites/https%3A%2F%2Fwww.ridethetide.site%2F/sitemaps/https%3A%2F%2Fwww.ridethetide.site%2Fsitemap.xml` to read back the indexed/processed counts and report them to you.

If any GSC call fails with auth or scope errors, surface the error and stop — do not silently retry.

## 9. Verification

After code changes:
- Visit `/de` and `/za` in the preview, confirm the right currency + meta tag + hreflang block render.
- Run `bunx tsx scripts/generate-sitemap.ts` and grep the output for one product to confirm three URLs with xhtml:link siblings.
- Read the GSC sitemap-status response and report the parsed `lastSubmitted`, `isPending`, `warnings`, `errors`, `contents`.

---

## Out of scope

- Translating long-form body content on /de variants (only headings + meta in v1).
- Per-market variants for cart/checkout/about/faq/research/admin.
- Server-side or 302 geo-redirect from `/` to `/de` or `/za` based on IP — Google penalizes that pattern. Users land on `/` by default; market switcher gives them the choice.
- Separate GSC properties per subpath (you chose single property).

## Files touched

- `src/App.tsx` — add `/de/*` and `/za/*` route entries.
- `src/hooks/useMarket.ts` — new.
- `src/lib/marketCopy.ts` — new.
- `src/components/SEO.tsx` — add `alternates` prop.
- `src/components/Header.tsx` — `marketPath` wiring + market switcher.
- `src/components/Footer.tsx` — `marketPath` wiring.
- `src/components/ProductCard.tsx` — market-aware product links.
- `src/context/CurrencyContext.tsx` — sync currency to market on path change.
- `src/pages/HomePage.tsx`, `src/pages/ShopPage.tsx`, `src/pages/ProductPage.tsx` — variant meta + alternates.
- `src/pages/CheckoutPage.tsx` — market-aware shipping-country default.
- `scripts/generate-sitemap.ts` — variant + xhtml:hreflang output.
- `index.html` — add new google-site-verification meta if Step 8.2 returns a new token.

Plus GSC API calls via `code--exec`.
