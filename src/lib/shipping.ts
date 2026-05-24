// Single-market shipping (South Africa). Germany kept as a legal type only
// so legacy call sites continue to compile; runtime only supports South Africa.

export type ShippingCountry = "South Africa" | "Germany";

export interface ShippingRule {
  method: string;
  flat: number;
  freeOver: number;
  currency: "ZAR";
  days: string;
}

export const SHIPPING_RULES: Record<"South Africa", ShippingRule> = {
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
  if (country !== "South Africa") return null;
  const rule = SHIPPING_RULES["South Africa"];
  return cartTotalInDestCurrency >= rule.freeOver ? 0 : rule.flat;
}

export function amountToFreeShipping(
  cartTotalInDestCurrency: number,
  _country: ShippingCountry = "South Africa",
): number {
  const rule = SHIPPING_RULES["South Africa"];
  return Math.max(0, rule.freeOver - cartTotalInDestCurrency);
}
