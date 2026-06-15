---
name: Cart & Upsell Behavior
description: FBT rules on PDP + cart, post-add modal triggers once per session, free-shipping threshold R1,500
type: feature
---
- **Frequently Bought Together** appears on PDP (below product detail) and inside CartDrawer (compact). Source: `src/data/bundles.ts` (`BUNDLE_MAP`).
- **PostAddUpsellModal** mounts once globally in `App.tsx`. Fires after the first add-to-cart of a session (cart goes 0→1). Stores `psa_postadd_shown` in `sessionStorage` to prevent re-firing.
- Free-shipping threshold = **R1,500** (ZAR). Surfaced in CartDrawer with progress bar.
- One-click "Add bundle" silently adds picks; never duplicates the anchor product.
