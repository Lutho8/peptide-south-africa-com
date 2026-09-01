import { describe, expect, it } from "vitest";
import {
  CHECKOUT_POLICY_VERSION,
  REPORT_SCOPE_VERSION,
} from "../../supabase/functions/_shared/checkout-consent";
import { type CheckoutForm, validateCheckout } from "@/lib/checkoutSchema";
import { getOrCreateEftRequestId } from "@/lib/eftCheckout";
import fs from "node:fs";
import path from "node:path";

const completeForm: CheckoutForm = {
  firstName: "Research",
  lastName: "Customer",
  email: "researcher@example.com",
  address1: "1 Laboratory Road",
  city: "Cape Town",
  region: "Western Cape",
  postalCode: "8001",
  ageConfirmed: true,
  researchUseAcknowledged: true,
  nonHumanUseAcknowledged: true,
  reportScopeAcknowledged: true,
  marketingConsent: false,
  consentPolicyVersion: CHECKOUT_POLICY_VERSION,
};

describe("research checkout consent", () => {
  it.each([
    "ageConfirmed",
    "researchUseAcknowledged",
    "nonHumanUseAcknowledged",
    "reportScopeAcknowledged",
  ] as const)("requires %s", (field) => {
    const result = validateCheckout({ ...completeForm, [field]: false });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[field]).toBe("err_consent_required");
  });

  it("keeps marketing consent optional and records versioned policy identifiers", () => {
    expect(validateCheckout(completeForm).ok).toBe(true);
    expect(validateCheckout({ ...completeForm, marketingConsent: true }).ok).toBe(true);
    expect(CHECKOUT_POLICY_VERSION).toMatch(/^research-checkout-\d{4}-\d{2}-\d{2}$/);
    expect(REPORT_SCOPE_VERSION).toMatch(/^batch-report-scope-\d{4}-\d{2}-\d{2}$/);
  });

  it("rejects an obsolete checkout policy version", () => {
    const result = validateCheckout({
      ...completeForm,
      consentPolicyVersion: "research-checkout-2026-01-01",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.consentPolicyVersion).toBeDefined();
  });

  it("enforces and records the same consent contract at the server boundary", () => {
    const source = fs.readFileSync(path.resolve(process.cwd(), "api/eft-create-order.ts"), "utf8");
    expect(source).toContain("isValidCheckoutConsent(consent)");
    expect(source).toContain('.from("checkout_consents").insert');
    expect(source.indexOf("isValidCheckoutConsent(consent)"))
      .toBeLessThan(source.indexOf('.from("orders")'));
    expect(source).toContain('payment_provider: "eft_capitec"');
    expect(source).toContain("existingConsent.marketing_consent === consent.marketingConsent");
  });

  it("uses a new idempotency key when the optional marketing choice changes", () => {
    const selections = [{ kind: "item" as const, slug: "bpc-157", variantLabel: null, quantity: 1 }];
    const initial = getOrCreateEftRequestId(selections, completeForm);
    const changed = getOrCreateEftRequestId(selections, { ...completeForm, marketingConsent: true });
    expect(changed).not.toBe(initial);
  });
});
