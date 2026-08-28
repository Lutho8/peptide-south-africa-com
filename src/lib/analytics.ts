import { supabase } from "@/integrations/supabase/client";
import { PRICING } from "../../supabase/functions/_shared/pricing";

export type WeightLossOfferKey = keyof typeof PRICING.programOffers;

type OfferProps = {
  offer_id: string;
  displayed_price_zar: number;
  server_confirmed_amount_zar?: number;
};

export type AnalyticsEvent =
  | { event: "book_consult_clicked" | "consultation_started" | "consultation_qualified" | "program_selected"; props: OfferProps }
  | { event: "checkout_started"; props: { displayed_price_zar: number; item_count: number; offer_id?: string } }
  | { event: "eft_instructions_shown"; props: { order_id: string; server_confirmed_amount_zar: number; displayed_price_zar?: number; offer_id?: string } };

const SESSION_KEY = "psa_analytics_sid";
const OFFER_KEY = "psa_selected_offer";

function sessionId(): string {
  try {
    let id = window.sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
      window.sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "unknown";
  }
}

export function offerProps(key: WeightLossOfferKey): OfferProps {
  const offer = PRICING.programOffers[key];
  return { offer_id: offer.offerId, displayed_price_zar: offer.amount };
}

export function rememberOffer(key: WeightLossOfferKey): OfferProps {
  const props = offerProps(key);
  try { window.sessionStorage.setItem(OFFER_KEY, JSON.stringify(props)); } catch { /* optional */ }
  return props;
}

export function currentOffer(): OfferProps | null {
  try {
    const raw = window.sessionStorage.getItem(OFFER_KEY);
    return raw ? JSON.parse(raw) as OfferProps : null;
  } catch {
    return null;
  }
}

export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window === "undefined" || import.meta.env.MODE === "test") return;
  void (async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const table = (supabase as unknown as { from: (name: string) => { insert: (row: unknown) => Promise<unknown> } }).from("analytics_events");
      await table.insert({
        event: event.event,
        session_id: sessionId(),
        user_id: data.session?.user.id ?? null,
        props: event.props,
      });
    } catch {
      // Analytics must never block the customer journey.
    }
  })();
}
