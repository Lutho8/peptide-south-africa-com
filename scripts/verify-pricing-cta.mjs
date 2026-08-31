import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const baseURL = process.env.PSA_SMOKE_BASE_URL || "http://127.0.0.1:4173";
const outputDir = ".scratch/pricing-cta-smoke";
await mkdir(outputDir, { recursive: true });

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

async function dismissOverlays(page) {
  for (const name of [/I am 18/i, /accept/i, /continue/i, /not now/i, /no thanks/i, /close tracker offer/i, /^dismiss$/i, /^close$/i]) {
    const button = page.getByRole("button", { name }).first();
    if (await button.isVisible().catch(() => false)) await button.click();
  }
}

async function run(viewport, label) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const failures = [];
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("Failed to load resource")) failures.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => failures.push(`pageerror: ${error.message}`));
  page.on("requestfailed", (request) => {
    if (request.url().startsWith(baseURL) && !request.url().includes("/_vercel/insights/")) {
      failures.push(`requestfailed: ${request.method()} ${request.url()} ${request.failure()?.errorText}`);
    }
  });
  page.on("response", (response) => {
    if (response.url().startsWith(baseURL) && !response.url().includes("/_vercel/insights/") && response.status() >= 400) failures.push(`http ${response.status()}: ${response.url()}`);
  });

  await page.goto(`${baseURL}/`, { waitUntil: "networkidle" });
  await dismissOverlays(page);
  const home = await page.locator("body").innerText();
  assert(home.includes("R1,999/month"), `${label}: homepage monthly price missing`);
  assert(home.includes("R4,999"), `${label}: homepage full-program price missing`);
  assert(home.includes("R997"), `${label}: homepage saving missing`);
  assert(!home.includes("R1,250 – R3,188"), `${label}: homepage exposes the GGG-3 vial price range`);
  assert(await page.getByRole("button", { name: /Add GGG-3 to cart/i }).count() === 0, `${label}: homepage exposes a GGG-3 add-to-cart control`);
  assert(await page.getByRole("button", { name: /Add TZ-2 \(Tirz\) to cart/i }).count() === 0, `${label}: homepage exposes a TZ-2 add-to-cart control`);
  const homeConsults = page.getByRole("link", { name: /BOOK CONSULT/i });
  assert(await homeConsults.count() > 0, `${label}: homepage BOOK CONSULT missing`);
  for (let index = 0; index < await homeConsults.count(); index++) {
    assert((await homeConsults.nth(index).getAttribute("href")) === "/quiz?intent=consult", `${label}: homepage CTA destination mismatch`);
  }
  await page.screenshot({ path: `${outputDir}/home-${label}.png`, fullPage: true });

  await page.goto(`${baseURL}/fat-loss-protocol`, { waitUntil: "networkidle" });
  await dismissOverlays(page);
  const fatLoss = await page.locator("body").innerText();
  for (const prohibited of ["R1,495", "R995", "R299", "PayFast", "Mastercard", "Start Medical Quiz"]) {
    assert(!fatLoss.includes(prohibited), `${label}: prohibited fat-loss copy present: ${prohibited}`);
  }
  assert(fatLoss.includes("R1,999/month") && fatLoss.includes("R4,999") && fatLoss.includes("R997"), `${label}: fat-loss pricing mismatch`);
  const fatConsults = page.getByRole("link", { name: /BOOK CONSULT/i });
  assert(await fatConsults.count() >= 2, `${label}: fat-loss CTAs missing`);
  for (let index = 0; index < await fatConsults.count(); index++) {
    assert((await fatConsults.nth(index).getAttribute("href")) === "/quiz?intent=consult", `${label}: fat-loss CTA destination mismatch`);
  }
  await page.screenshot({ path: `${outputDir}/fat-loss-${label}.png`, fullPage: true });

  await page.goto(`${baseURL}/product/rt3-reta`, { waitUntil: "networkidle" });
  await dismissOverlays(page);
  assert(await page.getByRole("button", { name: /BOOK CONSULT/i }).count() > 0, `${label}: GGG-3 BOOK CONSULT missing`);

  await page.goto(`${baseURL}/product/tz2-tirz`, { waitUntil: "networkidle" });
  await dismissOverlays(page);
  assert(await page.getByRole("button", { name: /BOOK CONSULT/i }).count() > 0, `${label}: TZ-2 BOOK CONSULT missing`);

  await page.goto(`${baseURL}/build-your-stack`, { waitUntil: "networkidle" });
  await dismissOverlays(page);
  const selectors = page.locator('select[aria-label^="Vial "]');
  for (let index = 0; index < 5; index++) await selectors.nth(index).selectOption("mots-c");
  const mixTotal = await page.getByTestId("mix-total").innerText();
  assert(mixTotal.replace(/\s/g, "").includes("R1,940"), `${label}: 5-pack subtotal mismatch: ${mixTotal}`);
  const optionText = await selectors.first().locator("option").allTextContents();
  assert(optionText.every((text) => !/R\d/.test(text)), `${label}: stack selector exposes component prices`);

  await page.goto(`${baseURL}/product/ghk-cu-50mg`, { waitUntil: "networkidle" });
  await dismissOverlays(page);
  await page.getByRole("button", { name: /^Add to Cart$/i }).first().click();
  await page.getByRole("button", { name: /Open cart \(1 item\)/i }).waitFor();
  const closeUpsell = page.getByRole("button", { name: "Close", exact: true });
  await closeUpsell.waitFor({ timeout: 5000 });
  await closeUpsell.click();
  const cartSummary = await page.getByText("Subtotal", { exact: true }).locator("..").innerText();
  const cartTotal = (cartSummary.split(/\r?\n/).at(-1) ?? "").replace(/\s/g, "");
  await page.getByRole("link", { name: /Checkout with details/i }).click();
  await page.waitForURL(/\/checkout$/);
  const checkoutTotal = (await page.getByTestId("checkout-total").innerText()).replace(/\s/g, "");
  assert(cartTotal === checkoutTotal, `${label}: cart ${cartTotal} != checkout ${checkoutTotal}`);
  const checkoutCopy = await page.locator("body").innerText();
  assert(checkoutCopy.includes("Pay directly from your banking app"), `${label}: banking-app wording missing`);
  assert(checkoutCopy.includes("no card fees"), `${label}: no-card-fees wording missing`);
  assert(!/PayFast|Visa|Mastercard|SnapScan|Zapper|Mobicred|Masterpass/.test(checkoutCopy), `${label}: legacy payment language present`);
  await page.screenshot({ path: `${outputDir}/checkout-${label}.png`, fullPage: true });

  await browser.close();
  assert(failures.length === 0, `${label}: browser failures:\n${failures.join("\n")}`);
  return { label, cartTotal, checkoutTotal, failures: failures.length };
}

const results = [];
results.push(await run({ width: 1440, height: 1000 }, "desktop"));
results.push(await run({ width: 390, height: 844 }, "mobile"));
console.log(JSON.stringify({ ok: true, baseURL, results, outputDir }, null, 2));
