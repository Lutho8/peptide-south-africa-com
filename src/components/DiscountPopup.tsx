import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { X, Gift, LineChart, CalendarCheck, ExternalLink } from "lucide-react";

const POPUP_DISMISSED_KEY = "psa_tracker_popup_dismissed_v1";
const TRACKER_URL = "https://peptide-south-africa.co.za/";

export default function DiscountPopup() {
  const [show, setShow] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const suppressed = [
      "/checkout",
      "/cart",
      "/account",
      "/auth",
      "/quiz",
      "/blog",
      "/research",
      "/editorial-policy",
    ].some((path) =>
      location.pathname.startsWith(path),
    );
    if (suppressed || localStorage.getItem(POPUP_DISMISSED_KEY)) {
      setShow(false);
      return;
    }

    const timer = window.setTimeout(() => setShow(true), 7000);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  if (!show) return null;

  const dismiss = () => {
    localStorage.setItem(POPUP_DISMISSED_KEY, "true");
    setShow(false);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-7 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close tracker offer"
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Gift className="h-7 w-7 text-primary" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Included free</p>
          <h3 className="mt-2 font-display text-2xl font-bold text-foreground">
            You’ve unlocked the Peptide Tracker
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Keep your routine, notes and progress in one simple mobile-friendly place.
          </p>
        </div>

        <div className="mt-5 grid gap-2.5">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 text-sm text-foreground">
            <CalendarCheck className="h-5 w-5 shrink-0 text-primary" />
            Plan and record your routine
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 text-sm text-foreground">
            <LineChart className="h-5 w-5 shrink-0 text-primary" />
            See your progress over time
          </div>
        </div>

        <a
          href={TRACKER_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={dismiss}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-hero-gradient py-3.5 font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-95"
        >
          Open My Free Tracker <ExternalLink className="h-4 w-4" />
        </a>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          No discount code needed · Free digital bonus
        </p>
      </div>
    </div>
  );
}
