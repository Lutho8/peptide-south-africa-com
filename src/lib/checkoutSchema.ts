import { z } from "zod";
import { CHECKOUT_POLICY_VERSION } from "../../supabase/functions/_shared/checkout-consent";

export const SA_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
];

const NAME_RE = /^[\p{L}][\p{L}\s\-'.]{0,59}$/u;

export type CheckoutForm = {
  firstName: string;
  lastName: string;
  email: string;
  address1: string;
  city: string;
  region: string;
  postalCode: string;
  ageConfirmed: boolean;
  researchUseAcknowledged: boolean;
  nonHumanUseAcknowledged: boolean;
  reportScopeAcknowledged: boolean;
  marketingConsent: boolean;
  consentPolicyVersion: string;
};

export type CheckoutErrors = Partial<Record<keyof CheckoutForm, string>>;

export const saSchema = z.object({
  firstName: z.string().trim().regex(NAME_RE, "err_name_chars"),
  lastName: z.string().trim().regex(NAME_RE, "err_name_chars"),
  email: z.string().trim().email("err_email").max(120, "err_email"),
  address1: z.string().trim().min(3, "err_address_short").max(120, "err_address_short"),
  city: z.string().trim().min(2, "err_required").max(80, "err_required"),
  postalCode: z.string().trim().regex(/^\d{4}$/, "err_postal_sa"),
  region: z
    .string()
    .trim()
    .refine(
      (v) => SA_PROVINCES.some((p) => p.toLowerCase() === v.trim().toLowerCase()),
      "err_region_sa",
    ),
  ageConfirmed: z.literal(true, { errorMap: () => ({ message: "err_consent_required" }) }),
  researchUseAcknowledged: z.literal(true, { errorMap: () => ({ message: "err_consent_required" }) }),
  nonHumanUseAcknowledged: z.literal(true, { errorMap: () => ({ message: "err_consent_required" }) }),
  reportScopeAcknowledged: z.literal(true, { errorMap: () => ({ message: "err_consent_required" }) }),
  marketingConsent: z.boolean(),
  consentPolicyVersion: z.literal(CHECKOUT_POLICY_VERSION),
});

export type ValidateResult =
  | { ok: true; data: CheckoutForm }
  | { ok: false; errors: CheckoutErrors };

export function validateCheckout(input: CheckoutForm): ValidateResult {
  const r = saSchema.safeParse(input);
  if (r.success) return { ok: true, data: r.data as CheckoutForm };
  const errors: CheckoutErrors = {};
  for (const issue of r.error.issues) {
    const key = issue.path[0] as keyof CheckoutForm;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return { ok: false, errors };
}
