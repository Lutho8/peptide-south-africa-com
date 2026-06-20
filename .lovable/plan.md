## Goal

Add automated tests + CI artifacts covering three concerns:

1. Mobile sticky header always shows a high-contrast **Peptide Tracker** CTA across scroll and route changes.
2. Every quiz outcome deep-link routes to the correct cart-ready stack and preserves selected items in the cart.
3. Brand-guard CI uploads a structured scan report (matched tokens + file paths) as a workflow artifact.

No product/UI behaviour changes — tests + CI only.

---

## 1. Responsive sticky-header test

New file: `src/test/sticky-header-tracker.test.tsx` (Vitest + React Testing Library, already set up).

- Mock viewport to 390×844 via `window.matchMedia` + `window.innerWidth`.
- Render `<App />` (or just `<Header />` + `<StickyMobileCTA />` inside `MemoryRouter`) at routes `/`, `/shop`, `/quiz`, `/research`.
- Assertions per route:
  - A `Peptide Tracker` link/button is in the document.
  - It carries the high-contrast class combo (`bg-white` + `text-[#0a2540]`, or the documented inverse — pulled from current component, not hard-coded guesses).
  - `getComputedStyle` (jsdom) shows it remains in the sticky container (`position: fixed` / `sticky`).
- Simulate scroll past 400px (`window.scrollY = 800; dispatchEvent('scroll')`) and re-assert visibility on each route.
- Snapshot the rendered CTA markup for regression.

Helper: `src/test/utils/renderWithRouter.tsx` for `MemoryRouter` + `CartProvider` + `QueryClientProvider` boilerplate (reused by quiz tests below).

## 2. Quiz deep-link E2E-style tests

End-to-end in the browser sense is overkill — keep them as integration tests inside Vitest + jsdom, which is consistent with the existing test setup. Playwright is not currently installed; adding it would balloon CI time. Call out the trade-off and offer Playwright as an alternative below.

New file: `src/test/quiz-deeplinks.test.tsx`.

- Table-driven test cases, one per quiz outcome category derived from `QuizFunnelPage.tsx` (fat-loss, recovery, longevity, cognition, single-product fallback, no-match fallback).
- For each case:
  1. Seed `localStorage['psa-quiz-result']` with a fixture mimicking `aiProtocol` output.
  2. Render `<App />` at the deep-link URL the quiz would generate (`/shop?stack=ID1,ID2&from=quiz`, `/product/<slug>?from=quiz`, `/shop?category=<x>&from=quiz`).
  3. Assert `QuizResultBanner` renders.
  4. Assert the correct product IDs are listed in the stack section.
  5. Click "Add stack to cart" and assert `CartContext` now contains exactly those IDs (read via a small `<CartProbe />` test component that subscribes to context).
  6. Navigate to `/cart`; assert items persist (CartContext is localStorage-backed).
- Fixtures live in `src/test/fixtures/quiz-outcomes.ts`.

## 3. Brand-guard CI artifact

Edit `scripts/security/scan-brand.mjs`:

- Always write a JSON + Markdown report to `brand-guard-report/` regardless of pass/fail:
  - `report.json`: `{ scannedFiles, matches: [{file, line, snippet, token}], envMatches, generatedAt, status }`.
  - `report.md`: human-readable table grouped by file, with offending lines highlighted.
- On match, still exit non-zero (preserve current behaviour) **after** writing the report.

Edit `.github/workflows/brand-guard.yml`:

- Wrap the scan step in `continue-on-error: false` but add `if: always()` upload step:
  ```yaml
  - name: Upload brand-guard report
    if: always()
    uses: actions/upload-artifact@v4
    with:
      name: brand-guard-report
      path: brand-guard-report/
      retention-days: 14
  ```
- Add a final "Annotate failures" step that uses `::error file=...,line=...::` GitHub workflow commands so matches appear inline in the PR Files tab.

## Files

New:
- `src/test/utils/renderWithRouter.tsx`
- `src/test/sticky-header-tracker.test.tsx`
- `src/test/quiz-deeplinks.test.tsx`
- `src/test/fixtures/quiz-outcomes.ts`

Edited:
- `scripts/security/scan-brand.mjs` — emit `brand-guard-report/{report.json,report.md}`.
- `.github/workflows/brand-guard.yml` — `actions/upload-artifact@v4` + GitHub annotations.

No production code (components/pages) is modified.

## Open question

Quiz tests: keep as Vitest+jsdom integration (fast, matches current setup) or add **Playwright** for true browser E2E (slower CI, new dep, but real navigation + storage)? I'll default to Vitest integration unless you say otherwise.
