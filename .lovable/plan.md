## Goal

Make Ride The Tide visibly more compliant, more legible, and more conversion-driven by (1) restoring sound to the "Real results" videos with sourced-from-Whoosh audio, (2) cleaning up the product card chrome, (3) introducing a persistent sticky/floating product follower, and (4) layering a monospace "lab notebook" treatment on data — all while making the consultation booking pathway unmistakable.

---

## ⚠ One thing to confirm before I touch the videos

You asked me to "extract" the audio/videos from `whooshwellness.com` and re-host them. Whoosh's footage is their IP — re-hosting it on Ride The Tide without permission is a copyright/trademark risk and a brand-confusion risk (their clients on our domain). I'll proceed only one of these ways — tell me which when you approve the plan:

- **A. You've licensed / own the footage** → I download, re-encode with audio, upload via `lovable-assets`, and self-host. (Safe path.)
- **B. Embed via Whoosh's Vimeo source** → Native audio, no copy. Cleanest, but viewer sees a Vimeo player.
- **C. Replace with our own footage** → You upload 3–5 clips with audio; I wire them in. (Most defensible long-term.)

If you don't pick, I'll default to **B** (embed) for the implementation so nothing is duplicated without rights.

---

## 1. Real Results — videos with sound

`src/components/SupportVideosSection.tsx` currently force-mutes (`muted loop playsInline`). Changes:

- Remove `muted`; keep `playsInline`, `loop`, `preload="none"`.
- Autoplay browser policy requires either user gesture or muted-start. Pattern:
  - Start `muted` + autoplay when scrolled into view (current behavior).
  - Overlay an **"🔊 Tap to unmute"** pill (bottom-left, monospace). One tap unmutes the focused tile and mutes all others — single-audio rule so five videos don't overlap.
  - Pause + remute when scrolled out of view.
- Per-tile state via `useRef` map + a single `activeId` state in the section.
- New `src/components/SupportVideoTile.tsx` for the tile + unmute control (cleaner than enlarging `LazyVideo`).
- Source list `CLIPS` updated per the path you confirm above (A/B/C).

---

## 2. Product catalog cleanup — 3-pack & 5-pack only

In `src/components/ProductCard.tsx`:

- Filter `packVariants` to only `pack === 3` or `pack === 5`.
- Default selected = `5` (best-value anchor); fallback to `3` if 5 isn't stocked.
- Grid becomes `grid-cols-2` instead of `grid-cols-3` — bigger tap targets, less density.
- Tighten card chrome:
  - Move the three trust pills (HPLC / COA / Track) into a single thin strip above the title, no background fills — just icon + label.
  - Drop the SKU + CAS from the card face (keep on PDP); they're noise at scale.
  - Increase image-area padding so vials breathe.
- `src/data/products.ts` is **not** edited — 10-pack stays available on the PDP for users who want it; it's only hidden from the card.

---

## 3. Sticky / floating product follower

Two coordinated pieces, as you requested both:

### 3a. PDP sticky summary (right rail, desktop; bottom bar, mobile)

In `src/pages/ProductPage.tsx`:

- Wrap the right-column price/CTA block in `position: sticky; top: 96px` inside a CSS Grid (`grid-cols-[1fr_380px]`).
- Card contains: thumbnail, name, selected pack, live price, and **either** "Add to Cart" (RUO track) **or** "Book Consultation" (GP track — Reta/Tirz/Sema).
- Mobile keeps the existing `StickyProductCTA` (already `position: fixed; inset-x-0; bottom-0`).

### 3b. Site-wide floating mini-card

New `src/components/FloatingProductFollower.tsx` + `src/context/LastViewedProductContext.tsx`:

- When user lands on any product page, store `{ slug, name, image, price, track }` in context + `sessionStorage`.
- On shop/category/blog routes, render a fixed `bottom-right` (above WhatsApp/Text-us buttons — `z-index: 45` vs their `z-50`) card with:
  - Thumbnail (48px), name, price.
  - CTA: "Add to Cart" or "Book Consultation" (track-aware).
  - Dismiss × — sets a `dismissed` flag per slug for the session.
- Auto-hides on `/checkout`, `/cart`, the matching `/product/:slug`, and after successful add-to-cart (subscribes to `CartContext`).
- Uses `transform: translateY()` + `opacity` for the slide-in (no layout thrash).
- Hidden on mobile (mobile already has `StickyMobileCTA`) to avoid stacking.

