import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import coaScanHandler, { resolveCoaScan } from "../../api/coa-scan";
import { staticCoas } from "@/data/coas";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("release contracts", () => {
  it("keeps checkout, footer, policies and structured data EFT-only", () => {
    const publicPaymentSources = [
      "src/pages/CheckoutPage.tsx",
      "src/pages/TermsPage.tsx",
      "src/pages/RefundPolicyPage.tsx",
      "src/components/CheckoutTrustBar.tsx",
      "src/components/SecurityChecklist.tsx",
      "src/components/PaymentMethodsBanner.tsx",
      "src/components/Footer.tsx",
      "src/lib/seo.ts",
      "index.html",
      "public/_headers",
    ].map(read).join("\n");

    expect(publicPaymentSources).toMatch(/EFT/i);
    expect(publicPaymentSources).not.toMatch(
      /PayFast|NowPayments|Visa|Mastercard|PayPal|Apple Pay|Google Pay|SnapScan|Zapper|Mobicred|Masterpass|PCI-DSS/i,
    );
  });

  it("keeps the active weight-loss journey on approved prices and one CTA destination", () => {
    const active = [
      "src/pages/HomePage.tsx",
      "src/pages/FatLossProtocolPage.tsx",
      "src/pages/AboutPage.tsx",
      "src/pages/ShopPage.tsx",
      "src/pages/ProductPage.tsx",
      "src/pages/QuizFunnelPage.tsx",
      "src/components/HeroShop.tsx",
      "src/components/CategoryShowcase.tsx",
      "src/components/FeaturedProductRail.tsx",
      "src/components/FloatingProductFollower.tsx",
      "src/components/FrequentlyBoughtTogether.tsx",
      "src/components/BookConsultLink.tsx",
      "src/components/ProtocolPlans.tsx",
      "src/components/WeightLossPricing.tsx",
      "src/lib/quizProtocolFallback.ts",
      "supabase/functions/generate-protocol/index.ts",
    ].map(read).join("\n");
    expect(active).not.toMatch(/R1,495|R995|R299/);
    expect(active).not.toMatch(/Book a Consultation|Book a 15-min Consult|Book Zoom Consultation|Start Medical Quiz|Start Your Protocol|Buy Monthly|Buy Now|Get Your Personalised Plan|Start Your Transformation Today/);
    expect(active).not.toContain("/quiz?product=");
    expect(read("src/components/BookConsultLink.tsx")).toContain('"/quiz?intent=consult"');
    const pricing = read("supabase/functions/_shared/pricing.ts");
    expect(pricing).toContain("weight_loss_monthly_1999");
    expect(pricing).toContain("weight_loss_12_week_4999");
  });

  it("keeps EFT creation server-priced and retry-idempotent", () => {
    const client = read("src/lib/eftCheckout.ts");
    const server = read("api/eft-create-order.ts");
    const migration = read("supabase/migrations/20260827150000_pricing_analytics_events.sql");
    expect(client).toContain("requestId");
    expect(client).not.toMatch(/body:\s*\{[^}]*\bamount\b/s);
    expect(client).toContain('fetch("/api/eft-create-order"');
    expect(server).toContain("quoteCheckout(body.selections");
    expect(server).toContain("checkout_request_id");
    expect(migration).toContain("orders_checkout_request_id_idx");
    expect(migration).toContain("emit_verified_eft_revenue_events");
    expect(migration).toContain("analytics_events_settlement_once_idx");
  });

  it("gates native EFT deployment on an authenticated synthetic sandbox contract", () => {
    const workflow = read(".github/workflows/eft-sandbox.yml");
    const contract = read("scripts/ci/eft-sandbox-contract.mjs");
    const config = read("supabase/config.toml");
    expect(workflow).toContain("environment: eft-sandbox");
    expect(workflow).toContain("supabase functions deploy eft-create-order");
    expect(workflow.indexOf("Deploy native EFT order function to sandbox"))
      .toBeLessThan(workflow.indexOf("Run authenticated EFT sandbox contract"));
    expect(workflow).toContain("version: 2.115.0");
    expect(config).toMatch(/\[functions\.eft-create-order\]\s+verify_jwt = true/);
    expect(contract).toContain("signInWithPassword");
    expect(contract).toContain("Unauthenticated checkout returned HTTP");
    expect(contract).toContain("example.invalid");
  });

  it("keeps the EFT sandbox contract price-free, manipulation-aware and cleanup-safe", () => {
    const workflow = read(".github/workflows/eft-sandbox.yml");
    const contract = read("scripts/ci/eft-sandbox-contract.mjs");
    expect(contract).toContain("amount: 1");
    expect(contract).toContain("unitPrice: 1");
    expect(contract).toContain("Server amount mismatch: expected 719");
    expect(contract).toContain("ORDER_CONFLICT");
    expect(contract).toContain("INVALID_CART");
    expect(contract).toContain('deleteRows("email_outbox"');
    expect(contract).toContain('deleteRows("psa_orders"');
    expect(contract).toContain('deleteRows("orders"');
    expect(contract).toContain("admin.auth.admin.deleteUser");
    expect(contract).not.toMatch(/console\.(?:log|error)\((?:first|replay|stored|.*\.data|.*\.bank)/);
    expect(workflow).not.toMatch(/environment: eft-sandbox\s+env:/);
  });

  it("publishes both the medical and supplier-report scope disclaimers", () => {
    const footer = read("src/components/Footer.tsx");
    const terms = read("src/pages/TermsPage.tsx");
    expect(footer).toContain("Medical disclaimer");
    expect(footer).toContain("A published supplier COA verifies the submitted supplier sample");
    expect(terms).toContain("Website content is general information only and is not medical advice");
    expect(terms).toContain("does not authenticate an individual vial");
  });

  it("keeps Tirzepatide explicitly scoped as a supplier source report", () => {
    const tirzepatide = staticCoas.find((record) => record.productSlug === "tz2-tirz");
    expect(tirzepatide?.sourceNote).toContain("source report");
    expect(tirzepatide?.sourceNote).toContain("not a unique PSA vial or lot");
  });

  it.each([
    ["m01", "83567_HGNB5E53261C"],
    ["r01", "61141_UMR871KAJ2N9"],
    ["z01", "164662_D9DXNXDK1YM4"],
    ["t01", "164644_ILEI5C8YKHME"],
  ])("resolves anonymous QR code %s to its lab report", (code, expectedPath) => {
    const result = resolveCoaScan(code);
    expect(result.found).toBe(true);
    expect(result.destination).toContain(expectedPath);
  });

  it("routes QR scans through telemetry and lazy-loads the label studio", () => {
    const vercelConfig = read("vercel.json");
    const testingPage = read("src/pages/TestingPage.tsx");
    expect(vercelConfig).toContain('"source": "/v/:code"');
    expect(vercelConfig).toContain('"destination": "/api/coa-scan?code=:code"');
    expect(testingPage).toContain('lazy(() => import("@/components/CoaLabelStudio"))');
    expect(testingPage).toContain("<Suspense");
  });

  it("keeps public routes code-split and enforces the production bundle budget", () => {
    const appShell = read("src/AppShell.tsx");
    const clientEntry = read("src/main.tsx");
    const prerender = read("scripts/prerender.mjs");
    const packageJson = read("package.json");
    const bundleBudget = read("scripts/check-bundle-budget.mjs");

    expect(appShell).not.toMatch(/^import .*@\/pages\//m);
    expect(appShell.match(/lazy\(\(\) => import\("@\/pages\//g)?.length).toBeGreaterThanOrEqual(40);
    expect(prerender).toContain("data-prerender-path");
    expect(clientEntry).toContain("normalizePath(prerenderPath) === normalizePath(window.location.pathname)");
    expect(clientEntry).toContain("root.replaceChildren()");
    expect(packageJson).toContain("node scripts/check-bundle-budget.mjs");
    expect(bundleBudget).toContain("300 * 1024");
  });

  it("emits an anonymous event and a no-store redirect for a QR request", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);

    const response = coaScanHandler(
      new Request("https://www.peptide-south-africa.com/api/coa-scan?code=z01"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("Location")).toContain("164662_D9DXNXDK1YM4");
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(info).toHaveBeenCalledOnce();
    const event = JSON.parse(String(info.mock.calls[0][0]));
    expect(event).toMatchObject({
      event: "coa_qr_scan",
      anonymous: true,
      code: "z01",
      scope: "supplier_source_report",
    });
    expect(event).not.toHaveProperty("ip");
    expect(event).not.toHaveProperty("userAgent");
    expect(event).not.toHaveProperty("referrer");
    info.mockRestore();
  });
});
