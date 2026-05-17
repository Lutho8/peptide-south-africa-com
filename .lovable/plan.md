## 1. Google Search Console verification

You have a Google Search Console connection already linked to your workspace (`Lutho's Google Search Console`), so I don't actually need you to paste a token — I can drive the whole flow through the connector gateway. I'll still support a manually-pasted token in case you prefer that path.

**Option A — fully automated (recommended)**
1. Link the existing GSC connector to this project (one-click).
2. Call the Site Verification API to request a `META` token for `https://www.ridethetide.site/`.
3. Insert the returned `<meta name="google-site-verification" content="…">` into `index.html` (replacing the commented placeholder).
4. After you republish, I call the verify endpoint, then `PUT` the site into your Search Console property list. Done.

**Option B — you paste a token**
1. You give me the `content="…"` value from Search Console's HTML-tag verification screen.
2. I uncomment and fill in the `<meta name="google-site-verification">` line in `index.html`.
3. You republish, then click **Verify** in Search Console, then submit `sitemap.xml`.

Either way, after verification I will:
- Add a `<meta name="msvalidate.01">` placeholder for Bing (you paste that token when ready).
- Confirm `Sitemap: https://www.ridethetide.site/sitemap.xml` is in `robots.txt` (already present).
- Tell you which top URLs to manually request indexing for (`/`, `/shop`, `/fat-loss-protocol`, `/quiz`, top 5 products).

I cannot click "Request indexing" for you — that endpoint requires per-URL user action in the Search Console UI.

## 2. Homepage hero — LCP + contrast pass

The hero (`HeroShop.tsx` + `HeroBackdrop.tsx`) has no background image; the LCP candidate is either the H1 ("Premium peptides. Shipped in 48 hours.") or the RT3 product thumbnail in the right card. Current issues:

- The hero product `<img>` has no width/height, no `fetchpriority`, no decoding hint, and no preload — so the browser discovers it late after parsing the React bundle.
- The Google Fonts stylesheet is imported via `@import url(...)` in `src/index.css`, which forces the CSS parser to block before the font request even starts. Moving it to `<link rel="preconnect">` + `<link rel="stylesheet">` in `index.html` shaves ~150–300ms off first paint.
- `text-gradient` on the H1 word "Shipped in 48 hours" can fall below 4.5:1 on the light backdrop depending on the gradient stops. Will audit and darken the start stop or add a `text-shadow` token if needed.
- The discount ribbon uses `text-primary-foreground` on `bg-hero-gradient` — likely fine but I'll verify.
- The small "≥99% HPLC tested · COA…" eyebrow uses `text-primary` on `bg-card/80` over a busy backdrop; will check contrast and bump opacity if needed.

**Changes I'll make**
- `index.html`: add `<link rel="preconnect" href="https://fonts.googleapis.com">`, `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`, and the Google Fonts `<link rel="stylesheet">` for Inter + Space Grotesk with `display=swap`. Add `<link rel="preload" as="image" href="<RT3 image URL>" fetchpriority="high">`.
- `src/index.css`: remove the blocking `@import url(...)` line (now loaded via `<link>`).
- `src/components/HeroShop.tsx`: on the hero `<img>` add `width={800} height={600}`, `fetchPriority="high"`, `decoding="async"`, remove any implicit lazy behavior, and keep `loading="eager"`.
- `src/components/HeroShop.tsx`: audit the H1 gradient and the eyebrow chip. If contrast fails, swap the gradient's lighter stop for a darker token (`hsl(var(--primary))` start) or add `text-foreground` fallback on the gradient span.
- No JSX/structural changes elsewhere.

**Verification**
- Open the homepage in the preview, take a screenshot at desktop + mobile, and visually confirm hero text remains legible.
- After you republish, the next Lighthouse scan picks up the gains; if it still flags performance, I'll iterate.

## 3. What I need from you

- Pick **Option A** (let me link the GSC connector and run the verification API) or **Option B** (paste your token).
- Approve the plan; I'll ship sections 1 and 2 in one pass.