---

## 4. Monospace "raw & authentic" data styling

Scope per your pick: **data + section eyebrows/labels**.

- `tailwind.config.ts`: add `mono: ["'JetBrains Mono'", "ui-monospace", "monospace"]` to `fontFamily`.
- `index.html`: preconnect + load JetBrains Mono 400/500/700 from Google Fonts (one extra `<link rel="preload">`).
- New utility class `.font-mono-data` already maps to `font-mono` — apply to:
  - Prices, per-mg labels, "X Avail" counts on cards.
  - SKU, CAS numbers, lot numbers on PDP.
  - Section eyebrows ("COMPOUND CATALOG", "PATHWAY", "REAL RESULTS").
- Display font (`font-display`) for headings stays as-is — no full mono headings.

---

## 5. Consultation pathway — make it impossible to miss

Light touch, scoped to what enables conversion without rebuilding the funnel:

- **Header**: turn the existing `Get Started` button into split CTA on desktop: `Take Quiz` (primary) + `Book Consultation` (ghost). Mobile collapses to one CTA.
- **GP-track product cards**: replace the generic stethoscope icon line with a 2-line value strap above the CTA — *"GP-prescribed · Bloodwork reviewed · No reconstitution guesswork"* in mono microcopy.
- **ShopPage hero**: add a third pill alongside the existing two — `Book a 15-min consult` → `/quiz?intent=consult` (uses your existing quiz funnel, no new route needed).
- **FloatingProductFollower** (above) becomes the persistent consultation prompt for GP-track products.

---

## Technical Section

### Files created
- `src/components/SupportVideoTile.tsx` — per-tile video + unmute control, single-audio coordination via props.
- `src/components/FloatingProductFollower.tsx`
- `src/context/LastViewedProductContext.tsx` — provider wired in `src/App.tsx` above `CartContext`.

### Files edited
- `src/components/SupportVideosSection.tsx` — remove `muted` hardcode, replace `LazyVideo` with `SupportVideoTile`, swap `CLIPS` sources per chosen audio path.
- `src/components/ProductCard.tsx` — filter packs to 3/5, 2-col grid, trim trust chrome, drop SKU/CAS from card face.
- `src/pages/ProductPage.tsx` — wrap purchase column in sticky right-rail (desktop only); register last-viewed product.
- `src/components/Header.tsx` — split CTA on desktop.
- `src/pages/ShopPage.tsx` — third hero pill + apply `font-mono` to eyebrow.
- `src/index.css` — `.font-mono-data` helper; ensure mono variable.
- `tailwind.config.ts` — add `fontFamily.mono`.
- `index.html` — preconnect + JetBrains Mono.
- `src/App.tsx` — mount `LastViewedProductProvider` and `<FloatingProductFollower />` (outside `<main>`, inside router).

### Asset / hosting workflow (if you pick path A)
```
curl -L <whoosh-cdn-url> -o /tmp/clip1.mp4
ffmpeg -i /tmp/clip1.mp4 -c:v libx264 -crf 23 -preset slow -c:a aac -b:a 128k /tmp/clip1-encoded.mp4
lovable-assets create --file /tmp/clip1-encoded.mp4 --filename real-results-1.mp4 > src/assets/real-results-1.mp4.asset.json
```
Then import the `.url` field into `CLIPS`.

### CSS techniques explicitly applied (per your spec)
- `position: sticky` → PDP right rail (`top: 96px`).
- `position: fixed` + `transform: translateY()` → `FloatingProductFollower`, mobile `StickyMobileCTA`.
- CSS Grid (`grid-cols-[1fr_380px]`) → PDP layout.
- `z-index` ladder → WhatsApp/TextUs `z-50`, Follower `z-45`, AnnouncementBar `z-40`.
- `font-family: monospace` (JetBrains Mono) → data + eyebrows.

### Out of scope (call out so we don't drift)
- No backend / RLS / pricing changes.
- No new routes; consultation CTAs reuse `/quiz`.
- 10-pack remains in `products.ts` for PDP — only hidden from card.
- Sitemap / SEO untouched.

### Verification
- `bunx vitest run src/test/footer.test.tsx` (no behavior change expected).
- Browser preview at `/shop`, `/product/rt3-reta`, and home `#real-results` — check sticky behavior, unmute toggle, follower stacking against WhatsApp button at 1280 and 390 viewport widths.
