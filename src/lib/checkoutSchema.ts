import { z } from "zod";
import type { ShippingCountry } from "@/lib/shipping";

export const DE_BUNDESLAENDER = [
  "Baden-Württemberg",
  "Bayern",
  "Berlin",
  "Brandenburg",
  "Bremen",
  "Hamburg",
  "Hessen",
  "Mecklenburg-Vorpommern",
  "Niedersachsen",
  "Nordrhein-Westfalen",
  "Rheinland-Pfalz",
  "Saarland",
  "Sachsen",
  "Sachsen-Anhalt",
  "Schleswig-Holstein",
  "Thüringen",
];

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
};

export type CheckoutErrors = Partial<Record<keyof CheckoutForm, string>>;

const baseShape = {
  firstName: z.string().trim().regex(NAME_RE, "err_name_chars"),
  lastName: z.string().trim().regex(NAME_RE, "err_name_chars"),
  email: z.string().trim().email("err_email").max(120, "err_email"),
  address1: z.string().trim().min(3, "err_address_short").max(120, "err_address_short"),
  city: z.string().trim().min(2, "err_required").max(80, "err_required"),
};

function matchEnum(list: string[], value: string): boolean {
  const v = value.trim().toLowerCase();
  return list.some((x) => x.toLowerCase() === v);
}

export const deSchema = z.object({
  ...baseShape,
  postalCode: z.string().trim().regex(/^\d{5}$/, "err_postal_de"),
  region: z
    .string()
    .trim()
    .refine((v) => matchEnum(DE_BUNDESLAENDER, v), "err_region_de"),
});

export const saSchema = z.object({
  ...baseShape,
  postalCode: z.string().trim().regex(/^\d{4}$/, "err_postal_sa"),
  region: z
    .string()
    .trim()
    .refine((v) => matchEnum(SA_PROVINCES, v), "err_region_sa"),
});

export type ValidateResult =
  | { ok: true; data: CheckoutForm }
  | { ok: false; errors: CheckoutErrors };

export function validateCheckout(input: CheckoutForm, country: ShippingCountry): ValidateResult {
  const schema = country === "Germany" ? deSchema : saSchema;
  const r = schema.safeParse(input);
  if (r.success) return { ok: true, data: r.data as CheckoutForm };
  const errors: CheckoutErrors = {};
  for (const issue of r.error.issues) {
    const key = issue.path[0] as keyof CheckoutForm;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return { ok: false, errors };
}
