/**
 * Shipping rules for the two markets we currently service.
 * Shipping is ALWAYS priced in the destination currency, regardless of the
 * display currency the customer is browsing in.
 */
export type ShippingCountry = "South Africa" | "Germany";

export interface ShippingRule {
  method: string;
  /** Flat shipping rate in the destination currency. */
  flat: number;
  /** Free-shipping threshold in the destination currency. */
  freeOver: number;
  /** ISO currency code charged for this destination. */
  currency: "ZAR" | "EUR";
  /** Delivery window label. */
  days: string;
}

export const SHIPPING_RULES: Record<ShippingCountry, ShippingRule> = {
  "South Africa": {
    method: "Local courier (The Courier Guy / Ramhis)",
    flat: 89,
    freeOver: 1500,
    currency: "ZAR",
    days: "1–3",
  },
  Germany: {
    method: "Deutsche Post / DHL",
    flat: 7.5,
    freeOver: 120,
    currency: "EUR",
    days: "4–7",
  },
};

export const SUPPORTED_COUNTRIES: ShippingCountry[] = ["South Africa", "Germany"];

export function isSupportedCountry(c: string | null | undefined): c is ShippingCountry {
  return c === "South Africa" || c === "Germany";
}

/**
 * Returns the shipping cost in the destination currency, or null if the
 * country is not supported (caller should block checkout).
 */
export function getShippingCost(
  cartTotalInDestCurrency: number,
  country: string,
): number | null {
  if (!isSupportedCountry(country)) return null;
  const rule = SHIPPING_RULES[country];
  return cartTotalInDestCurrency >= rule.freeOver ? 0 : rule.flat;
}

/** Amount remaining (in destination currency) to unlock free shipping. 0 if unlocked. */
export function amountToFreeShipping(
  cartTotalInDestCurrency: number,
  country: ShippingCountry,
): number {
  const rule = SHIPPING_RULES[country];
  return Math.max(0, rule.freeOver - cartTotalInDestCurrency);
}
