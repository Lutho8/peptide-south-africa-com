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
  | { event: "eft_instructions_shown"; props: { order_id: string; server_confirmed_amount_zar: number; displayed_price_zar?: number; offer_id?: string } }
  | { event: "portal_viewed"; props: { order_count: number; latest_stage: string } }
  | { event: "portal_orders_viewed"; props: { order_count: number } }
  | { event: "portal_tracker_opened"; props: { placement: "portal" | "storefront" } }
  | { event: "portal_coa_opened"; props: { placement: "portal" | "order" } }
  | { event: "reorder_started"; props: { order_id: string; item_count: number } };

const SESSION_KEY = "psa_analytics_sid";
const OFFER_KEY = "psa_selected_offer";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

/** Meta standard-event mapping. Unlisted events fire as trackCustom so they
 * still show up in Events Manager without polluting Meta's standard-event set.
 * Purchase is deliberately absent: EFT instructions being shown is not
 * confirmed revenue, so `eft_instructions_shown` fires as a custom event
 * instead (see metaPixelProps) and is never relayed to Meta with a value. The
 * only code path allowed to emit Purchase is the EFT payment-confirmation
 * step (supabase/functions/eft-reconcile), once a bank deposit settles. */
const META_STANDARD_EVENT: Partial<Record<AnalyticsEvent["event"], string>> = {
  book_consult_clicked: "Lead",
  checkout_started: "InitiateCheckout",
};

let pixelInitAttempted = false;

/**
 * Injects the Meta Pixel base code, gated on VITE_META_PIXEL_ID being set.
 * No-ops (and never throws) when the env var is absent, so this is safe to
 * ship ahead of Business Manager access — flipping the env var is all that's
 * needed to activate it later.
 */
export function initMetaPixel(): void {
  if (pixelInitAttempted) return;
  pixelInitAttempted = true;
  const pixelId = import.meta.env.VITE_META_PIXEL_ID;
  if (!pixelId || typeof window === "undefined") return;
  try {
    if (window.fbq) return;
    const fbq = function (...args: unknown[]) {
      const q = (fbq as unknown as { queue: unknown[][] }).queue;
      q.push(args);
    } as unknown as Window["fbq"] & { queue: unknown[][]; loaded: boolean; version: string; push: Window["fbq"] };
    fbq!.queue = [];
    fbq!.loaded = true;
    fbq!.version = "2.0";
    fbq!.push = fbq!;
    window.fbq = fbq;
    window._fbq = fbq;
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
    window.fbq("init", pixelId);
    window.fbq("track", "PageView");
  } catch {
    // Pixel bootstrap must never break the app.
  }
}

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

function metaEventId(): string {
  return typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function readCookie(name: string): string | undefined {
  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : undefined;
  } catch {
    return undefined;
  }
}

/** Server-side Conversions API coverage for browser-only standard events
 * (Lead, InitiateCheckout only — /api/meta-capi rejects anything else,
 * including Purchase, which only fires from EFT reconciliation). */
async function sendCapiRelay(eventName: string, eventId: string, customData: Record<string, unknown>): Promise<void> {
  try {
    const { data } = await supabase.auth.getSession();
    await fetch("/api/meta-capi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        eventName,
        eventId,
        eventSourceUrl: window.location.href,
        email: data.session?.user.email,
        fbp: readCookie("_fbp"),
        fbc: readCookie("_fbc"),
        customData,
      }),
    });
  } catch {
    // Conversions API relay must never interrupt the customer journey.
  }
}

function metaPixelProps(event: AnalyticsEvent): Record<string, unknown> {
  switch (event.event) {
    case "checkout_started":
      return { value: event.props.displayed_price_zar, currency: "ZAR", content_ids: event.props.offer_id ? [event.props.offer_id] : undefined, num_items: event.props.item_count };
    case "eft_instructions_shown":
      // No value/currency: EFT instructions being shown is not confirmed
      // revenue. Purchase fires separately once the bank deposit settles.
      return { content_ids: event.props.offer_id ? [event.props.offer_id] : undefined };
    case "book_consult_clicked":
      return { value: event.props.displayed_price_zar, currency: "ZAR", content_ids: [event.props.offer_id] };
    default:
      return event.props as Record<string, unknown>;
  }
}

export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window === "undefined" || import.meta.env.MODE === "test") return;
  const standardEvent = META_STANDARD_EVENT[event.event];
  const eventId = standardEvent ? metaEventId() : undefined;
  try {
    if (window.fbq) {
      const props = metaPixelProps(event);
      if (standardEvent) window.fbq("track", standardEvent, props, eventId ? { eventID: eventId } : undefined);
      else window.fbq("trackCustom", event.event, props);
    }
  } catch {
    // Pixel measurement must never interrupt the customer journey.
  }
  // Only Lead/InitiateCheckout are relayed through this browser-fired path —
  // /api/meta-capi rejects everything else, including Purchase.
  if (standardEvent && eventId) {
    void sendCapiRelay(standardEvent, eventId, metaPixelProps(event));
  }
  void (async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const table = (supabase as unknown as { from: (name: string) => { insert: (row: unknown) => Promise<unknown> } }).from("analytics_events");
      await table.insert({
        event: event.event,
        event_version: "1.0",
        source: "storefront",
        session_id: sessionId(),
        user_id: data.session?.user.id ?? null,
        order_id: "order_id" in event.props ? event.props.order_id : null,
        props: event.props,
      });
    } catch {
      // Analytics must never block the customer journey.
    }
  })();
}
