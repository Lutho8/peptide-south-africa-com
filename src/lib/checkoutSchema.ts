import { z } from "zod";

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

export const DELIVERY_METHODS = ["postnet_to_door", "postnet_to_postnet"] as const;
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number];

const NAME_RE = /^[\p{L}][\p{L}\s\-'.]{0,59}$/u;

export type CheckoutForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  deliveryMethod: DeliveryMethod;
  postnetBranch: string;
  address1: string;
  city: string;
  region: string;
  postalCode: string;
};

export type CheckoutErrors = Partial<Record<keyof CheckoutForm, string>>;

export const saSchema = z.object({
  firstName: z.string().trim().regex(NAME_RE, "err_name_chars"),
  lastName: z.string().trim().regex(NAME_RE, "err_name_chars"),
  email: z.string().trim().email("err_email").max(120, "err_email"),
  phone: z.string().trim().regex(/^(?:\+27|0)[6-8][0-9]{8}$/, "err_phone_sa"),
  deliveryMethod: z.enum(DELIVERY_METHODS),
  postnetBranch: z.string().trim().max(120, "err_branch_short"),
  address1: z.string().trim().max(120, "err_address_short"),
  city: z.string().trim().min(2, "err_required").max(80, "err_required"),
  postalCode: z.string().trim().regex(/^\d{4}$/, "err_postal_sa"),
  region: z
    .string()
    .trim()
    .refine(
      (v) => SA_PROVINCES.some((p) => p.toLowerCase() === v.trim().toLowerCase()),
      "err_region_sa",
    ),
}).superRefine((value, ctx) => {
  if (value.deliveryMethod === "postnet_to_door" && value.address1.length < 3) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "err_address_short", path: ["address1"] });
  }
  if (value.deliveryMethod === "postnet_to_postnet" && value.postnetBranch.length < 3) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "err_branch_short", path: ["postnetBranch"] });
  }
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
