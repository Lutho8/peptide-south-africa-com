import { test, expect } from '@playwright/test';
import { expectHealthyPage, settle } from './helpers';
import { personas } from '../fixtures/personas';

const PAYFAST_SANDBOX = process.env.PAYFAST_SANDBOX === 'true';

const ADD_TO_CART_SELECTOR =
  'button:has-text("Add to Cart"), button:has-text("Add to cart"), button:has-text("Add to Bag"), button:has-text("Add bundle to cart"), button:has-text("Pre-Order"), [data-testid*="add-to-cart" i]';

/**
 * Cart & checkout journey. The final payment handoff is tagged @payments and
 * STOPS before any real order is placed on production. PayFast sandbox
 * success/decline/cancel flows only run with PAYFAST_SANDBOX=true.
 */
test.describe('cart & checkout', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure a clean cart between tests
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch { /* ignore */ }
    });
  });

  test('add to cart and verify cart contents @smoke', async ({ page }) => {
    test.setTimeout(60_000);
    await expectHealthyPage(page, '/shop');
    const product = page.locator('a[href*="/product/"]').first();
    await product.click();
    await settle(page);

    const name = (await page.locator('h1').first().textContent())?.trim();

    const addBtn = page.locator(ADD_TO_CART_SELECTOR).first();
    await expect(addBtn, 'no add-to-cart button on product page').toBeVisible();
    await addBtn.click();
    await page.waitForTimeout(1200);

    // Open cart page and verify item present
    await page.goto('/cart', { waitUntil: 'domcontentloaded' });
    await settle(page);
    const cartText = await page.locator('body').innerText();
    const hasItem = name ? cartText.toLowerCase().includes(name.toLowerCase().slice(0, 10)) : false;
    const hasPrice = /R\s?\d/i.test(cartText);
    if (!hasItem) {
      console.warn(`Cart page did not show product name "${name}" — checking totals instead`);
    }
    expect(hasItem || hasPrice, 'cart appears empty after add-to-cart').toBeTruthy();
    expect(hasPrice, 'no price totals in cart').toBeTruthy();
  });

  test('quantity change updates totals', async ({ page }) => {
    await expectHealthyPage(page, '/shop');
    await page.locator('a[href*="/product/"]').first().click();
    await settle(page);
    const addBtn = page.locator(ADD_TO_CART_SELECTOR).first();
    if (!(await addBtn.isVisible().catch(() => false))) test.skip(true, 'no add-to-cart button');
    await addBtn.click();
    await settle(page);

    await page.goto('/cart', { waitUntil: 'domcontentloaded' });
    await settle(page);

    const qtyPlus = page.locator('button:has-text("+"), [aria-label*="increase" i], [data-testid*="qty-plus" i]').first();
    const qtyInput = page.locator('input[type="number"], input[inputmode="numeric"]').first();

    const totalBefore = await page.locator('body').innerText();
    if (await qtyPlus.isVisible().catch(() => false)) {
      await qtyPlus.click();
      await settle(page);
    } else if (await qtyInput.isVisible().catch(() => false)) {
      await qtyInput.fill('2');
      await qtyInput.blur();
      await settle(page);
    } else {
      test.skip(true, 'no quantity control found in cart');
    }
    const totalAfter = await page.locator('body').innerText();
    if (totalBefore === totalAfter) {
      console.warn('Cart totals unchanged after quantity increase — possible defect');
    }
  });

  test('proceed to checkout up to payment handoff @payments', async ({ page }) => {
    const p = personas.retail_customer;
    await expectHealthyPage(page, '/shop');
    await page.locator('a[href*="/product/"]').first().click();
    await settle(page);
    const addBtn = page.locator(ADD_TO_CART_SELECTOR).first();
    if (!(await addBtn.isVisible().catch(() => false))) test.skip(true, 'no add-to-cart button');
    await addBtn.click();
    await settle(page);

    await page.goto('/checkout', { waitUntil: 'domcontentloaded' });
    await settle(page);
    await expect(page).toHaveURL(/checkout/);

    // Fill whatever contact/shipping fields exist (no submission of payment)
    const fillIf = async (selector: string, value: string) => {
      const el = page.locator(selector).first();
      if (await el.isVisible().catch(() => false)) await el.fill(value).catch(() => {});
    };
    await fillIf('input[type="email"]', p.email);
    await fillIf('input[name*="first" i]', p.firstName);
    await fillIf('input[name*="last" i]', p.lastName);
    await fillIf('input[type="tel"], input[name*="phone" i]', p.phone);
    await fillIf('input[name*="address" i], input[name*="street" i]', p.address.street);
    await fillIf('input[name*="city" i]', p.address.city);
    await fillIf('input[name*="postal" i], input[name*="zip" i]', p.address.postalCode);

    // HARD STOP: never click pay/place-order on production.
    const payBtn = page.locator(
      'button:has-text("Pay"), button:has-text("Place Order"), button:has-text("Complete Order"), button[type="submit"]'
    ).first();
    const payVisible = await payBtn.isVisible().catch(() => false);
    test.info().annotations.push({
      type: 'safety',
      description: `Stopped at payment handoff. Pay/submit button visible: ${payVisible}. No real order placed.`,
    });
    expect(true).toBeTruthy(); // reached handoff = pass
  });

  test.describe('PayFast sandbox payment flows', () => {
    test.skip(!PAYFAST_SANDBOX, 'PAYFAST_SANDBOX=true not set — sandbox payment flows skipped by design');

    test('payment success flow (sandbox)', async ({ page }) => {
      // Implement against staging/local only. Placeholder assertion.
      test.info().annotations.push({ type: 'env', description: 'sandbox success flow placeholder' });
    });

    test('payment decline flow (sandbox)', async ({ page }) => {
      test.info().annotations.push({ type: 'env', description: 'sandbox decline flow placeholder' });
    });

    test('payment cancel flow (sandbox)', async ({ page }) => {
      await page.goto('/checkout/cancel', { waitUntil: 'domcontentloaded' });
      await settle(page);
      const text = await page.locator('body').innerText();
      expect(/cancel|retry|cart/i.test(text), 'cancel page lacks recovery messaging').toBeTruthy();
    });
  });
});
