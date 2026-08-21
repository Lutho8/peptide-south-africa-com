# PSA QA — Playwright Test System

Production-grade QA for the Peptide South Africa ecosystem
(`https://peptide-south-africa.com` main storefront, `https://peptide-south-africa.co.za`).

## Setup

```bash
cd qa
npm install
npx playwright install        # chromium minimum; add webkit firefox for full matrix
```

## Running

| Command | What it does |
|---|---|
| `npm run test:inventory` | Crawl site (depth 2), write `reports/inventory.json` |
| `npm run test:smoke` | Non-destructive `@smoke` suite — safe against production |
| `npm test` | Full suite (all specs, all projects) |
| `npm test -- --project=chromium` | Single browser |
| `BASE_URL=https://peptide-south-africa.co.za npm test` | Target the .co.za site |
| `npm run report` | Merge JSON results + inventory into `reports/qa-report.md` |

**Run order matters:** `inventory.spec.ts` should run before `errors.spec.ts`
and `quality.spec.ts`, which consume `reports/inventory.json`. The CI workflow
does this; locally just run `npm run test:inventory` first.

## Browser projects

chromium (Desktop Chrome), webkit (Desktop Safari), firefox, mobile-chrome
(Pixel 7), mobile-safari (iPhone 14). `workers=4`, `fullyParallel`, retries 1
locally / 2 on CI. Traces, video, screenshots retained on failure in
`qa/test-results/`.

## Tags

- `@smoke` — read-only / client-side-only tests, safe on production. Never
  places orders, never submits real forms.
- `@payments` — checkout up to the payment handoff; **stops before paying**.
  PayFast sandbox success/decline/cancel specs auto-skip unless
  `PAYFAST_SANDBOX=true` (use against staging/local only).

## Personas

`fixtures/personas.ts`: retail_customer, subscriber, b2b_buyer,
telehealth_patient, mobile_shopper — realistic SA names, `+27` phones,
Cape Town / Johannesburg / Durban addresses. All emails use the
`qa+*@ridethetide.test` sink domain; never point them at real inboxes.

## Safety rules

1. No real orders on production — cart-checkout stops at the payment button.
2. No real lead submissions — forms specs assert client-side validation only,
   unless a test mode is detectable.
3. No account creation on production — auth specs use invalid credentials only.

## CI

`.github/workflows/qa.yml` runs on push/PR: installs, crawls, runs `@smoke`
then the full suite against `BASE_URL` (workflow_dispatch input `target_url`
overrides), uploads `test-results/` and `reports/` as artifacts.

## Reporting

`node report.js` produces `reports/qa-report.md` with four sections:

- **Confirmed defects** — reproducible failures + inventory defects (broken
  links/images, missing title/meta, 4xx/5xx pages).
- **Intermittent** — failed-then-passed after retry (flaky).
- **External-provider failures** — failures matching payment/Supabase/
  analytics/network patterns; route to the provider, not the app team.
- **Missing requirements** — e.g. Pets section not discovered, B2B form not
  found, scientific product fields absent.

## Maintenance

- Adding a test: create `tests/<area>.spec.ts`, import `helpers.ts` for
  `expectHealthyPage`/`settle`, tag with `@smoke` only if production-safe.
- Keep selectors semantic (`button:has-text`, `input[type=email]`) — the
  storefront is a Vite React SPA without stable test ids everywhere.
- If a crawl link checker gets flaky on HEAD requests, it already falls back
  to GET; prefer tuning timeouts over loosening assertions.
- Re-run `npm run test:inventory` after major site nav changes.
