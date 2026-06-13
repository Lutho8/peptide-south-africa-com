// Single-market shipping (South Africa, ZAR-only).

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
    method: "Local courier (The Courier Guy / Aramex)",
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

export function getShippingCost(cartTotalZar: number, country: string): number | null {
  if (country !== "South Africa") return null;
  const rule = SHIPPING_RULES["South Africa"];
  return cartTotalZar >= rule.freeOver ? 0 : rule.flat;
}

export function amountToFreeShipping(cartTotalZar: number): number {
  const rule = SHIPPING_RULES["South Africa"];
  return Math.max(0, rule.freeOver - cartTotalZar);
}
