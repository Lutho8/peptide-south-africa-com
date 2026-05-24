// Single-market shipping (South Africa). Germany has been removed.

export type ShippingCountry = "South Africa";

export interface ShippingRule {
  method: string;
  flat: number;
  freeOver: number;
  currency: "ZAR";
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
};

export const SUPPORTED_COUNTRIES: ShippingCountry[] = ["South Africa"];

export function isSupportedCountry(c: string | null | undefined): c is ShippingCountry {
  return c === "South Africa";
}

export function getShippingCost(
  cartTotalInDestCurrency: number,
  country: string,
): number | null {
  if (!isSupportedCountry(country)) return null;
  const rule = SHIPPING_RULES[country];
  return cartTotalInDestCurrency >= rule.freeOver ? 0 : rule.flat;
}

export function amountToFreeShipping(
  cartTotalInDestCurrency: number,
  country: ShippingCountry = "South Africa",
): number {
  const rule = SHIPPING_RULES[country];
  return Math.max(0, rule.freeOver - cartTotalInDestCurrency);
}
