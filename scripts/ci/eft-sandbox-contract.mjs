import { randomBytes, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const requiredEnv = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required sandbox variable: ${name}`);
  return value;
};

const supabaseUrl = requiredEnv("EFT_SANDBOX_SUPABASE_URL").replace(/\/$/, "");
const publishableKey = requiredEnv("EFT_SANDBOX_PUBLISHABLE_KEY");
const serviceRoleKey = requiredEnv("EFT_SANDBOX_SERVICE_ROLE_KEY");
const runId = (process.env.GITHUB_RUN_ID || Date.now().toString()).replace(/[^0-9A-Za-z-]/g, "");
const email = `eft-contract+${runId}-${randomBytes(4).toString("hex")}@example.invalid`;
const password = `CI-${randomBytes(24).toString("base64url")}!aA1`;
const reconcileSecret = requiredEnv("EFT_SANDBOX_RECONCILE_SECRET");

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const shopper = createClient(supabaseUrl, publishableKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let userId;

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

async function invoke(accessToken, body) {
  const response = await fetch(`${supabaseUrl}/functions/v1/eft-create-order`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: serviceRoleKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => null);
  return { response, data };
}

async function reconcile(body) {
  const response = await fetch(`${supabaseUrl}/functions/v1/eft-reconcile`, {
    method: "POST",
    headers: {
      apikey: publishableKey,
      "Content-Type": "application/json",
      "x-eft-secret": reconcileSecret,
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => null);
  return { response, data };
}

async function deleteRows(table, column, value) {
  const { error } = await admin.from(table).delete().eq(column, value);
  if (error) throw new Error(`Sandbox cleanup failed for ${table}: ${error.code || error.message}`);
}

async function cleanup() {
  if (!userId) return;
  const { data: orders, error: orderLookupError } = await admin
    .from("orders")
    .select("id")
    .eq("user_id", userId);
  if (orderLookupError) throw new Error(`Sandbox cleanup could not list orders: ${orderLookupError.code || orderLookupError.message}`);

  const orderIds = (orders || []).map((order) => order.id);
  await admin.from("email_outbox").update({ status: "cancelled" }).eq("user_id", userId);
  await deleteRows("email_outbox", "user_id", userId);
  await deleteRows("psa_orders", "user_id", userId);
  for (const orderId of orderIds) {
    const { error } = await admin.from("integration_logs").delete().contains("payload", { orderId });
    if (error) throw new Error(`Sandbox cleanup failed for integration_logs: ${error.code || error.message}`);
  }
  await deleteRows("orders", "user_id", userId);
  const { error: userDeleteError } = await admin.auth.admin.deleteUser(userId);
  if (userDeleteError) throw new Error(`Sandbox user cleanup failed: ${userDeleteError.message}`);
}

let contractError;
try {
  const unauthenticated = await fetch(`${supabaseUrl}/functions/v1/eft-create-order`, {
    method: "POST",
    headers: { apikey: publishableKey, "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  assert(unauthenticated.status === 401, `Unauthenticated checkout returned HTTP ${unauthenticated.status} instead of 401`);

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { synthetic: true, source: "eft-sandbox-contract" },
  });
  if (createError || !created.user) throw new Error(`Synthetic user creation failed: ${createError?.message || "no user returned"}`);
  userId = created.user.id;

  const { data: session, error: signInError } = await shopper.auth.signInWithPassword({ email, password });
  if (signInError || !session.session?.access_token) throw new Error(`Synthetic user sign-in failed: ${signInError?.message || "no access token"}`);
  const accessToken = session.session.access_token;

  const untrustedDirect = await fetch(`${supabaseUrl}/functions/v1/eft-create-order`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: publishableKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  assert(untrustedDirect.status === 403, `Public direct checkout returned HTTP ${untrustedDirect.status} instead of 403`);

  const requestId = randomUUID();
  const validBody = {
    requestId,
    selections: [{ kind: "item", slug: "ghk-cu-50mg", variantLabel: "Single Vial", quantity: 1, unitPrice: 1 }],
    amount: 1,
    firstName: "EFT",
    lastName: "Contract",
    email,
  };
  const first = await invoke(accessToken, validBody);
  assert(first.response.status === 200, `Valid checkout returned HTTP ${first.response.status} (${first.data?.code || "no code"})`);
  assert(first.data?.ok === true, "Valid checkout did not return ok=true");
  assert(first.data?.amount === 719, `Server amount mismatch: expected 719, received ${first.data?.amount}`);
  assert(/^[0-9a-f-]{36}$/i.test(first.data?.order_id || ""), "Valid checkout did not return an order UUID");
  assert(/^PSA-[0-9A-HJKMNP-TV-Z]{6}$/.test(first.data?.payment_reference || ""), "Payment reference format mismatch");
  assert(typeof first.data?.bank?.account_name === "string" && first.data.bank.account_name.length > 0, "Bank account name missing");
  assert(typeof first.data?.bank?.account_number === "string" && first.data.bank.account_number.length > 0, "Bank account number missing");
  assert(typeof first.data?.bank?.branch_code === "string" && first.data.bank.branch_code.length > 0, "Bank branch code missing");

  const { data: stored, error: storedError } = await admin
    .from("orders")
    .select("id, user_id, total, currency, checkout_request_id")
    .eq("id", first.data.order_id)
    .single();
  if (storedError || !stored) throw new Error(`Authoritative order lookup failed: ${storedError?.code || storedError?.message || "not found"}`);
  assert(stored.user_id === userId, "Authoritative order belongs to the wrong user");
  assert(Number(stored.total) === 719, `Stored order total mismatch: ${stored.total}`);
  assert(stored.currency === "ZAR", `Stored order currency mismatch: ${stored.currency}`);
  assert(stored.checkout_request_id === requestId, "Stored checkout request ID mismatch");

  const replay = await invoke(accessToken, validBody);
  assert(replay.response.status === 200, `Idempotent replay returned HTTP ${replay.response.status}`);
  assert(replay.data?.order_id === first.data.order_id, "Idempotent replay created a second order");
  assert(replay.data?.payment_reference === first.data.payment_reference, "Idempotent replay changed the payment reference");

  const conflict = await invoke(accessToken, {
    ...validBody,
    selections: [{ kind: "item", slug: "mots-c", variantLabel: "Single Vial", quantity: 1 }],
  });
  assert(conflict.response.status === 409 && conflict.data?.code === "ORDER_CONFLICT", "Stale request ID was not rejected with ORDER_CONFLICT");

  const manipulated = await invoke(accessToken, {
    ...validBody,
    requestId: randomUUID(),
    selections: [{ kind: "item", slug: "ghk-cu-50mg", variantLabel: "3-Pack for R1", quantity: 1 }],
  });
  assert(manipulated.response.status === 400 && manipulated.data?.code === "INVALID_CART", "Manipulated variant was not rejected");

  const directResearchProduct = await invoke(accessToken, {
    ...validBody,
    requestId: randomUUID(),
    selections: [{ kind: "item", slug: "rt3-reta", variantLabel: "Single Vial", quantity: 1 }],
  });
  assert(directResearchProduct.response.ok && directResearchProduct.data?.ok === true, "Published research product did not proceed through checkout");

  const receivedAt = new Date().toISOString();
  const syntheticDeposit = {
    amount: first.data.amount,
    reference: first.data.payment_reference,
    payer_name: "PSA SYNTHETIC PAID ORDER SMOKE",
    received_at: receivedAt,
    raw: { synthetic_test: true, source: "eft-sandbox-contract" },
  };

  const mismatch = await reconcile({
    order_id: first.data.order_id,
    reference: first.data.payment_reference,
    deposits: [{ ...syntheticDeposit, amount: first.data.amount - 1 }],
  });
  assert(mismatch.response.status === 200 && mismatch.data?.ok === true, "Amount-mismatch reconciliation failed unexpectedly");
  assert(mismatch.data?.matched === 0 && mismatch.data?.still_unmatched === 1, "Amount mismatch was not left unmatched");
  assert(mismatch.data?.order_state?.payment_status === "awaiting_eft", "Amount mismatch changed payment status");

  const paid = await reconcile({
    order_id: first.data.order_id,
    reference: first.data.payment_reference,
    deposits: [syntheticDeposit],
  });
  assert(paid.response.status === 200 && paid.data?.ok === true, `Paid reconciliation returned HTTP ${paid.response.status}`);
  assert(paid.data?.inserted === 1 && paid.data?.matched === 1, "Valid deposit did not settle exactly one order");
  assert(paid.data?.order_state?.payment_status === "complete", "CRM order did not reach complete");
  assert(paid.data?.order_state?.payment_settled_at, "CRM order has no settlement timestamp");

  const { data: paidOrder, error: paidOrderError } = await admin
    .from("orders")
    .select("status, paid_at")
    .eq("id", first.data.order_id)
    .single();
  if (paidOrderError || !paidOrder) throw new Error(`Paid storefront order lookup failed: ${paidOrderError?.message || "not found"}`);
  assert(paidOrder.status === "paid" && paidOrder.paid_at, "Storefront order did not reach paid with paid_at");

  const { data: revenueEvents, error: revenueError } = await admin
    .from("analytics_events")
    .select("event, props")
    .eq("props->>order_id", first.data.order_id)
    .in("event", ["bank_deposit_verified", "payin_completed"]);
  if (revenueError) throw new Error(`Revenue-event lookup failed: ${revenueError.message}`);
  assert(revenueEvents?.length === 2, `Expected two derived revenue events, received ${revenueEvents?.length || 0}`);
  assert(new Set(revenueEvents.map(({ event }) => event)).size === 2, "Derived revenue events were duplicated");

  const { data: confirmation, error: confirmationError } = await admin
    .from("email_outbox")
    .select("template, status")
    .eq("idempotency_key", `order_confirmation:${first.data.order_id}`)
    .single();
  if (confirmationError || !confirmation) throw new Error(`Confirmation lookup failed: ${confirmationError?.message || "not found"}`);
  assert(confirmation.template === "order_confirmation" && confirmation.status === "queued", "Order confirmation was not queued");

  const { data: fulfilment, error: fulfilmentError } = await admin
    .from("integration_logs")
    .select("status, payload")
    .eq("integration", "eft")
    .eq("action", "reconcile")
    .eq("status", "matched")
    .contains("payload", { orderId: first.data.order_id, synthetic_test: true });
  if (fulfilmentError) throw new Error(`Fulfilment lookup failed: ${fulfilmentError.message}`);
  assert(fulfilment?.length === 1, "Synthetic fulfilment record was not written exactly once");

  const replayDeposit = await reconcile({
    order_id: first.data.order_id,
    reference: first.data.payment_reference,
    deposits: [syntheticDeposit],
  });
  assert(replayDeposit.data?.duplicates === 1 && replayDeposit.data?.matched === 0, "Duplicate deposit was not deduplicated");

  const { count: finalRevenueCount, error: finalRevenueError } = await admin
    .from("analytics_events")
    .select("id", { count: "exact", head: true })
    .eq("props->>order_id", first.data.order_id)
    .in("event", ["bank_deposit_verified", "payin_completed"]);
  if (finalRevenueError) throw new Error(`Final revenue-event count failed: ${finalRevenueError.message}`);
  assert(finalRevenueCount === 2, "Deposit replay duplicated derived revenue events");

  console.log("EFT sandbox contract passed: checkout and synthetic pending-to-paid settlement verified end to end.");
} catch (error) {
  contractError = error;
} finally {
  try {
    await cleanup();
  } catch (cleanupError) {
    if (!contractError) contractError = cleanupError;
    else console.error(cleanupError instanceof Error ? cleanupError.message : "Sandbox cleanup failed");
  }
}

if (contractError) throw contractError;
