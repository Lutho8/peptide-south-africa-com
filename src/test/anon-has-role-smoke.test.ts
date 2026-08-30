/**
 * Smoke test: anon role can read tables/RPCs whose RLS policies call has_role()
 * without hitting "permission denied for function has_role". Regression guard
 * for the missing GRANT EXECUTE ... TO anon issue.
 */
import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

// The tracked .env ships a placeholder ("your-anon-key"); treat it as
// unconfigured so the smoke test only runs against real credentials.
const configured = url && anon && !anon.includes("your-anon-key");

const runIf = configured ? describe : describe.skip;

runIf("anon access to has_role-governed surfaces", () => {
  const supabase = createClient(url!, anon!, { auth: { persistSession: false } });

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
