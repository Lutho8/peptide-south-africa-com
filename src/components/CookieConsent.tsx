import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

const STORAGE_KEY = "psa-cookie-consent";
const LEGACY_KEY = "rtt-cookie-consent";

function readInitialDecision(): boolean {
  if (typeof window === "undefined") return true; // SSR/no-window: treat as decided
  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy && !localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, legacy);
    }
    if (legacy) localStorage.removeItem(LEGACY_KEY);
    return !!localStorage.getItem(STORAGE_KEY);
  } catch {
    return true;
  }
}

export default function CookieConsent() {
  // Synchronous init avoids the post-mount flash that can shift perceived layout.
  const [decided, setDecided] = useState<boolean>(() => readInitialDecision());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (decided) return;
    // Tiny delay so the banner doesn't compete with first paint, but never blocks layout
    // (the wrapper is position:fixed and reserves no flow space).
    const t = setTimeout(() => setMounted(true), 800);
    return () => clearTimeout(t);
  }, [decided]);

  const accept = () => {
    try { localStorage.setItem(STORAGE_KEY, "accepted"); } catch { /* noop */ }
    setDecided(true);
  };
  const decline = () => {
    try { localStorage.setItem(STORAGE_KEY, "declined"); } catch { /* noop */ }
    setDecided(true);
  };

  if (decided || !mounted) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      className="fixed bottom-3 left-3 z-[60] max-w-[320px] rounded-full border border-border bg-card/95 px-3 py-1.5 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/85"
    >
      <div className="flex items-center gap-2">
        <p className="flex-1 text-[11px] leading-tight text-muted-foreground">
          We use cookies.{" "}
          <Link to="/privacy" className="text-foreground underline underline-offset-2 hover:text-primary">
            Privacy
          </Link>
        </p>
        <button
          onClick={accept}
          className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground hover:opacity-90"
        >
          OK
        </button>
        <button
          onClick={decline}
          aria-label="Decline cookies"
          className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
