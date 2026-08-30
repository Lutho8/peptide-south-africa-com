import { supabase } from "@/integrations/supabase/client";

/**
 * PSA funnel + merchandising event contract (privacy-minimised).
 *
 * One append-only stream (`public.analytics_events`, migration
 * 20260823213000_analytics_events.sql) powers the EFT funnel
 *
 *   checkout_started → eft_instructions_shown → payin_completed
 *
 * and the pack-anchoring merchandising metrics
 *
 *   pdp_variant_selected / pdp_full_course_selected
 *   cart_3pack_prompt_clicked / cart_upgrade_5pack_clicked
 *   build_stack_prefill_started   (+ eft_reference_copied micro-signal)
 *
 * Rules:
 * - No PII in props — product slugs, pack sizes, ZAR amounts, order ids only.
 * - Fire-and-forget: tracking must never break or delay a customer action.
 * - `payin_completed` is emitted server-side by eft-reconcile on settle;
 *   it is part of this contract but is never sent from the browser.
 */
export type AnalyticsEvent =
  | { event: "pdp_variant_selected"; props: { slug: string; pack_size: number; price_zar: number } }
  | { event: "pdp_full_course_selected"; props: { slug: string; price_zar: number } }
  | { event: "cart_3pack_prompt_clicked"; props: { anchor_slug: string; cart_units: number } }
  | { event: "cart_upgrade_5pack_clicked"; props: { anchor_slug: string; cart_units: number } }
  | { event: "build_stack_prefill_started"; props: { slug: string } }
  | { event: "checkout_started"; props: { item_count: number; order_value_zar: number } }
  | { event: "eft_instructions_shown"; props: { order_id: string; amount_zar: number } }
  | { event: "eft_reference_copied"; props: { order_id: string } };

export type AnalyticsEventName = AnalyticsEvent["event"];

const SESSION_KEY = "psa_analytics_sid";

/** Random per-browser-session token. Not an identity; resets when the tab closes. */
function sessionId(): string {
  try {
    let sid = window.sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      window.sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return "unknown";
  }
}

interface AnalyticsRow {
  event: string;
  session_id: string;
  user_id: string | null;
  props: Record<string, unknown>;
}

interface AnalyticsTable {
  insert: (row: AnalyticsRow) => Promise<{ error: { message: string } | null }>;
}

/**
 * Append one event. Fire-and-forget: resolves nothing, throws nothing.
 *
 * `analytics_events` accepts anon/authenticated INSERT only (RLS: no client
 * SELECT). The generated Database types refresh separately, so the insert
 * goes through the minimal typed handle above until types regenerate.
 */
export function trackEvent(e: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  if (import.meta.env.MODE === "test") return;
  void (async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const row: AnalyticsRow = {
        event: e.event,
        session_id: sessionId(),
        user_id: data.session?.user.id ?? null,
        props: e.props,
      };
      const table = (supabase as unknown as { from: (t: string) => AnalyticsTable }).from(
        "analytics_events",
      );
      const { error } = await table.insert(row);
      if (error) console.debug("[analytics]", e.event, error.message);
    } catch (err) {
      console.debug("[analytics]", e.event, err);
    }
  })();
}
