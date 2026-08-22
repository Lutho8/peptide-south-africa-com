// Single-market shipping (South Africa, ZAR-only).

export type ShippingCountry = "South Africa";
export type PostNetDeliveryMethod = "postnet_to_door" | "postnet_to_postnet";

export interface ShippingRule {
  method: PostNetDeliveryMethod;
  label: string;
  shortLabel: string;
  flat: number;
  freeOver: number;
  currency: "ZAR";
  days: string;
}

export const POSTNET_SHIPPING_RULES: Record<PostNetDeliveryMethod, ShippingRule> = {
  postnet_to_door: {
    method: "postnet_to_door",
    label: "PostNet to your door",
    shortLabel: "To your door",
    flat: 109,
    freeOver: 1500,
    currency: "ZAR",
    days: "1–3 business days",
  },
  postnet_to_postnet: {
    method: "postnet_to_postnet",
    label: "Collect from a PostNet branch",
    shortLabel: "Branch collection",
    flat: 109,
    freeOver: 1500,
    currency: "ZAR",
    days: "2–3 business days",
  },
};

export const SHIPPING_RULES: Record<ShippingCountry, ShippingRule> = {
  "South Africa": POSTNET_SHIPPING_RULES.postnet_to_door,
};

export const SUPPORTED_COUNTRIES: ShippingCountry[] = ["South Africa"];

export function isSupportedCountry(c: string | null | undefined): c is ShippingCountry {
  return c === "South Africa";
}

export function getShippingCost(
  cartTotalZar: number,
  country: string,
  method: PostNetDeliveryMethod = "postnet_to_door",
): number | null {
  if (country !== "South Africa") return null;
  const rule = POSTNET_SHIPPING_RULES[method];
  return cartTotalZar >= rule.freeOver ? 0 : rule.flat;
}

export function amountToFreeShipping(cartTotalZar: number): number {
  const rule = SHIPPING_RULES["South Africa"];
  return Math.max(0, rule.freeOver - cartTotalZar);
}
