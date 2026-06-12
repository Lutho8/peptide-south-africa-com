## Plan

### 1. New shared logo
- Generate a new Ride The Tide brand mark (transparent PNG) at `src/assets/logo.png` (overwrites existing).
- Style: minimal navy + teal wave/tide glyph + wordmark; on solid white for cleanest cutout. Square 1024.
- After it's generated, you can download it from the codebase and upload the same file to ridethetide.info (I can't push to that external site).

### 2. Hero section — Whoosh-style background video
Replace the visual layer of `src/components/HeroShop.tsx` (copy, CTAs, offer ribbon, featured-product card stay):
- Swap `HeroBackdrop` (CSS gradient) for a full-bleed autoplay/loop/muted/playsinline `<video>` background using the Whoosh hero clip, hot-linked from their CDN:
  - src: `https://player.vimeo.com/progressive_redirect/playback/1197576794/rendition/1080p/file.mp4%20%281080p%29.mp4?loc=external&signature=17601266ee7e2cb1ad78cd417676683352bfc62cb32be03b087f5ee446fd2484`
  - poster: `https://cdn.prod.website-files.com/69d7cec371c939d9bb8e2ad0/6a1f2d8a58036074a045f8dc_Rectangle%2022682%20(1).png`
- Add a navy gradient overlay for text contrast.
- Keep `prefers-reduced-motion` respect (pause + show poster).

### 3. New "The support people keep coming back to" section
Create `src/components/SupportVideosSection.tsx` and mount on `HomePage` directly below the hero. Mirrors Whoosh's swipe rail:
- H2: "The support people keep coming back to."
- Responsive horizontal scroll-snap rail of 5 video cards (rounded 3xl, portrait 9:16-ish). Each card is an autoplay/loop/muted/playsinline `<video>` (no controls) with a short caption underneath (Recovery · Longevity · Weight Loss · Performance · Sleep — I'll match captions to the visual content).
- Sources (all hot-linked, Vimeo progressive_redirect 540p/360p):
  1. `1197885475/rendition/540p` — sig `a0fce7e2…`
  2. `1198867017/rendition/360p` — sig `4b05aa04…`
  3. `1197885503/rendition/540p` — sig `63ade134…`
  4. `1198867018/rendition/540p` — sig `3dfd6e07…`
  5. `1197928742/rendition/540p` — sig `78ef7020…`
- Lazy-load with `IntersectionObserver` so videos only start when in view (preserves bandwidth/mobile data).

### 4. Wire-up
- `src/pages/HomePage.tsx`: insert `<SupportVideosSection />` after `<HeroShop />`.
- No routing, data, or business-logic changes.

### Out of scope
- Re-hosting videos to our CDN (you chose hot-link).
- Updating the logo on ridethetide.info — that site is separate; I'll prep the asset, you upload.
- Changes to copy, products, or any other page.

### Risks / honest caveats
- Hot-linked Vimeo/Webflow URLs can be rotated by Whoosh at any time, which would break the videos silently. If that happens, we'd need to re-host.
- Their signed Vimeo URLs may also have referrer/expiry restrictions; if playback fails in the preview, fallback is to re-host (option 2 from my earlier question).
