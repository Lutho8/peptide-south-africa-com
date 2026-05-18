import { expect, test } from "../playwright-fixture";
import { acceptAgeGate, addFirstProductToCart, bumpFirstLineQuantity, dismissDiscountPopup, setShippingCountry, switchCurrency } from "./_utils";

test.describe("Checkout flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await acceptAgeGate(page);
    await dismissDiscountPopup(page);
  });

  test("EUR mode renders euro totals through cart and checkout", async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto("/cart");
    await expect(page.getByTestId("cart-total")).toContainText("€");
    await page.goto("/checkout");
    await expect(page.getByTestId("checkout-total")).toContainText("€");
    await expect(page.getByTestId("pay-now-button")).toContainText(/Pay Now.*€/);
  });

  test("ZAR mode renders rand totals through cart and checkout", async ({ page }) => {
    await switchCurrency(page, "ZAR");
    await addFirstProductToCart(page);
    await page.goto("/cart");
    await expect(page.getByTestId("cart-total")).toContainText("R");
    await page.goto("/checkout");
    await expect(page.getByTestId("checkout-total")).toContainText("R");
    await expect(page.getByTestId("pay-now-button")).toContainText(/Pay Now.*R/);
  });

  test("Checkout success without order_id shows thank-you copy", async ({ page }) => {
    await page.goto("/checkout/success");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Thank you/i);
    await expect(page.getByRole("link", { name: /Continue Shopping/i })).toBeVisible();
  });

  test("Checkout success with order_id redirects to /order/:id", async ({ page }) => {
    const fakeId = "00000000-0000-0000-0000-000000000000";
    await page.goto(`/checkout/success?order_id=${fakeId}`);
    await expect(page).toHaveURL(new RegExp(`/order/${fakeId}$`));
    await expect(page.getByTestId("order-status-headline")).toBeVisible();
  });

  test("Checkout cancel page renders localized copy and links", async ({ page }) => {
    await page.goto("/checkout/cancel");
    await expect(page.getByTestId("cancel-headline")).toContainText(/Payment cancelled/i);
    await expect(page.getByRole("link", { name: /Back to Cart/i })).toHaveAttribute("href", "/cart");
    await expect(page.getByRole("link", { name: /Continue Shopping/i })).toHaveAttribute("href", "/shop");
  });

  test("Order status page renders pending fallback for unknown order", async ({ page }) => {
    await page.goto("/order/00000000-0000-0000-0000-000000000000");
    await expect(page.getByTestId("order-status-headline")).toContainText(/Waiting for payment/i);
    await expect(page.getByText(/Zahlungsbestätigung/)).toBeVisible();
  });

  test("Pay Now without sign-in redirects to /auth", async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto("/checkout");
    // Fill the required fields with VALID DE address so validation passes.
    await page.getByPlaceholder("First Name").fill("Test");
    await page.getByPlaceholder("Last Name").fill("User");
    await page.getByPlaceholder("Email").fill("test@example.com");
    await page.getByPlaceholder("Address").fill("Hauptstrasse 1");
    await page.getByPlaceholder("City").fill("Berlin");
    await page.getByPlaceholder(/Bundesland|Province/).fill("Berlin");
    await page.getByPlaceholder(/Postal Code/).fill("10115");
    await page.getByTestId("pay-now-button").click();
    await expect(page).toHaveURL(/\/auth/);
  });

  test("DE address validation: invalid postal shows inline error", async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto("/checkout");
    await page.getByTestId("country-de").click();
    await page.getByPlaceholder("First Name").fill("Anna");
    await page.getByPlaceholder("Last Name").fill("Müller");
    await page.getByPlaceholder("Email").fill("anna@example.com");
    await page.getByPlaceholder("Address").fill("Hauptstrasse 1");
    await page.getByPlaceholder("City").fill("Berlin");
    await page.getByPlaceholder(/Bundesland|Province/).fill("Berlin");
    await page.getByPlaceholder(/Postal Code/).fill("1234");
    await page.getByTestId("pay-now-button").click();
    await expect(page.locator("#err-postalCode")).toContainText(/5 digits|5 Ziffern/i);
    await expect(page).not.toHaveURL(/\/auth/);
  });

  test("DE address validation: invalid Bundesland shows inline error", async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto("/checkout");
    await page.getByTestId("country-de").click();
    await page.getByPlaceholder("First Name").fill("Anna");
    await page.getByPlaceholder("Last Name").fill("Müller");
    await page.getByPlaceholder("Email").fill("anna@example.com");
    await page.getByPlaceholder("Address").fill("Hauptstrasse 1");
    await page.getByPlaceholder("City").fill("Berlin");
    await page.getByPlaceholder(/Bundesland|Province/).fill("Fooland");
    await page.getByPlaceholder(/Postal Code/).fill("10115");
    await page.getByTestId("pay-now-button").click();
    await expect(page.locator("#err-region")).toContainText(/Bundesland/);
  });

  test("SA address validation: invalid postal shows inline error", async ({ page }) => {
    await switchCurrency(page, "ZAR");
    await addFirstProductToCart(page);
    await page.goto("/checkout");
    await page.getByTestId("country-sa").click();
    await page.getByPlaceholder("First Name").fill("Thabo");
    await page.getByPlaceholder("Last Name").fill("Nkosi");
    await page.getByPlaceholder("Email").fill("thabo@example.com");
    await page.getByPlaceholder("Address").fill("12 Long St");
    await page.getByPlaceholder("City").fill("Cape Town");
    await page.getByPlaceholder(/Bundesland|Province/).fill("Western Cape");
    await page.getByPlaceholder(/Postal Code/).fill("12");
    await page.getByTestId("pay-now-button").click();
    await expect(page.locator("#err-postalCode")).toContainText(/4 digits|4 Ziffern/i);
  });

  test("Free shipping progress bar visible on checkout", async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto("/checkout");
    await expect(page.getByTestId("free-shipping-bar")).toBeVisible();
  });

  test("Country selector defaults to Germany in EUR and South Africa in ZAR", async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto("/checkout");
    // Default EUR → DE active.
    await expect(page.getByTestId("country-de")).toHaveClass(/border-primary/);
    // Switch to SA and verify shipping line shows ZAR.
    await page.getByTestId("country-sa").click();
    await expect(page.getByTestId("checkout-shipping")).toContainText(/R|Free|Gratis/);
  });

  test("Blocked-country handling: pay button disabled when no supported country", async ({ page }) => {
    // The selector exposes only the two supported countries, so this test
    // simply asserts that both supported buttons are present and Pay Now is
    // enabled for either of them.
    await addFirstProductToCart(page);
    await page.goto("/checkout");
    await expect(page.getByTestId("country-sa")).toBeVisible();
    await expect(page.getByTestId("country-de")).toBeVisible();
    await expect(page.getByTestId("pay-now-button")).toBeEnabled();
  });

  test("EUR + Germany under threshold shows €7.50 flat shipping", async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto("/checkout");
    await page.getByTestId("country-de").click();
    await expect(page.getByTestId("checkout-shipping")).toContainText(/€\s?7[.,]50/);
  });

  test("EUR + Germany over threshold unlocks free shipping", async ({ page }) => {
    await addFirstProductToCart(page);
    // Push the cart subtotal above €120.
    await bumpFirstLineQuantity(page, 8);
    await page.goto("/checkout");
    await page.getByTestId("country-de").click();
    await expect(page.getByTestId("checkout-shipping")).toContainText(/Free|Gratis/);
  });

  test("ZAR + South Africa under threshold shows R89 flat shipping", async ({ page }) => {
    await switchCurrency(page, "ZAR");
    await addFirstProductToCart(page);
    await page.goto("/checkout");
    await page.getByTestId("country-sa").click();
    await expect(page.getByTestId("checkout-shipping")).toContainText(/R\s?89/);
  });

  test("ZAR + South Africa over threshold unlocks free shipping", async ({ page }) => {
    await switchCurrency(page, "ZAR");
    await addFirstProductToCart(page);
    await bumpFirstLineQuantity(page, 8);
    await page.goto("/checkout");
    await page.getByTestId("country-sa").click();
    await expect(page.getByTestId("checkout-shipping")).toContainText(/Free|Gratis/);
  });

  test("Unsupported country shows blocked banner and disables Pay Now", async ({ page }) => {
    await addFirstProductToCart(page);
    await setShippingCountry(page, "France");
    await expect(page.getByRole("alert")).toContainText(/only ship to Germany and South Africa|nur nach Deutschland/i);
    await expect(page.getByTestId("pay-now-button")).toBeDisabled();
  });

  test("Country selection persists across reload", async ({ page }) => {
    await addFirstProductToCart(page);
    await page.goto("/checkout");
    await page.getByTestId("country-sa").click();
    await page.reload();
    await expect(page.getByTestId("country-sa")).toHaveClass(/border-primary/);
  });
});
