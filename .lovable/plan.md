# Rebrand cleanup — Peptide South Africa

## 1. Purge remaining "Ride The Tide" / stale-domain strings

Found via `rg -i "ride.?the.?tide|ridethetide|tide-shop"`:

- **`public/llms.txt`** — every `https://www.ridethetide.site/...` URL (≈12 occurrences) → `https://www.peptide-south-africa.com/...`. Also update the bottom `Website:` line.
- **`src/pages/ShopPage.tsx`**, **`src/pages/ResearchHubPage.tsx`**, **`src/pages/ClinicianPage.tsx`** — `const SITE_URL = "https://tide-shop-clone.lovable.app"` → `"https://www.peptide-south-africa.com"`.
- **`.lovable/plan.md`** — replace old plan body with a one-line note (it's a working doc, but it still contains the phrase and shouldn't pollute future searches).

Tracker external URL `https://ridethetide.info` **stays** (per your answer) but every visible label becomes "Peptide Tracker":
- `src/components/Header.tsx` nav item `Tracker` (already short — keep label "Tracker", but ensure the visible "Peptide Tracker" tooltip/aria reads correctly; the host URL is invisible).
- `src/components/Footer.tsx` — link text "Tracker ↗" stays neutral.
- `src/components/EcosystemSection.tsx` — confirm card title says "Peptide Tracker" not "Ride The Tide".
- `src/components/blog/BlogCTA.tsx` — same.
- `src/components/TrackerBridgeCard.tsx` — same.

(These components don't currently print "Ride The Tide" text, only the URL — so visually they're already neutral. I'll audit each and adjust any stray copy to "Peptide Tracker".)

## 2. Regenerate full icon + manifest set from Peptide SA logo

Source: `src/assets/logo-icon.png.asset.json` (existing brand mark).

Pipeline (Python/Pillow in the sandbox):
1. Download the CDN logo to `/tmp/logo-src.png`.
2. Composite onto a navy `#0a2540` square (rounded corners, 12% padding) → master 1024×1024.
3. Resize with LANCZOS to:
   - `public/icon-512.png` (512×512, maskable-safe)
   - `public/icon-192.png` (192×192, maskable-safe)
   - `public/apple-touch-icon.png` (180×180, no rounding — iOS masks)
   - `public/favicon.png` (32×32)
   - `public/favicon-16.png` (16×16)
4. Update `public/site.webmanifest`:
   - Confirm name/short_name = "Peptide South Africa" / "Peptide SA" ✅ (already set)
   - Keep theme_color `#0a2540`
   - Add separate `"purpose": "maskable"` and `"purpose": "any"` entries (current single entry mixes both, which Android renders oddly).
5. `index.html` — add `<link rel="icon" sizes="16x16" href="/favicon-16.png">` next to the existing 32px favicon line.

## 3. OAuth & email copy alignment

**OAuth UI copy (`src/pages/AuthPage.tsx`)** — add a reassurance line under the Google button: *"You'll be redirected to Google to authorize Peptide South Africa."* Verify no other strings reference the old brand.

**Email templates** — `supabase/functions/_shared/` is currently empty (no auth-email-hook or transactional templates scaffolded yet). No template strings to update. If/when you scaffold them later, they'll inherit the brand from `index.html`/manifest.

**Out of scope (project-settings, not code):**
- The Lovable **project display name** — still controls the Google consent screen string. You must rename it in Project Settings to fully remove "Ride The Tide Shop Build" from the consent prompt.
- Detaching `ridethetide.site` / `www.ridethetide.site` custom domains (Project Settings → Domains).

I'll surface both as reminders after the code changes ship.

## Technical Details

- Image generation: `pip`-free; sandbox already has Pillow. Script writes to `/tmp/icon-gen.py` then runs once.
- All file writes are parallel where independent (icons, page constants, llms.txt).
- No DB, edge-function, RLS, or auth-logic changes.
- No new dependencies.

## Files touched

- `public/llms.txt`, `public/site.webmanifest`, `public/favicon.png`, `public/favicon-16.png` (new), `public/icon-192.png`, `public/icon-512.png`, `public/apple-touch-icon.png`
- `index.html` (add 16px favicon link)
- `src/pages/ShopPage.tsx`, `src/pages/ResearchHubPage.tsx`, `src/pages/ClinicianPage.tsx`, `src/pages/AuthPage.tsx`
- `src/components/EcosystemSection.tsx`, `src/components/TrackerBridgeCard.tsx`, `src/components/blog/BlogCTA.tsx` (label audit only)
- `.lovable/plan.md` (clear stale plan body)
