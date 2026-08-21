import { MessageCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import { buildWhatsAppUrl } from "@/lib/contact";

export default function WhatsAppButton() {
  const { pathname } = useLocation();
  const aboveMobilePurchaseBar = pathname.startsWith("/product/") || pathname === "/quiz";

  return (
    <a
      href={buildWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Text us on WhatsApp"
      className={`fixed right-6 z-50 inline-flex items-center gap-2 rounded-full bg-hero-gradient px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-105 active:scale-95 ${
        aboveMobilePurchaseBar ? "bottom-24 md:bottom-6" : "bottom-6"
      }`}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">Text us</span>
    </a>
  );
}
