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
      apikey: publishableKey,
      "Content-Type": "application/json",
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

  const consultOnly = await invoke(accessToken, {
    ...validBody,
    requestId: randomUUID(),
    selections: [{ kind: "item", slug: "rt3-reta", variantLabel: "Single Vial", quantity: 1 }],
  });
  assert(consultOnly.response.status === 400 && consultOnly.data?.code === "INVALID_CART", "Consult-only product was not rejected");

  console.log("EFT sandbox contract passed: authenticated pricing, persistence, idempotency and manipulation guards verified.");
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
