// Single source of truth for the customer-support WhatsApp/Text Us contact.
export const SUPPORT_PHONE_E164 = "491624747159"; // no leading +
export const SUPPORT_AGENT_NAME = "Lutho";
export const SUPPORT_DEFAULT_MESSAGE = "Hi, I'd like to know about Peptide South Africa";

// Peptide Tracker — external companion app (intentional cross-brand URL).
export const TRACKER_URL = "https://ridethetide.info";

export function buildWhatsAppUrl(message: string = SUPPORT_DEFAULT_MESSAGE): string {
  return `https://wa.me/${SUPPORT_PHONE_E164}?text=${encodeURIComponent(message)}`;
}
