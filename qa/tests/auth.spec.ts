import { test, expect } from '@playwright/test';
import { settle } from './helpers';
import { personas, invalidInputs } from '../fixtures/personas';

/**
 * Auth: login renders, invalid login shows error, password recovery validates
 * email. No real account creation on production.
 */
test.describe('auth', () => {
  test('login page renders @smoke', async ({ page }) => {
    const res = await page.goto('/auth', { waitUntil: 'domcontentloaded' });
    if (!res || res.status() >= 400) test.skip(true, 'no /auth route on this site');
    await settle(page);
    const email = page.locator('input[type="email"]').first();
    await expect(email, 'no email field on auth page').toBeVisible();
    const password = page.locator('input[type="password"]').first();
    await expect(password, 'no password field on auth page').toBeVisible();
  });

  test('invalid login shows an error, no session granted @smoke', async ({ page }) => {
    const res = await page.goto('/auth', { waitUntil: 'domcontentloaded' });
    if (!res || res.status() >= 400) test.skip(true, 'no /auth route');
    await settle(page);

    const email = page.locator('input[type="email"]').first();
    const password = page.locator('input[type="password"]').first();
    if (!(await email.isVisible().catch(() => false))) test.skip(true, 'no login form');

    await email.fill(personas.retail_customer.email);
    await password.fill('definitely-wrong-password-123!');
    const submit = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Log in")').first();
    await submit.click();
    await page.waitForTimeout(3000);

    const text = (await page.locator('body').innerText()).toLowerCase();
    const hasError = /invalid|incorrect|wrong|error|failed|credentials|not found/.test(text);
    const onAccount = /\/account/.test(page.url());
    expect(onAccount, 'invalid credentials navigated to /account — auth may be broken').toBeFalsy();
    expect(hasError, 'no error feedback shown for invalid login').toBeTruthy();
  });

  test('password recovery validates email format', async ({ page }) => {
    const res = await page.goto('/auth', { waitUntil: 'domcontentloaded' });
    if (!res || res.status() >= 400) test.skip(true, 'no /auth route');
    await settle(page);

    const forgot = page.locator('a:has-text("Forgot"), button:has-text("Forgot"), a:has-text("Reset password"), button:has-text("Reset")').first();
    if (!(await forgot.isVisible().catch(() => false))) {
      test.skip(true, 'no password recovery affordance found');
      return;
    }
    await forgot.click();
    await settle(page, 400);

    const email = page.locator('input[type="email"]').first();
    await expect(email, 'no email field in recovery form').toBeVisible();
    await email.fill(invalidInputs.badEmail);
    const submit = page.locator('button[type="submit"], button:has-text("Send"), button:has-text("Reset")').first();
    if (await submit.isVisible().catch(() => false)) await submit.click().catch(() => {});
    await page.waitForTimeout(500);
    const validity = await email.evaluate((e: HTMLInputElement) => e.checkValidity()).catch(() => true);
    const errText = await page.locator('[role="alert"], [class*="error" i]').allTextContents().catch(() => []);
    expect(
      validity === false || errText.join(' ').length > 0,
      'recovery form accepted invalid email with no feedback'
    ).toBeTruthy();
  });
});
