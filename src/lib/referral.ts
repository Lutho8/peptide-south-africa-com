import { supabase } from "@/integrations/supabase/client";

/**
 * Deterministic referral code from a user id: 8 uppercase alphanumeric chars.
 * Stable per user so the same code can be regenerated if missing.
 */
function codeFromUserId(uid: string): string {
  // Strip hyphens, take alphanumeric, uppercase, take first 8.
  const cleaned = uid.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return `RTT${cleaned.slice(0, 5)}`.slice(0, 8);
}

export interface ReferralCode {
  id: string;
  code: string;
  reward_zar: number;
  redemptions: number;
}

/** Get-or-create the current user's referral code. */
export async function ensureReferralCode(userId: string): Promise<ReferralCode | null> {
  const { data: existing } = await supabase
    .from("referral_codes")
    .select("id, code, reward_zar, redemptions")
    .eq("owner_user_id", userId)
    .maybeSingle();

  if (existing) return existing as ReferralCode;

  const code = codeFromUserId(userId);
  const { data: created, error } = await supabase
    .from("referral_codes")
    .insert({ owner_user_id: userId, code })
    .select("id, code, reward_zar, redemptions")
    .single();

  if (error) {
    console.error("[referral] insert failed", error);
    return null;
  }
  return created as ReferralCode;
}

/** Validate any referral code via the server-side lookup RPC. */
export async function lookupReferralCode(code: string) {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return null;
  const { data } = await supabase.rpc("lookup_referral_code", { _code: trimmed });
  const row = Array.isArray(data) ? data[0] : data;
  return (row as { id: string; reward_zar: number } | undefined) ?? null;
}

export function shareUrl(code: string, base = window.location.origin): string {
  return `${base}/?ref=${encodeURIComponent(code)}`;
}
