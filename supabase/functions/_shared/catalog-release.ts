/** Owner-approved storefront catalogue. Historical orders are never rewritten. */
export const CATALOG_VERSION = "psa-sa-stock-2026-09-27";
export const BAC_SLUG = "bac-water-bacteriostatic";
export const LIVE_CATALOG = {
  "rt3-reta": { name: "Retatrutide (GGG-3) 10 mg", sku: "RTT-GGG-10", strength: "10 mg", mgPerVial: 10, price: 1250 },
  "tz2-tirz": { name: "Tirzepatide (TZ-2) 10 mg", sku: "RTT-TZ2-10", strength: "10 mg", mgPerVial: 10, price: 1250 },
  tesamorelin: { name: "Tesamorelin 5 mg", sku: "RTT-TES-5", strength: "5 mg", mgPerVial: 5, price: 775 },
  kpv: { name: "KPV 5 mg", sku: "PSA-KPV-5", strength: "5 mg", mgPerVial: 5, price: 395 },
  klow80: { name: "KLOW 80 mg", sku: "RTT-KLW-80", strength: "80 mg", mgPerVial: 80, price: 1550 },
  "mots-c": { name: "MOTS-C 10 mg", sku: "RTT-MTC-10", strength: "10 mg", mgPerVial: 10, price: 625 },
  "ss-31": { name: "SS-31 10 mg", sku: "PSA-SS31-10", strength: "10 mg", mgPerVial: 10, price: 1150 },
  "ghk-cu-50mg": { name: "GHK-Cu 50 mg", sku: "RTT-GHK-50", strength: "50 mg", mgPerVial: 50, price: 700 },
  "bpc-tb500-blend": { name: "BPC-157 + TB-500 5 mg + 5 mg", sku: "RTT-BTB-10", strength: "5 mg + 5 mg", mgPerVial: 10, price: 950 },
  "bac-water-bacteriostatic": { name: "BAC water 10 ml", sku: "PSA-BAC-10ML", strength: "10 ml", mgPerVial: 0, price: 210 },
} as const;
export type LiveSlug = keyof typeof LIVE_CATALOG;
export function isLiveSlug(slug: string): slug is LiveSlug {
  return Object.prototype.hasOwnProperty.call(LIVE_CATALOG, slug);
}
export function isLivePeptide(slug: string): boolean {
  return isLiveSlug(slug) && slug !== BAC_SLUG;
}
export function liveListing(slug: string) {
  return isLiveSlug(slug) ? LIVE_CATALOG[slug] : undefined;
}
export const DISCOUNT_POLICY = "One applicable discount per purchase. Published pack savings are already included; no additional subscription, coupon or referral discount applies. BAC water is never discounted.";
export const BAC_NOTICE = "BAC water 10 ml is sold separately at R210 per vial. It is not included in peptide packs, does not count as a peptide vial, and receives no pack or promotional discount.";
export const DELIVERY_NOTICE = "Free South African delivery on merchandise totals of R1,500 or more after discounts and paid add-ons. Below R1,500, delivery is R89.";

/** Prevent old clients silently buying a changed strength or stacking discounts. */
export function validateStorefrontRequest(body: Record<string, unknown>): void {
  if (body.catalogVersion !== CATALOG_VERSION) throw new Error("The catalogue changed. Refresh the page and rebuild your cart before checkout.");
  for (const key of ["discountCode", "discount_code", "coupon", "couponCode", "promoCode", "subscriptionDiscount", "discountPct", "discountAmount", "discounts"]) {
    const value = body[key];
    if (value !== undefined && value !== null && value !== "" && value !== 0 && value !== false) throw new Error(DISCOUNT_POLICY);
  }
}
