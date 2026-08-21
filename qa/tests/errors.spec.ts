import { test, expect } from '@playwright/test';
import { settle, readInventory } from './helpers';

/**
 * Error handling: 404 page and broken internal links surfaced by the
 * inventory crawl. Run inventory.spec.ts first to populate inventory.json.
 */
test.describe('error handling', () => {
  test('bogus route renders a 404 page @smoke', async ({ page }) => {
    const res = await page.goto('/this-route-should-not-exist-qa-404', { waitUntil: 'domcontentloaded' });
    await settle(page);
    const status = res ? res.status() : 0;
    const text = (await page.locator('body').innerText()).toLowerCase();
    const looks404 = /404|not found|doesn'?t exist|page.*missing/.test(text);
    // SPAs often return 200 with a client-side NotFound — accept either, but one must hold
    expect(
      status === 404 || looks404,
      `bogus route: HTTP ${status}, no 404 messaging — soft-404 defect`
    ).toBeTruthy();
    if (status === 200 && looks404) {
      test.info().annotations.push({
        type: 'seo-defect',
        description: 'Soft 404: bogus route returns HTTP 200 (SEO issue; should be 404 status)',
      });
    }
  });

  test('inventory: no broken internal links (4xx/5xx)', async () => {
    const pages = readInventory();
    test.skip(pages.length === 0, 'inventory.json missing or empty — run inventory.spec.ts first');
    const failures: string[] = [];
    for (const p of pages) {
      for (const b of p.brokenLinks) failures.push(`${p.path} :: ${b}`);
    }
    expect(failures, `broken internal links:\n${failures.slice(0, 30).join('\n')}`).toHaveLength(0);
  });

  test('inventory: all crawled pages returned < 400', async () => {
    const pages = readInventory();
    test.skip(pages.length === 0, 'inventory.json missing or empty');
    const bad = pages.filter((p) => (p.status ?? 0) >= 400 || p.error);
    expect(
      bad.map((p) => `${p.path} -> ${p.status ?? p.error}`),
      'crawled pages with errors'
    ).toHaveLength(0);
  });

  test('inventory: no broken images on crawled pages', async () => {
    const pages = readInventory();
    test.skip(pages.length === 0, 'inventory.json missing or empty');
    const failures: string[] = [];
    for (const p of pages) {
      for (const img of p.brokenImages) failures.push(`${p.path} :: ${img}`);
    }
    expect(failures, `broken images:\n${failures.slice(0, 30).join('\n')}`).toHaveLength(0);
  });
});
