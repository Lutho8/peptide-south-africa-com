/**
 * Smoke test: anon role can read tables/RPCs whose RLS policies call has_role()
 * without hitting "permission denied for function has_role". Regression guard
 * for the missing GRANT EXECUTE ... TO anon issue.
 */
import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

const runIf = url && anon ? describe : describe.skip;

runIf("anon access to has_role-governed surfaces", () => {
  const supabase = createClient(url!, anon!, { auth: { persistSession: false } });

  // Tables whose SELECT policies reference public.has_role(auth.uid(), 'admin').
  // Anon must be able to query them (returning 0+ rows) without a permission error.
  const tables = ["product_batches", "product_faqs", "testimonials"] as const;

  for (const t of tables) {
    it(`anon can SELECT from ${t} without permission errors`, async () => {
      const { error } = await supabase.from(t).select("*", { head: true, count: "exact" });
      if (error) {
        const msg = `${error.message} ${error.code ?? ""}`.toLowerCase();
        expect(msg).not.toMatch(/permission denied/);
        expect(msg).not.toMatch(/has_role/);
      }
    });
  }

