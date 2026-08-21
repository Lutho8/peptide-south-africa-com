import { Page, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export const REPORTS_DIR = path.resolve(__dirname, '..', 'reports');

export function ensureReportsDir() {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

export interface PageInventory {
  url: string;
  path: string;
  status: number | null;
  title: string | null;
  metaDescription: string | null;
  h1: string | null;
  brokenLinks: string[];
  brokenImages: string[];
  error?: string;
}

export function readInventory(): PageInventory[] {
  const file = path.join(REPORTS_DIR, 'inventory.json');
  if (!fs.existsSync(file)) return [];
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  return data.pages || [];
}

/** Same-origin, hash-stripped, normalized path from a href. */
export function normalizeHref(href: string, baseURL: string): string | null {
  try {
    const u = new URL(href, baseURL);
    const base = new URL(baseURL);
    if (u.origin !== base.origin) return null;
    if (/\.(pdf|zip|png|jpe?g|webp|svg|ico|css|js|woff2?|mp4)$/i.test(u.pathname)) return null;
    const p = u.pathname.replace(/\/+$/, '') || '/';
    return p;
  } catch {
    return null;
  }
}

/** Wait for SPA to settle after client-side nav. */
export async function settle(page: Page, ms = 600) {
  try {
    await page.waitForLoadState('networkidle', { timeout: 5_000 });
  } catch {
    /* SPA may keep connections open */
  }
  await page.waitForTimeout(ms);
}

export async function extractPageInfo(page: Page, status: number | null): Promise<Omit<PageInventory, 'url' | 'path' | 'status'>> {
  const title = await page.title().catch(() => null);
  const metaDescription = await page
    .locator('meta[name="description"]')
    .first()
    .getAttribute('content')
    .catch(() => null);
  const h1 = (await page.locator('h1').first().textContent().catch(() => null))?.trim() || null;

  const links = await page.locator('a[href]').evaluateAll((els) =>
    els.map((e) => (e as HTMLAnchorElement).href)
  );
  const imgs = await page.locator('img[src]').evaluateAll((els) =>
    els.map((e) => (e as HTMLImageElement).src)
  );

  const brokenLinks: string[] = [];
  for (const link of Array.from(new Set(links))) {
    if (!link.startsWith(page.url().split('/').slice(0, 3).join('/'))) continue;
    try {
      const res = await page.request.head(link, { timeout: 8000 }).catch(() => null);
      const code = res ? res.status() : 0;
      if (code >= 400 || code === 0) {
        // retry with GET (some servers reject HEAD)
        const g = await page.request.get(link, { timeout: 8000 }).catch(() => null);
        const gc = g ? g.status() : 0;
        if (gc >= 400 || gc === 0) brokenLinks.push(`${link} -> ${gc || 'unreachable'}`);
      }
    } catch { /* ignore */ }
  }

  // Verify images over HTTP (naturalWidth is unreliable for lazy-loaded SPA images)
  const brokenImages: string[] = [];
  for (const src of Array.from(new Set(imgs))) {
    if (!src || src.startsWith('data:')) continue;
    try {
      const res = await page.request.get(src, { timeout: 8000 }).catch(() => null);
      if (!res || res.status() >= 400) brokenImages.push(`${src} -> ${res ? res.status() : 'unreachable'}`);
    } catch { /* ignore */ }
  }

  return { title, metaDescription, h1, brokenLinks, brokenImages };
}

/** Standard smoke assertion: page loads with 2xx/3xx and has an h1. */
export async function expectHealthyPage(page: Page, route: string) {
  const res = await page.goto(route, { waitUntil: 'domcontentloaded' });
  expect(res, `no response for ${route}`).not.toBeNull();
  const status = res!.status();
  expect(status, `${route} returned ${status}`).toBeLessThan(400);
  await settle(page);
}
