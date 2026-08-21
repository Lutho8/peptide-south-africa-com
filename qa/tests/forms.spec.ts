import { test, expect } from '@playwright/test';
import { expectHealthyPage, settle } from './helpers';
import { personas, invalidInputs } from '../fixtures/personas';

/**
 * Forms: telehealth intake/quiz, B2B enquiry, contact/newsletter.
 * On production we assert CLIENT-SIDE validation only and never submit forms
 * that would create real leads, unless a test mode is detectable.
 */
test.describe('forms', () => {
  test('quiz funnel renders and steps through @smoke', async ({ page }) => {
    const res = await page.goto('/quiz', { waitUntil: 'domcontentloaded' });
    if (!res || res.status() >= 400) test.skip(true, 'no /quiz route on this site');
    await settle(page);

    const bodyText = await page.locator('body').innerText();
    expect(/quiz|protocol|goal|step|start/i.test(bodyText), 'quiz page lacks expected content').toBeTruthy();

    // Try to advance one step by clicking the first actionable option/button
    const option = page.locator('button:visible, [role="button"]:visible, label:visible').first();
    if (await option.isVisible().catch(() => false)) {
      await option.click().catch(() => {});
      await settle(page, 400);
    }
    // Multi-step indicator check (soft)
    const stepText = await page.locator('body').innerText();
    if (!/step|question|of\s+\d|progress/i.test(stepText)) {
      console.warn('No multi-step indicator detected on quiz page — verify funnel UX manually');
    }
  });

  test('quiz/email capture validates bad email', async ({ page }) => {
    const res = await page.goto('/quiz', { waitUntil: 'domcontentloaded' });
    if (!res || res.status() >= 400) test.skip(true, 'no /quiz route on this site');
    await settle(page);

    const email = page.locator('input[type="email"]').first();
    if (!(await email.isVisible().catch(() => false))) {
      test.skip(true, 'no email field on first quiz step (multi-step — validation covered at first step only)');
      return;
    }
    await email.fill(invalidInputs.badEmail);
    // Attempt advance without submitting a real lead
    await page.keyboard.press('Tab');
    const submit = page.locator('button[type="submit"], button:has-text("Next"), button:has-text("Continue")').first();
    if (await submit.isVisible().catch(() => false)) await submit.click().catch(() => {});
    await page.waitForTimeout(500);
    const validity = await email.evaluate((e: HTMLInputElement) => e.checkValidity());
    const errorText = await page.locator('[role="alert"], .error, [class*="error" i]').allTextContents().catch(() => []);
    expect(
      validity === false || errorText.join(' ').length > 0,
      'bad email accepted without any validation feedback'
    ).toBeTruthy();
  });

  test('B2B / clinician enquiry form renders and validates', async ({ page }) => {
    // B2B enquiry lives on /clinician, /affiliate or contact surfaces — probe several
    const candidates = ['/clinician', '/affiliate', '/contact', '/wholesale'];
    let target: string | null = null;
    for (const c of candidates) {
      const res = await page.goto(c, { waitUntil: 'domcontentloaded' }).catch(() => null);
      if (res && res.status() < 400) {
        await settle(page);
        if ((await page.locator('form').count()) > 0) { target = c; break; }
      }
    }
    if (!target) {
      test.info().annotations.push({ type: 'missing', description: 'No B2B enquiry form found on /clinician, /affiliate, /contact or /wholesale' });
      test.skip(true, 'no B2B enquiry form discovered');
      return;
    }

    const p = personas.b2b_buyer;
    const form = page.locator('form').first();
    const email = form.locator('input[type="email"]').first();
    if (await email.isVisible().catch(() => false)) {
      await email.fill(invalidInputs.badEmail);
      await page.keyboard.press('Tab');
      const submit = form.locator('button[type="submit"], button:has-text("Send"), button:has-text("Submit")').first();
      if (await submit.isVisible().catch(() => false)) await submit.click().catch(() => {});
      await page.waitForTimeout(500);
      const validity = await email.evaluate((e: HTMLInputElement) => e.checkValidity()).catch(() => true);
      expect(validity, 'B2B form accepted invalid email').toBeFalsy();

      // good input fills but we do NOT submit on production
      await email.fill(p.email);
      expect(await email.evaluate((e: HTMLInputElement) => e.checkValidity())).toBeTruthy();
    }
  });

  test('newsletter/contact form validation @smoke', async ({ page }) => {
    test.setTimeout(45_000);
    await expectHealthyPage(page, '/');
    // Prefer the footer newsletter form; first input may live in a hidden modal
    const footerEmail = page.locator('footer input[type="email"]:visible').first();
    const anyEmail = page.locator('input[type="email"]:visible').first();
    const email = (await footerEmail.count()) ? footerEmail : anyEmail;
    if (!(await email.isVisible().catch(() => false))) {
      test.skip(true, 'no visible newsletter/contact email field on homepage');
      return;
    }
    await email.scrollIntoViewIfNeeded();
    await email.fill(invalidInputs.badEmail);
    const form = email.locator('xpath=ancestor::form[1]');
    const submit = (await form.count())
      ? form.locator('button[type="submit"], button:has-text("Subscribe"), button:has-text("Sign")').first()
      : page.locator('footer button:has-text("Subscribe")').first();
    if (await submit.isVisible().catch(() => false)) {
      await submit.click({ timeout: 5000, force: true }).catch(() => {});
    }
    await page.waitForTimeout(400);
    const validity = await email.evaluate((e: HTMLInputElement) => e.checkValidity()).catch(() => true);
    expect(validity, 'newsletter form accepted invalid email').toBeFalsy();
  });
});
