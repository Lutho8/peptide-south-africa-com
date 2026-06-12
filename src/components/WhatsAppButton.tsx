import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/contact";

export default function WhatsAppButton() {
  return (
    <a
      href={buildWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Text us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-hero-gradient px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-105 active:scale-95"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">Text us</span>
    </a>
  );
}
