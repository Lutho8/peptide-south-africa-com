## Goal
Strip all Shopify integration and all `ridethetide` (Peptide Tracker) references from the site.

## Scope

### 1. Remove Shopify
- Search for any Shopify imports, SDK calls, checkout links, or product-sync code across `src/`, `supabase/functions/`, and configs.
- Based on current codebase scan, checkout uses PayFast (not Shopify), so likely no runtime Shopify code exists. Any stray mentions in copy, docs, or `.lovable/` memory will be removed.
- If a Shopify store is connected via the integration, call `shopify--disconnect_store` (build mode) so the project is no longer linked.

### 2. Remove ridethetide (Peptide Tracker) references
Delete UI, links, and copy pointing to `ridethetide.info` / "Peptide Tracker":

- `src/lib/contact.ts` — remove `TRACKER_URL` export.
- `src/components/StickyMobileCTA.tsx` — remove the Tracker button, keep Shop CTA full-width.
- `src/components/TrackerBridgeCard.tsx` — delete file; remove all imports/usages (likely `ProductPage.tsx`).
- `src/components/blog/BlogCTA.tsx` — drop the `tracker` and `both` variants; keep only Club CTA. Update `CTAVariant` type in `src/data/blog/types.ts` and any blog posts that set `cta: "tracker"` or `"both"` → change to `"club"`.
- `src/components/Footer.tsx` — remove the "Tracker ↗" external link.
- Blog posts under `src/data/blog/posts/` that promote the tracker (e.g. `peptide-tracker-app.ts`, `peptide-protocol-tracker.ts`, `how-to-track-peptide-cycles.ts`) — remove tracker links/CTAs from bodies; keep the articles themselves unless the user wants them deleted (see question below).
- `src/test/sticky-header-tracker.test.tsx` — update or remove test asserting tracker button presence.
- `public/llms.txt`, `public/sitemap*.xml`, `scripts/generate-sitemap.ts` — remove any tracker URLs.
- `.github/workflows/brand-guard.yml` + `scripts/security/scan-brand.mjs` — the current allowlist explicitly permits `ridethetide.info`. Tighten the regex to fail on any `ridethetide` occurrence so it can't be reintroduced.
- `.lovable/memory/` and `.lovable/plan.md` — scrub tracker mentions.

### 3. Verify
- Run `bun test` (unit tests) and the brand-guard scanner to confirm zero remaining matches.
- Grep for `ridethetide`, `Tracker`, `shopify` (case-insensitive) → should return only the tightened guard rule.

## Open questions

1. **Blog posts specifically about the tracker** (`peptide-tracker-app.ts`, `peptide-protocol-tracker.ts`, `how-to-track-peptide-cycles.ts`) — delete them entirely, or keep the articles and just strip the outbound tracker links/CTAs?
2. **Shopify integration** — should I also call `shopify--disconnect_store` to sever the backend connection, or only remove code/copy references?
