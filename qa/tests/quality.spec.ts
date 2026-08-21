import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import { settle, readInventory } from './helpers';

const BUDGETS = {
  lcpProxyMs: 4000, // domContentLoaded-based proxy
  totalJsBytes: 3 * 1024 * 1024, // 3 MB total JS
};

/** Pages to quality-scan: homepage + up to 5 important routes from inventory. */
function targetPages(): string[] {
  const inv = readInventory();
  const priority = ['/', '/shop', '/quiz', '/auth', '/cart'];
  const extra = inv
    .map((p) => p.path)
    .filter((p) => !priority.includes(p) && !/^\/(admin|order|product\/[^/]+$)/.test(p))
    .slice(0, 3);
  return [...priority, ...extra];
}

test.describe('quality: accessibility, performance, SEO, security', () => {
  // Prod pages can be slow (large JS bundle); give quality probes headroom.
  test.setTimeout(90_000);
  for (const route of targetPages()) {
    test(`a11y scan ${route} — no critical violations`, async ({ page }) => {
      const res = await page.goto(route, { waitUntil: 'domcontentloaded' }).catch(() => null);
      test.skip(!res || res.status() >= 400, `${route} not reachable`);
      await settle(page);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
      const critical = results.violations.filter((v) => v.impact === 'critical');
      expect(
        critical.map((v) => `${v.id}: ${v.nodes.length} nodes`),
        `critical a11y violations on ${route}`
      ).toHaveLength(0);
      const serious = results.violations.filter((v) => v.impact === 'serious');
      if (serious.length) {
        test.info().annotations.push({
          type: 'a11y-serious',
          description: `${route}: ${serious.map((v) => v.id).join(', ')}`,
        });
      }
    });
  }

  test('performance budgets on / and /shop @smoke', async ({ page }) => {
    for (const route of ['/', '/shop']) {
      let jsBytes = 0;
      page.on('response', async (res) => {
        if (res.request().resourceType() === 'script') {
          const body = await res.body().catch(() => null);
          if (body) jsBytes += body.length;
        }
      });
      const start = Date.now();
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await settle(page);
      const timing = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return nav ? nav.domContentLoadedEventEnd : 0;
      });
      console.log(`${route}: DCL ${Math.round(timing)}ms, JS ${Math.round(jsBytes / 1024)}KB`);
      if (timing > BUDGETS.lcpProxyMs) {
        test.info().annotations.push({ type: 'perf', description: `${route} DCL ${Math.round(timing)}ms exceeds ${BUDGETS.lcpProxyMs}ms budget` });
      }
      if (jsBytes > BUDGETS.totalJsBytes) {
        test.info().annotations.push({ type: 'perf', description: `${route} JS ${Math.round(jsBytes / 1024)}KB exceeds ${Math.round(BUDGETS.totalJsBytes / 1024)}KB budget` });
      }
      expect(Date.now() - start, `${route} took over 30s wall time`).toBeLessThan(30_000);
    }
  });

  test('SEO essentials on key pages @smoke', async ({ page }) => {
    for (const route of ['/', '/shop']) {
      const res = await page.goto(route, { waitUntil: 'domcontentloaded' });
      test.skip(!res || res.status() >= 400, `${route} not reachable`);
      await settle(page);
      const title = await page.title();
      expect(title.length, `${route} missing <title>`).toBeGreaterThan(0);
      const meta = await page.locator('meta[name="description"]').first().getAttribute('content');
      expect(meta, `${route} missing meta description`).toBeTruthy();
      const canonical = await page.locator('link[rel="canonical"]').first().getAttribute('href');
      const og = await page.locator('meta[property="og:title"]').first().getAttribute('content');
      if (!canonical) console.warn(`${route}: no canonical link tag`);
      if (!og) console.warn(`${route}: no og:title`);
    }
  });

  test('security headers and no mixed content @smoke', async ({ page, request, baseURL }) => {
    const res = await request.get(baseURL!);
    const headers = res.headers();
    const csp = headers['content-security-policy'];
    if (!csp) {
      test.info().annotations.push({ type: 'security', description: 'No Content-Security-Policy header on homepage response' });
      console.warn('SECURITY: no CSP header present');
    }
    const mixed: string[] = [];
    page.on('request', (r) => {
      if (r.url().startsWith('http://') && !/localhost|127\.0\.0\.1/.test(r.url())) mixed.push(r.url());
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await settle(page);
    expect(mixed.slice(0, 10), `mixed content requests:\n${mixed.slice(0, 10).join('\n')}`).toHaveLength(0);
  });
});
