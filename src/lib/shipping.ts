// Single-market shipping (South Africa, ZAR-only).
import { PRICING, shippingForSubtotal, roundCents } from "../../supabase/functions/_shared/pricing";

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
    method: PRICING.shipping.method,
    flat: PRICING.shipping.flat,
    freeOver: PRICING.shipping.freeOver,
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
  return shippingForSubtotal(cartTotalZar);
}

export function amountToFreeShipping(cartTotalZar: number): number {
  const rule = SHIPPING_RULES["South Africa"];
  if (!Number.isFinite(cartTotalZar) || cartTotalZar < 0) throw new Error("Invalid merchandise total");
  return Math.max(0, roundCents(rule.freeOver - roundCents(cartTotalZar)));
}
