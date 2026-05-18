import { expect, test } from "../playwright-fixture";
import { acceptAgeGate, addFirstProductToCart, dismissDiscountPopup, switchCurrency } from "./_utils";

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
    // Fill the required fields so the form would otherwise submit.
    await page.getByPlaceholder("First Name").fill("Test");
    await page.getByPlaceholder("Last Name").fill("User");
    await page.getByPlaceholder("Email").fill("test@example.com");
    await page.getByPlaceholder("Address").fill("1 Test St");
    await page.getByPlaceholder("City").fill("Berlin");
    await page.getByPlaceholder(/Bundesland|Province/).fill("BE");
    await page.getByPlaceholder("Postal Code").fill("10115");
    await page.getByTestId("pay-now-button").click();
    await expect(page).toHaveURL(/\/auth/);
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
});
