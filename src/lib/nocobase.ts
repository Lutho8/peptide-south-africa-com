import { supabase } from "@/integrations/supabase/client";

export type NocobaseAction =
  | "lead.upsert"
  | "order.created"
  | "quiz.completed"
  | "cart.abandoned";

export type LeadSource =
  | "newsletter"
  | "discount_popup"
  | "quiz"
  | "signup"
  | "cart_abandoned"
  | "order";

const STAGE_BY_SOURCE: Record<LeadSource, string> = {
  newsletter: "subscriber",
  discount_popup: "lead",
  quiz: "quiz_completed",
  signup: "account_created",
  cart_abandoned: "cart_abandoner",
  order: "customer",
};

const TAGS_BY_SOURCE: Record<LeadSource, string[]> = {
  newsletter: ["newsletter"],
  discount_popup: ["discount_popup", "first_order_discount"],
  quiz: ["quiz"],
  signup: ["signup"],
  cart_abandoned: ["cart", "abandoned_24h"],
  order: ["purchase"],
};

export function stageForSource(source: LeadSource): string {
  return STAGE_BY_SOURCE[source];
}

export function tagsForSource(source: LeadSource): string[] {
  return [...TAGS_BY_SOURCE[source]];
}

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

/**
 * Standardized lead capture. Adds canonical stage + tags for the source,
 * letting the caller pass extra fields and (optionally) override stage/tags.
 */
export async function captureLead(args: {
  source: LeadSource;
  email?: string | null;
  extraTags?: string[];
  extra?: Record<string, unknown>;
}) {
  const { source, email, extraTags = [], extra = {} } = args;
  const baseTags = tagsForSource(source);
  const merged: Record<string, unknown> = {
    source,
    stage: stageForSource(source),
    tags: Array.from(new Set([...baseTags, ...extraTags])),
    ...(email ? { email } : {}),
    ...extra,
  };
  return syncToNocobase("lead.upsert", merged);
}
