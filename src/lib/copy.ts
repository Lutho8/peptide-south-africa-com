/**
 * Trilingual micro-copy for dual-market (ZA + DE/EU) surfaces.
 * EN is canonical; DE shown alongside EN on EU-facing strips,
 * AF shown alongside EN on SA-facing strips. No language switcher
 * (yet) — these are rendered as side-by-side bilingual labels.
 */
export type Locale = "en" | "de" | "af";

type CopyKey =
  | "shipping_free"
  | "shipping_sa_window"
  | "shipping_eu_window"
  | "lab_tested"
  | "purity_99"
  | "discreet_packaging"
  | "secure_checkout"
  | "age_gate_body"
  | "pay_now"
  | "payment_unavailable"
  | "thank_you"
  | "cancelled";

export const COPY: Record<CopyKey, Record<Locale, string>> = {
  shipping_free: {
    en: "Free shipping: South Africa over R1,500 · Germany / EU over €75",
    de: "Kostenloser Versand: Südafrika ab R1.500 · Deutschland / EU ab 75 €",
    af: "Gratis versending: Suid-Afrika oor R1 500 · Duitsland / EU oor €75",
  },
  shipping_sa_window: {
    en: "1–3 business days across South Africa",
    de: "1–3 Werktage innerhalb Südafrikas",
    af: "1–3 werksdae binne Suid-Afrika",
  },
  shipping_eu_window: {
    en: "4–7 business days to Germany & the EU",
    de: "4–7 Werktage nach Deutschland & in die EU",
    af: "4–7 werksdae na Duitsland en die EU",
  },
  lab_tested: {
    en: "Independently lab tested",
    de: "Unabhängig laborgeprüft",
    af: "Onafhanklik laboratorium-getoets",
  },
  purity_99: {
    en: "≥99% HPLC purity · COA on every batch",
    de: "≥99 % HPLC-Reinheit · CoA bei jeder Charge",
    af: "≥99% HPLC-suiwerheid · COA by elke bondel",
  },
  discreet_packaging: {
    en: "Discreet, unbranded packaging",
    de: "Diskrete, neutrale Verpackung",
    af: "Diskrete, ongemerkte verpakking",
  },
  secure_checkout: {
    en: "Secure checkout via NowPayments",
    de: "Sicherer Checkout über NowPayments",
    af: "Veilige betaling via NowPayments",
  },
  age_gate_body: {
    en: "You must be 18+ to enter. Research use only — not for human consumption. South Africa: 18+ · Deutschland: 18+.",
    de: "Sie müssen 18 Jahre oder älter sein. Nur für Forschungszwecke — nicht zum menschlichen Gebrauch. Südafrika: 18+ · Deutschland: 18+.",
    af: "Jy moet 18+ wees. Slegs vir navorsingsdoeleindes — nie vir menslike gebruik nie. Suid-Afrika: 18+ · Duitsland: 18+.",
  },
  pay_now: {
    en: "Pay Now",
    de: "Jetzt bezahlen",
    af: "Betaal nou",
  },
  payment_unavailable: {
    en: "Payments come online once our NowPayments verification completes. Please try again shortly.",
    de: "Zahlungen sind verfügbar, sobald die NowPayments-Verifizierung abgeschlossen ist. Bitte versuchen Sie es in Kürze erneut.",
    af: "Betalings gaan beskikbaar wees sodra ons NowPayments-verifikasie voltooi is. Probeer asseblief binnekort weer.",
  },
  thank_you: {
    en: "Thank you — your order is being prepared.",
    de: "Vielen Dank — Ihre Bestellung wird vorbereitet.",
    af: "Dankie — jou bestelling word voorberei.",
  },
  cancelled: {
    en: "No charge was made. Your cart is still saved.",
    de: "Es wurde nichts abgebucht. Ihr Warenkorb ist gespeichert.",
    af: "Geen koste is gehef nie. Jou mandjie is steeds gestoor.",
  },
};

/** Render an EN / DE / AF trio joined by a separator — useful for trust strips. */
export function trilingual(key: CopyKey, sep = " · "): string {
  const { en, de, af } = COPY[key];
  return [en, de, af].join(sep);
}

/** Render an EN / DE pair (EU-facing). */
export function bilingualDE(key: CopyKey, sep = " · "): string {
  return `${COPY[key].en}${sep}${COPY[key].de}`;
}

/** Render an EN / AF pair (SA-facing). */
export function bilingualAF(key: CopyKey, sep = " · "): string {
  return `${COPY[key].en}${sep}${COPY[key].af}`;
}
