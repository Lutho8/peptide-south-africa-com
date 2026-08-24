import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/context/CartContext";
import { SHIPPING_RULES, getShippingCost } from "@/lib/shipping";
import { validateCheckout, type CheckoutForm } from "@/lib/checkoutSchema";

export const CHECKOUT_FORM_KEY = "rtt_checkout_form";
export const EFT_SESSION_KEY = "rtt_eft_instructions";

export type EftBankDetails = {
  account_name: string;
  bank: string;
  account_number: string;
  branch_code: string;
  reference: string;
};

export type EftInstructionsState = {
  orderId: string;
  amount: number;
  paymentReference: string;
  bank: EftBankDetails;
};

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

/**
 * Extracts the most useful customer-facing message from a failed
 * `supabase.functions.invoke` call: reads the edge function's JSON body off
 * the response context when it's still readable, falling back to the generic
 * FunctionsHttpError message.
 */
export async function functionErrorMessage(fnErr: unknown): Promise<string> {
  const err = fnErr as { context?: Response; message?: string } | null;
  const res = err?.context;
  if (res instanceof Response) {
    try {
      const body = await res.clone().json();
      if (body && typeof body.error === "string" && body.error) return body.error;
    } catch {
      /* body already consumed or not JSON */
    }
  }
  return err?.message || "Checkout could not be started";
}

interface StartEftArgs {
  userId: string;
  items: CartItem[];
  totalPrice: number;
  form: CheckoutForm;
}

/**
 * EFT-only checkout: creates the `orders` row, asks the eft-create-order
 * edge function for a unique payment reference + bank details, and returns
 * the state the instructions page needs. Throws an Error with a
 * customer-safe message on failure.
 */
export async function startEftCheckout({
  userId,
  items,
  totalPrice,
  form,
}: StartEftArgs): Promise<EftInstructionsState> {
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

  const { data, error: fnErr } = await supabase.functions.invoke("eft-create-order", {
    body: {
      orderId: orderRow.id,
      amount: totals.grandTotal,
      itemName: description.slice(0, 100) || "Peptide South Africa order",
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
    },
  });
  if (fnErr) throw new Error(await functionErrorMessage(fnErr));
  if (!data || data.error) throw new Error(data?.error || "EFT order could not be started");
  if (!data.payment_reference || !data.bank) throw new Error("Invalid EFT response");

  return {
    orderId: orderRow.id,
    amount: totals.grandTotal,
    paymentReference: data.payment_reference,
    bank: data.bank,
  };
}

export function paymentErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : "Checkout could not be started";
  return msg.includes("not configured") || msg.includes("503")
    ? "Payment is temporarily unavailable. Please try again shortly."
    : msg;
}
