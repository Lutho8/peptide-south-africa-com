import { supabase } from "@/integrations/supabase/client";

export type NocobaseAction =
  | "lead.upsert"
  | "order.created"
  | "quiz.completed"
  | "cart.abandoned";

/**
 * Fire-and-forget Nocobase sync. Never throws; logs to console on failure
 * so frontend flows are never blocked by CRM downtime or missing config.
 */
export async function syncToNocobase(action: NocobaseAction, payload: Record<string, unknown>) {
  try {
    const { error } = await supabase.functions.invoke("nocobase-sync", {
      body: { action, payload },
    });
    if (error) console.warn("[nocobase-sync]", action, error.message);
  } catch (err) {
    console.warn("[nocobase-sync] dispatch failed", err);
  }
}
