# Fix: images not loading on peptide-south-africa.com

## Root cause

All broken images use Lovable's CDN asset path `/__l5e/assets-v1/...`. On the custom domain that path returns the SPA's `index.html` (content-type `text/html`) instead of the image binary — the asset CDN route is not wired up for custom domains. The same URLs work on `tide-shop-clone.lovable.app`.

Affected assets (all currently CDN-only, no local copy):
- `src/assets/logo-horizontal.png.asset.json`
- `src/assets/logo-icon.png.asset.json`
- `src/assets/vials/bpc.jpg.asset.json`
- `src/assets/vials/ghk.jpg.asset.json`
- `src/assets/vials/glow.jpg.asset.json`
- `src/assets/vials/klow.jpg.asset.json`
- `src/assets/vials/mots.jpg.asset.json`
- `src/assets/vials/rt3.jpg.asset.json`
- `src/assets/vials/tesa.jpg.asset.json`
- `src/assets/vials/tz2.jpg.asset.json`

## Fix

Reverse the CDN migration for these 10 files so they ship in the Vite bundle and are served from the same origin as the HTML (works on any domain).

1. Download each binary from its working `/__l5e/...` URL via the `tide-shop-clone.lovable.app` host and write it back to its original path (e.g. `src/assets/vials/rt3.jpg`).
2. Delete the matching `.asset.json` pointer files.
3. Update every import site to import the binary directly (`import rt3 from "./vials/rt3.jpg"`) instead of the `.asset.json` pointer.
4. Verify with the production build and a Playwright pass against the local preview — confirm `document.images` reports zero broken images.

## Notes

- No changes to layout, copy, or business logic.
- This sidesteps the infra bug; if Lovable later fixes custom-domain CDN routing we can re-migrate, but bundling is the safer default for first-paint critical art (logos, product hero vials).
- Total added repo weight ≈ ~1 MB (8 vial JPGs + 2 logo PNGs).
