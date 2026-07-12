## Goal
Replace the blank avatar tiles in `CustomerProofStrip` with the same autoplaying testimonial video clips used in `SupportVideosSection`, so the "customer proof" band above the featured quote feels alive instead of empty.

## Changes

### `src/components/CustomerProofStrip.tsx`
- Reuse the 5 Vimeo clips already defined in `SupportVideosSection` (Recovery, Longevity, Weight loss, Performance, Sleep) — extract them into a shared `src/data/testimonialClips.ts` so both components pull from one source.
- Replace each `Avatar` tile with a muted, looped, autoplaying `<video>` (playsInline, `preload="metadata"`, lazy-loaded via IntersectionObserver, first tile eager) mirroring the pattern in `SupportVideosSection`.
- Keep the existing responsive layout (horizontal scroll on mobile, 5-col grid on md+) and the featured quote overlay from Supabase testimonials — only the tile media changes.
- Add a small tag chip (e.g. "Recovery") on each tile so the proof strip reads as themed clips, not decorative loops.
- Keep aspect ratio at `4/5` (matches current grid) rather than `9/16` to avoid layout shift.
- Preserve loading skeleton state for the featured-quote card only.

### `src/data/testimonialClips.ts` (new)
- Export the `CLIPS` array (`id`, `src`, `tag`, `caption`) so `SupportVideosSection` and `CustomerProofStrip` share one list.

### `src/components/SupportVideosSection.tsx`
- Import `CLIPS` from the new shared file instead of the inline constant. No visual change.

## Out of scope
- No audio/unmute controls on the proof strip (kept muted always to avoid competing with `SupportVideosSection`'s single-audio rule).
- No changes to Supabase `testimonials` data — the featured quote overlay still comes from the DB.
- No new videos sourced.
