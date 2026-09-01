import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/context/CartContext";
import { SHIPPING_RULES, getShippingCost } from "@/lib/shipping";
import { validateCheckout, type CheckoutForm } from "@/lib/checkoutSchema";
import {
  quoteCheckout,
  type CheckoutSelection,
  type MixBundleSize,
} from "../../supabase/functions/_shared/pricing";
import {
  CHECKOUT_POLICY_VERSION,
  REPORT_SCOPE_VERSION,
} from "../../supabase/functions/_shared/checkout-consent";

export const CHECKOUT_FORM_KEY = "rtt_checkout_form";
export const EFT_SESSION_KEY = "rtt_eft_instructions";
export const EFT_REQUEST_KEY = "rtt_eft_request";

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
  ageConfirmed: false,
  researchUseAcknowledged: false,
  nonHumanUseAcknowledged: false,
  reportScopeAcknowledged: false,
  marketingConsent: false,
  consentPolicyVersion: CHECKOUT_POLICY_VERSION,
};

/** Read the shopper's previously entered checkout details (session-scoped). */
export function loadSavedCheckoutForm(): CheckoutForm | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(CHECKOUT_FORM_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CheckoutForm>;
    const versionMatches = parsed.consentPolicyVersion === CHECKOUT_POLICY_VERSION;
    return {
      ...emptyCheckoutForm,
      ...parsed,
      ...(!versionMatches ? {
        ageConfirmed: false,
        researchUseAcknowledged: false,
        nonHumanUseAcknowledged: false,
        reportScopeAcknowledged: false,
        marketingConsent: false,
      } : {}),
      consentPolicyVersion: CHECKOUT_POLICY_VERSION,
    };
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

interface StartEftArgs {
  items: CartItem[];
  form: CheckoutForm;
}

/** Convert mutable UI cart lines into the price-free selection contract. */
export function toCheckoutSelections(items: CartItem[]): CheckoutSelection[] {
  const selections: CheckoutSelection[] = [];
  const seenBundles = new Set<string>();

  for (const item of items) {
    if (item.bundleId) {
      if (seenBundles.has(item.bundleId)) continue;
      seenBundles.add(item.bundleId);
      const lines = items.filter((candidate) => candidate.bundleId === item.bundleId);
      const size = lines.length as MixBundleSize;
      if (size !== 5 && size !== 10) throw new Error("Bundle selection is stale. Please rebuild the pack.");
      if (lines.some((line) => line.quantity !== 1)) {
        throw new Error("Bundle quantity is stale. Please rebuild the pack.");
      }
      selections.push({ kind: "mix_bundle", size, slugs: lines.map((line) => line.product.slug) });
      continue;
    }
    selections.push({
      kind: "item",
      slug: item.product.slug,
      variantLabel: item.variantLabel ?? null,
      quantity: item.quantity,
    });
  }
  return selections;
}

function newRequestId(): string {
  if (typeof crypto.randomUUID !== "function") {
    throw new Error("This browser cannot securely initialise an EFT checkout.");
  }
  return crypto.randomUUID();
}

export function getOrCreateEftRequestId(selections: CheckoutSelection[], form: CheckoutForm): string {
  const fingerprint = JSON.stringify({
    selections,
    customer: {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
    },
    consent: {
      policyVersion: CHECKOUT_POLICY_VERSION,
      reportScopeVersion: REPORT_SCOPE_VERSION,
      ageConfirmed: form.ageConfirmed,
      researchUseAcknowledged: form.researchUseAcknowledged,
      nonHumanUseAcknowledged: form.nonHumanUseAcknowledged,
      reportScopeAcknowledged: form.reportScopeAcknowledged,
      marketingConsent: form.marketingConsent,
    },
  });
  try {
    const raw = window.sessionStorage.getItem(EFT_REQUEST_KEY);
    const pending = raw ? JSON.parse(raw) as { requestId?: unknown; fingerprint?: unknown } : null;
    if (
      pending
      && typeof pending.requestId === "string"
      && typeof pending.fingerprint === "string"
      && pending.fingerprint === fingerprint
    ) {
      return pending.requestId;
    }
    const requestId = newRequestId();
    window.sessionStorage.setItem(EFT_REQUEST_KEY, JSON.stringify({ requestId, fingerprint }));
    return requestId;
  } catch {
    return newRequestId();
  }
}

function clearEftRequestId(requestId: string): void {
  try {
    const raw = window.sessionStorage.getItem(EFT_REQUEST_KEY);
    const pending = raw ? JSON.parse(raw) as { requestId?: unknown } : null;
    if (pending?.requestId === requestId) window.sessionStorage.removeItem(EFT_REQUEST_KEY);
  } catch {
    // A checkout response remains valid even when session storage is unavailable.
  }
}

/**
 * EFT-only checkout: submits price-free selections to the same-origin server,
 * which creates the authoritative order before invoking the existing EFT
 * settlement boundary for bank details and email. Throws an Error with a
 * customer-safe message on failure.
 */
export async function startEftCheckout({
  items,
  form,
}: StartEftArgs): Promise<EftInstructionsState> {
  const selections = toCheckoutSelections(items);
  // Local quote is display-only. The server endpoint independently recomputes
  // the same selection and is the sole authority for the order amount.
  quoteCheckout(selections);
  const requestId = getOrCreateEftRequestId(selections, form);

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error("Your session has expired. Please sign in again.");
  const response = await fetch("/api/eft-create-order", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requestId,
      selections,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      consent: {
        ageConfirmed: form.ageConfirmed,
        researchUseAcknowledged: form.researchUseAcknowledged,
        nonHumanUseAcknowledged: form.nonHumanUseAcknowledged,
        reportScopeAcknowledged: form.reportScopeAcknowledged,
        marketingConsent: form.marketingConsent,
        policyVersion: CHECKOUT_POLICY_VERSION,
        reportScopeVersion: REPORT_SCOPE_VERSION,
        clientAcceptedAt: new Date().toISOString(),
      },
    }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data || data.error) throw new Error(data?.error || "EFT order could not be started");
  if (!data.order_id || !data.payment_reference || !data.bank || !Number.isFinite(data.amount)) {
    throw new Error("Invalid EFT response");
  }
  clearEftRequestId(requestId);

  return {
    orderId: data.order_id,
    amount: data.amount,
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
