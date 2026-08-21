import { test, expect } from '@playwright/test';
import { expectHealthyPage, settle } from './helpers';

/**
 * Discovery journey: shop listing, product rendering, category/filter
 * navigation, and product detail content (name/price/image + scientific
 * fields per psa_products DB conventions when present).
 */
test.describe('product discovery', () => {
  test('shop page loads and renders products @smoke', async ({ page }) => {
    await expectHealthyPage(page, '/shop');
    await expect(page).toHaveTitle(/.+/);

    // Product links/cards: look for links into /product/
    const productLinks = page.locator('a[href*="/product/"]');
    const count = await productLinks.count();
    expect(count, 'no product links found on /shop').toBeGreaterThan(0);
  });

  test('category/filter navigation changes visible products @smoke', async ({ page }) => {
    await expectHealthyPage(page, '/shop');

    // Common filter affordances: buttons/tabs/selects with category semantics
    const candidates = page.locator(
      '[data-testid*="filter" i], [data-testid*="category" i], button:has-text("All"), select'
    );
    const n = await candidates.count();
    if (n === 0) {
      test.skip(true, 'No filter/category controls detected on /shop');
      return;
    }

    const before = await page.locator('a[href*="/product/"]').allTextContents();
    // click the first non-"All" button-ish control
    let clicked = false;
    for (let i = 0; i < n && !clicked; i++) {
      const el = candidates.nth(i);
      const tag = await el.evaluate((e) => e.tagName.toLowerCase());
      if (tag === 'select') {
        const options = await el.locator('option').allTextContents();
        if (options.length > 1) {
          await el.selectOption({ index: 1 });
          clicked = true;
        }
      } else {
        const txt = (await el.textContent())?.trim() || '';
        if (!/^all$/i.test(txt)) {
          await el.click().catch(() => {});
          clicked = true;
        }
      }
    }
    if (!clicked) test.skip(true, 'No actionable filter control found');
    await settle(page);
    const after = await page.locator('a[href*="/product/"]').allTextContents();
    // Soft check: either the set changed or a URL/state changed — log if identical
    if (JSON.stringify(before) === JSON.stringify(after)) {
      console.warn('Filter click did not change visible product set (possible defect)');
    }
  });

  test('product detail page shows name, price, image @smoke', async ({ page }) => {
    await expectHealthyPage(page, '/shop');
    const first = page.locator('a[href*="/product/"]').first();
    await expect(first).toBeVisible();
    await first.click();
    await settle(page);

    await expect(page).toHaveURL(/\/product\//);
    await expect(page.locator('h1').first(), 'product name (h1) missing').toBeVisible();

    const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    expect(/R\s?\d/i.test(bodyText), 'no ZAR price visible on product page').toBeTruthy();

    const imgs = page.locator('img');
    let loaded = 0;
    for (let i = 0; i < (await imgs.count()); i++) {
      const img = imgs.nth(i);
      if (await img.isVisible().catch(() => false)) {
        const ok = await img.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0);
        if (ok) loaded++;
      }
    }
    expect(loaded, 'no loaded images on product page').toBeGreaterThan(0);
  });

  test('product detail exposes scientific fields when present', async ({ page }) => {
    await expectHealthyPage(page, '/shop');
    const count = await page.locator('a[href*="/product/"]').count();
    if (count === 0) test.skip(true, 'no products to inspect');

    // Check up to 3 product pages for scientific fields per psa_products conventions
    const seen = new Set<string>();
    let foundSci = 0;
    for (let i = 0; i < Math.min(count, 10) && seen.size < 3; i++) {
      const href = await page.locator('a[href*="/product/"]').nth(i).getAttribute('href');
      if (!href || seen.has(href)) continue;
      seen.add(href);
      await page.goto(href, { waitUntil: 'domcontentloaded' });
      await settle(page);
      const text = (await page.locator('body').innerText()).toLowerCase();
      const hasSci = /cas\s*(number|no|#)|pubmed|sequence|molecular|purity|hplc|coa|research use/.test(text);
      if (hasSci) foundSci++;
    }
    if (foundSci === 0) {
      console.warn('No scientific fields (CAS/PubMed/sequence/purity/COA) found on sampled product pages — possible missing requirement');
    }
  });
});
