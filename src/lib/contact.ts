// Single source of truth for the customer-support WhatsApp/Text Us contact.
export const SUPPORT_PHONE_E164 = "491624747159"; // no leading +
export const SUPPORT_AGENT_NAME = "Lutho";
export const SUPPORT_DEFAULT_MESSAGE = "Hi, I'd like to know about RTD Peptides";

export function buildWhatsAppUrl(message: string = SUPPORT_DEFAULT_MESSAGE): string {
  return `https://wa.me/${SUPPORT_PHONE_E164}?text=${encodeURIComponent(message)}`;
}
