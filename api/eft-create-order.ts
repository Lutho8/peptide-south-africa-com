import { createClient } from "@supabase/supabase-js";
import {
  PRICING,
  quoteCheckout,
  type CheckoutSelection,
} from "../supabase/functions/_shared/pricing.js";
import {
  CHECKOUT_CONSENT_STATEMENTS,
  isValidCheckoutConsent,
} from "../supabase/functions/_shared/checkout-consent.js";

export const config = { runtime: "edge" };

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });

const requiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
};

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Your session has expired. Please sign in again.", code: "AUTH_REQUIRED" }, 401);
    }

    const supabaseUrl = requiredEnv("SUPABASE_URL");
    const anonKey = requiredEnv("SUPABASE_ANON_KEY");
    const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const token = authHeader.slice("Bearer ".length);
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userError } = await authClient.auth.getUser(token);
    if (userError || !userData.user) {
      return json({ error: "Your session has expired. Please sign in again.", code: "AUTH_REQUIRED" }, 401);
    }

    const body = await request.json().catch(() => null) as {
      requestId?: unknown;
      selections?: CheckoutSelection[];
      firstName?: unknown;
      lastName?: unknown;
      email?: unknown;
      consent?: unknown;
    } | null;
    const requestId = body?.requestId;
    if (typeof requestId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
      return json({ error: "Invalid checkout request.", code: "BAD_REQUEST" }, 400);
    }
    if (typeof body?.email !== "string" || !body.email.trim()) {
      return json({ error: "Email is required.", code: "BAD_REQUEST" }, 400);
    }
    const consent = body?.consent;
    if (!isValidCheckoutConsent(consent)) {
      return json({
        error: "Please accept the required research-use acknowledgements before placing your order.",
        code: "CONSENT_REQUIRED",
      }, 400);
    }

    let quote;
    try {
      quote = quoteCheckout(body.selections ?? []);
    } catch (error) {
      return json({
        error: error instanceof Error ? error.message : "Invalid cart selection.",
        code: "INVALID_CART",
      }, 400);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const orderPayload = {
      user_id: userData.user.id,
      checkout_request_id: requestId,
      total: quote.total,
      discount_code: null,
      status: "pending",
      currency: PRICING.currency,
      payment_provider: "eft_capitec",
      order_description: quote.description,
      shipping_country: PRICING.shipping.country,
      shipping_method: PRICING.shipping.method,
      shipping_cost: quote.shipping,
      shipping_currency: PRICING.currency,
      free_shipping_applied: quote.freeShippingApplied,
    };

    let { data: order, error: orderError } = await admin
      .from("orders")
      .select("id, user_id, total, currency, order_description")
      .eq("checkout_request_id", requestId)
      .maybeSingle();

    if (!order && !orderError) {
      const inserted = await admin
        .from("orders")
        .insert(orderPayload)
        .select("id, user_id, total, currency, order_description")
        .single();
      order = inserted.data;
      orderError = inserted.error;
      if (orderError?.code === "23505") {
        const raced = await admin
          .from("orders")
          .select("id, user_id, total, currency, order_description")
          .eq("checkout_request_id", requestId)
          .maybeSingle();
        order = raced.data;
        orderError = raced.error;
      }
    }

    if (orderError || !order) {
      console.error("authoritative order creation failed", orderError?.code);
      return json({ error: "Order could not be created. Please try again." }, 500);
    }

    const requestMatches = order.user_id === userData.user.id
      && String(order.currency).toUpperCase() === PRICING.currency
      && Math.abs(Number(order.total) - quote.total) <= 0.01
      && String(order.order_description ?? "") === quote.description;
    if (!requestMatches) {
      return json({ error: "Checkout request conflicts with an earlier cart.", code: "ORDER_CONFLICT" }, 409);
    }

    const { data: existingConsent, error: consentLookupError } = await admin
      .from("checkout_consents")
      .select("user_id, policy_version, report_scope_version, marketing_consent")
      .eq("order_id", order.id)
      .maybeSingle();
    if (consentLookupError) {
      console.error("checkout consent lookup failed", consentLookupError.code);
      return json({ error: "Your acknowledgements could not be recorded. Please try again." }, 500);
    }
    if (existingConsent) {
      const consentMatches = existingConsent.user_id === userData.user.id
        && existingConsent.policy_version === consent.policyVersion
        && existingConsent.report_scope_version === consent.reportScopeVersion
        && existingConsent.marketing_consent === consent.marketingConsent;
      if (!consentMatches) {
        return json({ error: "Checkout consent conflicts with an earlier request.", code: "ORDER_CONFLICT" }, 409);
      }
    } else {
      const { error: consentInsertError } = await admin.from("checkout_consents").insert({
        order_id: order.id,
        user_id: userData.user.id,
        policy_version: consent.policyVersion,
        report_scope_version: consent.reportScopeVersion,
        age_confirmed: consent.ageConfirmed,
        research_use_acknowledged: consent.researchUseAcknowledged,
        non_human_use_acknowledged: consent.nonHumanUseAcknowledged,
        report_scope_acknowledged: consent.reportScopeAcknowledged,
        marketing_consent: consent.marketingConsent,
        client_accepted_at: consent.clientAcceptedAt,
        statements: CHECKOUT_CONSENT_STATEMENTS,
        source: "storefront_checkout",
      });
      if (consentInsertError) {
        console.error("checkout consent insert failed", consentInsertError.code);
        return json({ error: "Your acknowledgements could not be recorded. Please try again." }, 500);
      }
    }

    // The existing settlement function remains the EFT-bank-details and email
    // boundary. It can trust this price because this server created the order.
    const settlementResponse = await fetch(`${supabaseUrl}/functions/v1/eft-create-order`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        apikey: anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId: order.id,
        amount: quote.total,
        itemName: quote.description.slice(0, 100),
        firstName: typeof body.firstName === "string" ? body.firstName : "",
        lastName: typeof body.lastName === "string" ? body.lastName : "",
        email: body.email,
      }),
    });
    const settlement = await settlementResponse.json().catch(() => null) as Record<string, unknown> | null;
    if (!settlementResponse.ok || !settlement || settlement.error) {
      return json({
        error: typeof settlement?.error === "string" ? settlement.error : "EFT order could not be started.",
        code: settlement?.code ?? "EFT_START_FAILED",
      }, settlementResponse.status >= 400 ? settlementResponse.status : 502);
    }

    return json({ ...settlement, order_id: order.id, amount: quote.total });
  } catch (error) {
    console.error("eft-create-order failed", error instanceof Error ? error.message : "unknown error");
    return json({ error: "Checkout is temporarily unavailable. Please try again." }, 500);
  }
}
