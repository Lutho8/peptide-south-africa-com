/**
 * Visual regression coverage for the shared vial design tokens
 * (`src/lib/vialDesign.ts`). Snapshots the vial "studio plate" wherever it
 * appears: the PDP media gallery + callouts, the cart drawer tile, the cart
 * page tile, and the checkout order-summary tile. Any drift in the
 * white/light-teal medical-luxury look fails CI.
 *
 * Baselines live under `tests/vial-visual.spec.ts-snapshots/`. To refresh
 * them after an intentional design change, run:
 *
 *   bunx playwright test tests/vial-visual.spec.ts --update-snapshots
 */
import { expect, test } from "../playwright-fixture";
import {
  acceptAgeGate,
  addFirstProductToCart,
  dismissDiscountPopup,
} from "./_utils";

const SNAPSHOT_OPTS = {
  maxDiffPixelRatio: 0.02,
  animations: "disabled" as const,
};

test.describe("Vial branding — visual regression", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await acceptAgeGate(page);
    await dismissDiscountPopup(page);
  });

  test("PDP media gallery + vial callouts", async ({ page }) => {
    await page.goto("/shop");
    await acceptAgeGate(page);
    await page.locator('a[href^="/product/"]').first().click();
    const frame = page.locator('[data-testid="vial-frame"]').first();
    await frame.waitFor({ state: "visible" });
    await expect(frame).toHaveScreenshot("pdp-gallery-vial-frame.png", SNAPSHOT_OPTS);
  });

  test("Cart drawer line-item tile", async ({ page }) => {
    await addFirstProductToCart(page);
    // Post-add drawer opens automatically; if not, click the cart trigger.
    const drawerTile = page.locator('[data-testid="vial-frame"]').first();
    await drawerTile.waitFor({ state: "visible" });
    await expect(drawerTile).toHaveScreenshot("cart-drawer-tile.png", SNAPSHOT_OPTS);
  });

  test("Cart page line-item tile", async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto("/cart");
    const tile = page.locator('[data-testid="vial-frame"]').first();
    await tile.waitFor({ state: "visible" });
    await expect(tile).toHaveScreenshot("cart-page-tile.png", SNAPSHOT_OPTS);
  });

  test("Checkout order-summary tile", async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto("/checkout");
    const tile = page.locator('[data-testid="vial-frame"]').first();
    await tile.waitFor({ state: "visible" });
    await expect(tile).toHaveScreenshot("checkout-summary-tile.png", SNAPSHOT_OPTS);
  });

  test("Checkout supplies rail — loaded", async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto("/checkout");
    const rail = page.locator('[data-testid="checkout-supplies-rail"]');
    await rail.waitFor({ state: "visible" });
    await expect(rail).toHaveScreenshot("checkout-supplies-rail-loaded.png", SNAPSHOT_OPTS);
  });

  test("Checkout supplies rail — BAC water variant switched", async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto("/checkout");
    const rail = page.locator('[data-testid="checkout-supplies-rail"]');
    await rail.waitFor({ state: "visible" });
    // BAC water ships with 3ml / 10ml variants; click the 10ml pill.
    const variantPill = page.locator('[data-testid="supply-variant-bac-water-bacteriostatic-10ml"]');
    if (await variantPill.isVisible().catch(() => false)) {
      await variantPill.click();
    }
    await expect(rail).toHaveScreenshot("checkout-supplies-rail-variant.png", SNAPSHOT_OPTS);
  });

  test("Checkout supplies rail — items added shows stepper", async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto("/checkout");
    const rail = page.locator('[data-testid="checkout-supplies-rail"]');
    await rail.waitFor({ state: "visible" });
    // Add every visible "Add" button so all rows flip to the qty stepper.
    const addButtons = rail.locator('button[data-testid^="supply-add-"]');
    const count = await addButtons.count();
    for (let i = 0; i < count; i++) {
      // Re-query each iteration because the DOM node is replaced by the stepper.
      const btn = rail.locator('button[data-testid^="supply-add-"]').first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(80);
      }
    }
    await expect(rail).toHaveScreenshot("checkout-supplies-rail-stepper.png", SNAPSHOT_OPTS);
  });
});
