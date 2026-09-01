export const CHECKOUT_POLICY_VERSION = "research-checkout-2026-09-01";
export const REPORT_SCOPE_VERSION = "batch-report-scope-2026-09-01";

export const CHECKOUT_CONSENT_STATEMENTS = {
  age:
    "I confirm that I am 18 years of age or older and legally able to place this order.",
  researchUse:
    "I acknowledge that the products in this order are supplied solely for lawful laboratory research use.",
  nonHumanUse:
    "I confirm that these products are not being purchased for human or animal use or consumption.",
  reportScope:
    "I understand that a published source or batch report describes only the submitted sample and tests shown at the time of analysis. It is not medical advice, a suitability assessment, or a guarantee of any characteristic not expressly tested.",
  marketing:
    "I would like to receive optional product, batch and research updates from Peptide South Africa. I can unsubscribe at any time.",
} as const;

export type CheckoutConsentInput = {
  ageConfirmed: boolean;
  researchUseAcknowledged: boolean;
  nonHumanUseAcknowledged: boolean;
  reportScopeAcknowledged: boolean;
  marketingConsent: boolean;
  policyVersion: string;
  reportScopeVersion: string;
  clientAcceptedAt: string;
};

export function isValidCheckoutConsent(value: unknown): value is CheckoutConsentInput {
  if (!value || typeof value !== "object") return false;
  const consent = value as Partial<CheckoutConsentInput>;
  if (
    consent.ageConfirmed !== true
    || consent.researchUseAcknowledged !== true
    || consent.nonHumanUseAcknowledged !== true
    || consent.reportScopeAcknowledged !== true
    || typeof consent.marketingConsent !== "boolean"
    || consent.policyVersion !== CHECKOUT_POLICY_VERSION
    || consent.reportScopeVersion !== REPORT_SCOPE_VERSION
    || typeof consent.clientAcceptedAt !== "string"
  ) return false;

  const acceptedAt = Date.parse(consent.clientAcceptedAt);
  return Number.isFinite(acceptedAt) && acceptedAt <= Date.now() + 5 * 60_000;
}
