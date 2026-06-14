// Single-locale (English, South Africa) microcopy for Peptide South Africa.
export type Locale = "en";

export type CopyKey =
  | "shipping_free"
  | "shipping_sa_window"
  | "lab_tested"
  | "purity_99"
  | "discreet_packaging"
  | "secure_checkout"
  | "age_gate_body"
  | "pay_now"
  | "payment_unavailable"
  | "thank_you"
  | "cancelled"
  | "paid"
  | "pending"
  | "order_summary"
  | "subtotal"
  | "shipping"
  | "total"
  | "free"
  | "tax"
  | "view_order"
  | "back_to_shop"
  | "back_to_cart"
  | "processing_payment"
  | "order_number"
  | "continue_shopping"
  | "shipping_country"
  | "country_blocked"
  | "contact_support_region"
  | "local_courier_sa"
  | "away_from_free"
  | "unlocked_free_shipping"
  | "err_required"
  | "err_email"
  | "err_postal_sa"
  | "err_region_sa"
  | "err_name_chars"
  | "err_address_short"
  | "fix_form";

const EN: Record<CopyKey, string> = {
  shipping_free: "Free shipping across South Africa on orders over R1,500",
  shipping_sa_window: "1–3 business days across South Africa",
  lab_tested: "Independently lab tested",
  purity_99: "≥99% HPLC purity · COA on every batch",
  discreet_packaging: "Discreet, unbranded packaging",
  secure_checkout: "Secure checkout via PayFast",
  age_gate_body:
    "You must be 18+ to enter. Peptide programs require clinical review where applicable.",
  pay_now: "Start My Program",
  payment_unavailable:
    "Payments are temporarily unavailable. Please try again shortly.",
  thank_you: "You're in. Your program is being activated.",
  cancelled: "Payment cancelled",
  paid: "Payment received",
  pending: "Waiting for payment confirmation",
  order_summary: "Your Program",
  subtotal: "Subtotal",
  shipping: "Shipping",
  total: "Total",
  free: "Free",
  tax: "Tax",
  view_order: "View Program",
  back_to_shop: "Browse Programs",
  back_to_cart: "Back to Cart",
  processing_payment: "Preparing checkout…",
  order_number: "Program",
  continue_shopping: "Browse Programs",
  shipping_country: "Shipping Country",
  country_blocked: "Sorry, we currently only ship within South Africa.",
  contact_support_region:
    "Contact support@peptide-south-africa.com if you're interested in shipping to your region.",
  local_courier_sa: "Local courier delivery — 1–3 business days",
  away_from_free: "away from free shipping",
  unlocked_free_shipping: "You've unlocked free shipping!",
  err_required: "This field is required",
  err_email: "Enter a valid email address",
  err_postal_sa: "South African postal code must be 4 digits (e.g. 8001)",
  err_region_sa: "Enter a valid province (e.g. Gauteng, Western Cape)",
  err_name_chars: "Use letters only (1–60 characters)",
  err_address_short: "Address must be 3–120 characters",
  fix_form: "Please fix the highlighted fields",
};

// Keep the old `{ en, de, af }` shape for backward compatibility.
export const COPY: Record<CopyKey, { en: string; de: string; af: string }> = Object.fromEntries(
  (Object.keys(EN) as CopyKey[]).map((k) => [k, { en: EN[k], de: EN[k], af: EN[k] }]),
) as Record<CopyKey, { en: string; de: string; af: string }>;

export function trilingual(key: CopyKey): string {
  return EN[key];
}
export function bilingualDE(key: CopyKey): string {
  return EN[key];
}
export function bilingualAF(key: CopyKey): string {
  return EN[key];
}
export function t(key: CopyKey, _locale?: string): string {
  return EN[key];
}
