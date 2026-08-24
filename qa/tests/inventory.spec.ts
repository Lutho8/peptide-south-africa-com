import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import {
  PageInventory,
  ensureReportsDir,
  extractPageInfo,
  normalizeHref,
  settle,
} from './helpers';

const MAX_DEPTH = 2;
const MAX_PAGES = 80;

/**
 * Crawls the site from the homepage (same-origin, max depth 2), records
 * status/title/meta/h1/broken links/broken images for every route, and writes
 * qa/reports/inventory.json. This inventory drives errors.spec.ts and
 * quality.spec.ts.
 */
test.describe('inventory crawl', () => {
  test.describe.configure({ mode: 'serial' });

  test('crawl site and build inventory @smoke', async ({ page, baseURL }) => {
    test.setTimeout(10 * 60 * 1000);
    ensureReportsDir();
    const origin = baseURL!;
    const visited = new Map<string, PageInventory>();
    const queue: Array<{ path: string; depth: number }> = [{ path: '/', depth: 0 }];

    while (queue.length && visited.size < MAX_PAGES) {
      const { path: p, depth } = queue.shift()!;
      if (visited.has(p)) continue;

      let status: number | null = null;
      let info: Omit<PageInventory, 'url' | 'path' | 'status'>;
      let links: string[] = [];
      try {
        const res = await page.goto(p, { waitUntil: 'domcontentloaded', timeout: 30_000 });
        status = res ? res.status() : null;
        await settle(page);
        info = await extractPageInfo(page, status);
        if (depth < MAX_DEPTH) {
          const hrefs = await page.locator('a[href]').evaluateAll((els) =>
            els.map((e) => (e as HTMLAnchorElement).getAttribute('href') || '')
          );
          links = hrefs
            .map((h) => normalizeHref(h, origin))
            .filter((x): x is string => !!x);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        info = {
          title: null, metaDescription: null, h1: null,
          brokenLinks: [], brokenImages: [],
          error: message.slice(0, 300),
        };
      }

      visited.set(p, { url: origin + p, path: p, status, ...info });
      for (const l of links) {
        if (!visited.has(l) && !queue.some((q) => q.path === l)) {
          queue.push({ path: l, depth: depth + 1 });
        }
      }
    }

    const pages = Array.from(visited.values());
    const petsRelated = pages.filter((p) => /\bpets?\b|\bvets?(erinary)?\b|\banimals?\b|canine|feline/i.test(p.path + ' ' + (p.title || '') + ' ' + (p.h1 || '')));

    const out = {
      generatedAt: new Date().toISOString(),
      baseURL: origin,
      maxDepth: MAX_DEPTH,
      pageCount: pages.length,
      petsSectionFound: petsRelated.length > 0,
      petsPages: petsRelated.map((p) => p.path),
      missingRequirements: petsRelated.length === 0
        ? ['No "Pets" section/journey discovered on the site during crawl (depth 2 from homepage).']
        : [],
      pages,
    };

    fs.writeFileSync(
      path.join(ensureDir(), 'inventory.json'),
      JSON.stringify(out, null, 2)
    );
    console.log(`Inventory: ${pages.length} pages crawled. Pets section: ${out.petsSectionFound}`);
  });
});

function ensureDir() {
  ensureReportsDir();
  return path.resolve(__dirname, '..', 'reports');
}
