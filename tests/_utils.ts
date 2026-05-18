import { Page } from "@playwright/test";

export async function acceptAgeGate(page: Page) {
  // The age modal traps interaction until accepted. Click any 18+ confirm button.
  const candidates = [
    page.getByRole("button", { name: /18\+|enter|confirm|i am/i }),
    page.locator('[data-testid="age-confirm"]'),
  ];
  for (const c of candidates) {
    if (await c.first().isVisible().catch(() => false)) {
      await c.first().click().catch(() => {});
      return;
    }
  }
}

export async function dismissDiscountPopup(page: Page) {
  // The 10% off popup appears after 5s. Close it if present.
  const close = page.locator('[aria-label="Close"], button:has(svg.lucide-x)').first();
  if (await close.isVisible().catch(() => false)) {
    await close.click().catch(() => {});
  }
}

export async function switchCurrency(page: Page, target: "EUR" | "ZAR") {
  const trigger = page.getByRole("button", { name: /change currency/i });
  await trigger.click();
  const label = target === "EUR" ? /EUR/ : /ZAR/;
  await page.getByRole("button", { name: label }).last().click();
}

export async function addFirstProductToCart(page: Page) {
  await page.goto("/shop");
  await acceptAgeGate(page);
  // Click first product card → product page → add to cart.
  const firstCardLink = page.locator('a[href^="/product/"]').first();
  await firstCardLink.click();
  const addBtn = page.getByRole("button", { name: /add to cart|in den warenkorb/i }).first();
  await addBtn.click();
}
