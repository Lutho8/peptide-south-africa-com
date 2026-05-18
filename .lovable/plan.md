## Goal

An in-app SEO reindexing checklist for the admin/owner that:
- Lists the key URLs to re-inspect in Google Search Console after sitemap changes (`/`, `/shop`, `/fat-loss-protocol`, `/quiz`, `/research`, all 8 product pages).
- Tracks per-URL completion (checkbox + "last requested" timestamp).
- Auto-resets the checklist on a recurring cadence (default: every 14 days) so it nags again.
- Detects when `public/sitemap.xml` last changed and surfaces a "sitemap updated — re-run indexing" banner if any URL hasn't been re-inspected since that date.

## UX

New page `src/pages/admin/AdminSEOReindexPage.tsx` at route `/admin/seo-reindex`, plus a card link from `AdminIndexPage`.

Layout:
- Header: "SEO Re-indexing Checklist" + last sitemap-build date + days-until-next-cycle.
- Banner (if stale): "Sitemap updated on {date}. Re-request indexing for X of Y pages."
- Table rows per URL: checkbox · path · "Last requested: {relative time}" · "Open in Search Console" deep link (`https://search.google.com/search-console/inspect?resource_id=https://www.ridethetide.site/&id={url-encoded}`).
- Bulk actions: "Mark all done" · "Reset checklist".
- Footer note explaining the 14-day cycle is configurable.

## Data

Single table `seo_reindex_log`:
- `id` uuid PK
- `url` text not null
- `last_requested_at` timestamptz
- `cycle_started_at` timestamptz default now()
- `notes` text
- RLS: only authenticated users with `admin` role (via existing `has_role` pattern) can select/update.

Sitemap build date: at build time, the `scripts/generate-sitemap.ts` script writes a sibling `public/sitemap-meta.json` with `{ "generatedAt": ISO }`. The page fetches `/sitemap-meta.json` to display freshness and compute the staleness banner.

## Reminder mechanism (in-app)

Two layers:
1. **Visual badge in admin nav** — `AdminIndexPage` card shows a red dot when any URL is stale (sitemap newer than that URL's `last_requested_at`, OR no entry within current cycle window).
2. **Cycle reset** — when the page loads, if `now - cycle_started_at >= 14 days`, all rows reset (`last_requested_at = null`, `cycle_started_at = now()`).

No email/cron needed — the reminder appears whenever the user opens the admin area. (We can add an Inngest scheduled email later if you want; out of scope here.)

## Files to add / change

- `supabase/migrations/...` — new `seo_reindex_log` table + RLS + seed insert for the 13 known URLs.
- `scripts/generate-sitemap.ts` — also write `public/sitemap-meta.json`.
- `src/pages/admin/AdminSEOReindexPage.tsx` — new page.
- `src/pages/admin/AdminIndexPage.tsx` — add link card + stale badge.
- `src/App.tsx` — register `/admin/seo-reindex` route.

## Out of scope (ask if you want them)

- Email/Slack reminders on a schedule (would need Inngest + transactional email).
- Auto-calling the GSC API to submit indexing requests — Google's URL Inspection "Request Indexing" action has no public API; it must be done manually in the Search Console UI. The checklist optimises that manual click loop.
