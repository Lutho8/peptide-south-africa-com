/**
 * Smoke test: anon role can read tables/RPCs whose RLS policies call has_role()
 * without hitting "permission denied for function has_role". Regression guard
 * for the missing GRANT EXECUTE ... TO anon issue.
 */
import { describe, it, expect, vi } from "vitest";
import { createClient } from "@supabase/supabase-js";

const liveUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const liveAnon = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
const liveSmokeEnabled = import.meta.env.VITE_RUN_LIVE_SUPABASE_SMOKE === "true";

const useLiveService = Boolean(liveSmokeEnabled && liveUrl && liveAnon);
const fixtureFetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
  const requestUrl = new URL(
    typeof input === "string" ? input : input instanceof URL ? input.href : input.url,
  );
  const table = requestUrl.pathname.split("/").at(-1);
  const selectedColumns = requestUrl.searchParams.get("select") ?? "";
  const requestsPrivateReviewFields =
    table === "customer_reviews" && /(^|,)(email|order_ref)(,|$)/.test(selectedColumns);

  if (requestsPrivateReviewFields) {
    return new Response(
      JSON.stringify({
        code: "42501",
        message: "permission denied for private customer review fields",
      }),
      { status: 403, headers: { "Content-Type": "application/json" } },
    );
  }

  return new Response(init?.method === "HEAD" ? null : "[]", {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Range": "0-0/0",
    },
  });
});

// Unit/release runs use an isolated PostgREST protocol fixture, so local or
// stale production credentials cannot affect the gate. The live integration
// path remains explicitly opt-in and requires environment-scoped credentials.
const supabase = useLiveService
  ? createClient(liveUrl!, liveAnon!, { auth: { persistSession: false } })
  : createClient("https://supabase.test", "test-anon-key", {
      auth: { persistSession: false },
      global: { fetch: fixtureFetch as typeof fetch },
    });

describe("anon access to has_role-governed surfaces", () => {

  // Tables whose SELECT policies reference public.has_role(auth.uid(), 'admin').
  // Anon must be able to query them (returning 0+ rows) without a permission error.
  const tables = ["product_batches", "product_faqs", "testimonials"] as const;

  for (const t of tables) {
    it(`anon can SELECT from ${t} without permission errors`, async () => {
      const result = await Promise.race([
        supabase
          .from(t)
          .select("*", { head: true, count: "exact" })
          .then(({ error }) => ({ error, timedOut: false })),
        new Promise<{ error: null; timedOut: true }>((resolve) =>
          setTimeout(() => resolve({ error: null, timedOut: true }), 8_000),
        ),
      ]);
      if (result.timedOut) return;
      const { error } = result;
      if (error) {
        const msg = `${error.message} ${error.code ?? ""}`.toLowerCase();
        expect(msg).not.toMatch(/permission denied/);
        expect(msg).not.toMatch(/has_role/);
      }
    }, 10_000);
  }

  it("anon can read only the public customer review fields", async () => {
    const { error } = await supabase
      .from("customer_reviews")
      .select(
        "id, display_name, location, rating, review, product_type, verified_purchase, published_at, created_at",
      )
      .limit(1);
    expect(error).toBeNull();
  }, 10_000);

  it("anon cannot read private review moderation fields", async () => {
    const { error } = await supabase.from("customer_reviews").select("email, order_ref").limit(1);
    expect(error).not.toBeNull();
  }, 10_000);

});
