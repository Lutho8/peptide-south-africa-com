# Plan

## 1. Peptide Tracker — dedicated hero button + mobile sticky

**`src/components/HeroShop.tsx`**
- Remove the Tracker CTA from the existing trio of buttons (Shop / Find my protocol / Tracker).
- Add a dedicated full-bleed Tracker band directly below the CTA row: card with `bg-white text-[#0a2540]` (highest contrast over dark hero), thick border, `LineChart` icon, headline "Track your peptide cycles", subline "Doses, bloods, body comp — free, mobile-ready", and a large solid button `bg-[#0a2540] text-white` "Open Peptide Tracker →" linking to `https://ridethetide.info` (`target="_blank" rel="noopener noreferrer"`, `aria-label="Open Peptide Tracker (external)"`).

**`src/components/StickyMobileCTA.tsx`**
- Convert the single "Buy Now" button into a 2-column grid: primary "Shop" (current gradient style) + secondary "Tracker" (outline, navy border + LineChart icon). Tracker opens the external URL in a new tab.
- Keep visibility rules (homepage only, >400px scroll).

## 2. Cookie banner — lighter, layout-stable

**`src/components/CookieConsent.tsx`**
- Render the wrapper container always (reserve space) but keep contents hidden until consent decision is needed, so the fixed-position banner never reflows the page (already `position: fixed` — confirm no body padding side-effects).
- Collapse to a single-line pill: text + one "OK" button + small `×` dismiss. Drop the separate Accept/Decline pair. Map: OK = accept, × = decline. Privacy link inline.
- Reduce max-width to ~320px, padding `px-3 py-2`, text `text-[11px]`. Use `bg-card/95 border-border`.
- Render `null` from SSR/initial paint as today, but precompute `visible` synchronously from `localStorage` in `useState` initializer to avoid the 2.5s delay flash that can cause perceived shift. Keep delay only when no decision exists.

## 3. Quiz deep-links — route to stack/product immediately

**`src/pages/QuizFunnelPage.tsx`**
- After AI protocol resolves and `matchedProducts` is computed, auto-navigate:
  - If `matchedProducts.length >= 2` → `navigate('/shop?stack=<id1,id2,...>&from=quiz')`
  - If `matchedProducts.length === 1` → `navigate('/product/<slug>?from=quiz')`
  - If `matchedProducts.length === 0` → `navigate('/shop?category=<derived-from-goal>&from=quiz')` (goal `fat-loss` → `GLP`, `recovery` → `Healing`, `both` → `GLP`).
- Persist the protocol JSON to `localStorage` under `psa-quiz-result` first so the destination page can show a banner.
- Add a small "View full protocol" link on the destination via a lightweight `QuizResultBanner` mounted in `ShopPage` / `ProductPage` when `?from=quiz` is present, reading from localStorage; non-blocking, dismissable.

**`src/pages/ShopPage.tsx`**
- Read `stack` query param → filter products to that id set, sort to match order, show "Your recommended stack" header + "Add all to cart" button (uses existing CartContext `addToCart` loop).

## 4. Brand guard — broaden scan surface

**`scripts/security/scan-brand.mjs`**
- Extend `TEXT_EXT` to include: `webp`, `js.map`, `css.map`, `lock`, `toml`, `env`, `env.*`, `properties`, `ini`, `conf`, `plist`.
- Add explicit scan of `.env`, `.env.*`, `*.local`, plus `dist/**/*.{js,css,html,json,webmanifest,xml,txt,map}` (already covered by walk but ensure not ignored).
- Add scan of bundled runtime env: parse `dist/**/*.js` for the literal string `import.meta.env` keys via regex `VITE_[A-Z0-9_]+\s*[:=]\s*['"][^'"]*ride[\s-]?the[\s-]?tide[^'"]*['"]` — fail if a `VITE_*` env value contains the legacy brand.
- Add scan of `public/site.webmanifest`, `public/sitemap.xml`, `public/sitemap-meta.json`, `public/llms.txt`, `public/_headers`, `public/robots.txt` explicitly (loop them even if walk would catch them — guarantees coverage).
- Add a second pass over `process.env` at scan time: iterate `process.env` keys starting with `VITE_` and fail if any value matches the legacy pattern (catches CI-injected env that ends up bundled).
- Keep the `.info` negative-lookahead allowlist.
- Update `.github/workflows/brand-guard.yml` to: (a) run `npm run build` before scan, (b) `env:` block passing through `VITE_*` vars so the env-scan sees them, (c) scan `.`, `dist`, and `process.env`.

## Technical notes
- No backend changes. All new query-param handling is client-side; CartContext API is unchanged.
- Tracker URL constant `TRACKER_URL` extracted into `src/lib/contact.ts` for reuse by Hero, StickyMobileCTA, Header.
- No new dependencies.

## Files
- Edit: `src/components/HeroShop.tsx`, `src/components/StickyMobileCTA.tsx`, `src/components/CookieConsent.tsx`, `src/pages/QuizFunnelPage.tsx`, `src/pages/ShopPage.tsx`, `src/pages/ProductPage.tsx`, `scripts/security/scan-brand.mjs`, `.github/workflows/brand-guard.yml`, `src/lib/contact.ts`.
- New: `src/components/QuizResultBanner.tsx`.
