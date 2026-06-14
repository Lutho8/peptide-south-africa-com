# Rebrand to Peptide South Africa + SEO/Conversion Push

Rename the storefront from "Peptide South Africa" to **Peptide South Africa**, install the new logo/icon, retarget SEO around peptide-South-Africa keywords, hook up Google Search Console, and ship the conversion-focused scroll/sticky effects you listed.

## 1. Brand identity rollout

**New assets (from uploaded images):**
- `src/assets/logo-horizontal.png` — full lockup (light mode, navy text).
- `src/assets/logo-icon.png` — circular icon (mobile/avatar).
- `public/favicon.png`, `public/apple-touch-icon.png`, `public/icon-192.png`, `public/icon-512.png`, `public/og-image.png` — derived from the icon + lockup for PWA/social previews.
- `public/site.webmanifest` — name "Peptide South Africa", short_name "Peptide SA", theme `#0a2540`, icons above.

**Text rename (every occurrence of "Peptide South Africa" / "peptide-south-africa.com"):**
- `index.html` (title, meta, OG, Twitter, Organization + WebSite JSON-LD, hreflang, canonical, og:url, og:image → new asset).
- `src/lib/seo.ts`, `src/lib/marketCopy.ts`, `src/lib/copy.ts`, `src/hooks/useMarket.ts`.
- All page components and blog posts in the grep list above (Header, Footer, CartDrawer, HeroShop, AnnouncementBar, Breadcrumbs, ClinicianHero, DeliveryReturnsAccordion, DiscountPopup, EcosystemSection, FloatingVial, TrackerBridgeCard, BlogCTA, CommunityJoinForm, SEO, CartContext, all `src/pages/*`, all `src/data/blog/posts/*`).
- `scripts/generate-sitemap.ts` + regenerated `public/sitemap.xml` → `https://www.peptide-south-africa.com`.
- `SECURITY.md`, `.lovable/plan.md` references.

**Header/Footer logo swap:** replace text/old logo with `logo-horizontal.png` on desktop, `logo-icon.png` ≤ md breakpoint. Alt: "Peptide South Africa".

## 2. SEO retarget — peptide-south-africa.com

- Update canonical, og:url, hreflang, sitemap base to `https://www.peptide-south-africa.com`.
- Rewrite `<title>` + meta description with primary keyword "Peptide South Africa":
  - Home: `Peptide South Africa | Buy Research Peptides Online — HPLC-Verified`
  - Description: ZA-wide courier, 99% purity, GP-led protocols.
- Expand `keywords` and per-page Helmet titles to cluster around: *peptides south africa, buy peptides south africa, retatrutide south africa, tirzepatide south africa, BPC-157 south africa, GLP-1 south africa, semaglutide south africa, peptide therapy johannesburg / durban / pretoria / cape town, research peptides ZA, peptides for fat loss south africa, peptides for healing south africa*.
- Add `MedicalBusiness` + `Product` JSON-LD with `areaServed: ZA` and city list (Cape Town, Johannesburg, Pretoria, Durban) to feed local-pack signals.
- Refresh `public/llms.txt` and `public/robots.txt` `Sitemap:` line to new domain.

## 3. Google Search Console

- Issue a META verification token for `https://www.peptide-south-africa.com/` via the Search Console connector, replace the existing `google-site-verification` meta in `index.html`, then call verify + add-site.
- Note: requires the domain to be live and serving the new meta tag before verify will succeed; if not yet deployed, instruct the user and leave the call pending.
- Submit `https://www.peptide-south-africa.com/sitemap.xml` once verified.

## 4. Mobile-first polish

- Set `theme-color`, `apple-mobile-web-app-title=Peptide SA`, `apple-mobile-web-app-capable=yes`, link the new manifest + apple-touch-icon.
- Header uses the icon-only logo under `md` to save width; tap target ≥44px.
- Verify `StickyMobileCTA` reads new brand copy.

## 5. Conversion mechanics (the 6 effects)

Add a new `src/components/product/StickyProductExperience.tsx` used on `ProductPage`:

1. **Sticky product card** — `position: sticky; top: 96px` left column, scrollable specs/reviews right column on `lg+`. Mobile keeps existing `StickyProductCTA`.
2. **Monospace authenticity strip** — JetBrains Mono (already loaded) for lot #, purity %, COA hash, batch date under the price → reinforces "lab-grade".
3. **Full-bleed product photography** — hero section using `object-fit: cover; aspect-ratio: 16/9; height: clamp(420px, 60vh, 720px)` for product hero on PDP + Home.
4. **GSAP ScrollTrigger pin** — install `gsap`, pin the product image while right-column copy scrolls through "Purity → Protocol → Proof → Shipping" panels. Honors `prefers-reduced-motion`.
5. **Floating centered label** — `position: fixed; left:50%; transform: translate(-50%, -50%)` badge ("99% HPLC · COA verified") that fades in between scroll milestones, fades out near checkout CTA.
6. **Editorial grid with z-index depth** — Home "Why Peptide SA" section uses CSS grid with overlapping cards (z-index layered photo + stat card + quote card) for magazine-style depth.

Each effect is wrapped so it degrades gracefully on mobile (sticky becomes natural flow, GSAP pin disabled <`lg`).

## 6. Memory updates

- Update `mem://index.md` Core: brand name → Peptide South Africa, primary domain `peptide-south-africa.com`.
- New memory `mem://brand/identity` — logo files, color usage, monospace = trust signal rule.

## Out of scope
- Domain DNS/registrar setup (user-side).
- Paid Google Ads.
- Migrating existing customer data or order links.

## Files touched (high level)
`index.html`, `public/_headers`, `public/robots.txt`, `public/llms.txt`, `public/site.webmanifest` (new), `public/favicon*`, `public/apple-touch-icon.png`, `public/icon-*.png`, `public/og-image.png`, `scripts/generate-sitemap.ts`, `src/assets/logo-*.png` (new), `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/components/product/StickyProductExperience.tsx` (new), `src/pages/ProductPage.tsx`, `src/pages/HomePage.tsx`, all files in the grep list under §1, plus a `package.json` add for `gsap`.
