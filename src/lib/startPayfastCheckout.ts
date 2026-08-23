import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/context/CartContext";
import { SHIPPING_RULES, getShippingCost } from "@/lib/shipping";
import { validateCheckout, type CheckoutForm } from "@/lib/checkoutSchema";

export const CHECKOUT_FORM_KEY = "rtt_checkout_form";

export const emptyCheckoutForm: CheckoutForm = {
  firstName: "",
  lastName: "",
  email: "",
  address1: "",
  city: "",
  region: "",
  postalCode: "",
};

/** Read the shopper's previously entered checkout details (session-scoped). */
export function loadSavedCheckoutForm(): CheckoutForm | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(CHECKOUT_FORM_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CheckoutForm>;
    return { ...emptyCheckoutForm, ...parsed };
  } catch {
    return null;
  }
}

/** True when we have everything needed to skip the form entirely. */
export function hasCompleteCheckoutDetails(form: CheckoutForm | null): form is CheckoutForm {
  if (!form) return false;
  return validateCheckout(form).ok === true;
}

/** Build & auto-submit an HTML form to PayFast. */
export function postToPayFast(actionUrl: string, fields: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = actionUrl;
  form.style.display = "none";
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined || v === null || v === "") continue;
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = k;
    input.value = String(v);
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

export function checkoutTotals(totalPrice: number) {
  const rule = SHIPPING_RULES["South Africa"];
  const ship = getShippingCost(totalPrice, "South Africa") ?? 0;
  return {
    rule,
    ship,
    grandTotal: Math.round((totalPrice + ship) * 100) / 100,
    freeUnlocked: ship === 0,
  };
}

interface StartArgs {
  userId: string;
  items: CartItem[];
  totalPrice: number;
  form: CheckoutForm;
  onBeforeRedirect?: () => Promise<void> | void;
}

async function extractFunctionError(err: unknown): Promise<string | null> {
  if (!err || typeof err !== "object") return null;
  const candidate = err as { message?: string; context?: unknown };

  if (candidate.context instanceof Response) {
    try {
      const res = candidate.context.clone();
      const payload = await res.json().catch(() => null) as { error?: unknown } | null;
      if (payload && typeof payload.error === "string" && payload.error.trim().length > 0) {
        return payload.error;
      }

      const text = await res.text();
      if (text.trim().length > 0) return text;
    } catch {
      // Ignore parse issues and fall back to generic message.
    }
  }

  return typeof candidate.message === "string" ? candidate.message : null;
}

/**
 * Creates the order row, asks the edge function for a signed PayFast payload
 * and redirects the browser to the hosted payment page (Apple Pay, Capitec Pay,
 * instant EFT and cards all live there). Throws on failure.
 */
export async function startPayfastCheckout({
  userId,
  items,
  totalPrice,
  form,
  onBeforeRedirect,
}: StartArgs): Promise<void> {
  const totals = checkoutTotals(totalPrice);

  const description = items
    .map((i) => `${i.product.name}${i.variantLabel ? ` (${i.variantLabel})` : ""} x${i.quantity}`)
    .join(", ")
    .slice(0, 500);

  const { data: orderRow, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      total: totals.grandTotal,
      discount_code: null,
      status: "pending",
      currency: "ZAR",
      order_description: description,
      shipping_country: "South Africa",
      shipping_method: totals.rule.method,
      shipping_cost: Math.round(totals.ship * 100) / 100,
      shipping_currency: "ZAR",
      free_shipping_applied: totals.freeUnlocked,
    })
    .select("id")
    .single();
  if (orderErr || !orderRow) throw orderErr ?? new Error("Failed to create order");

  const origin = window.location.origin;
  const { data, error: fnErr } = await supabase.functions.invoke("payfast-create-payment", {
    body: {
      orderId: orderRow.id,
      amount: totals.grandTotal,
      itemName: description.slice(0, 100) || "Peptide South Africa order",
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      returnUrl: `${origin}/checkout/success?order_id=${orderRow.id}`,
      cancelUrl: `${origin}/checkout/cancel?order_id=${orderRow.id}`,
    },
  });
  if (fnErr) {
    const detail = await extractFunctionError(fnErr);
    throw new Error(detail || "Payment could not be started");
  }
  if (!data || data.error) throw new Error(data?.error || "Payment could not be started");
  if (!data.actionUrl || !data.fields) throw new Error("Invalid PayFast response");

  await onBeforeRedirect?.();
  postToPayFast(data.actionUrl, data.fields);
}

export function paymentErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : "Payment could not be started";
  return msg.includes("not configured") || msg.includes("503")
    ? "Payment is temporarily unavailable. Please try again shortly."
    : msg;
}
