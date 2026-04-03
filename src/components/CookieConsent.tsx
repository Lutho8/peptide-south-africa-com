import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("rtt-cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("rtt-cookie-consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("rtt-cookie-consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-4 md:p-6">
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-5 shadow-lg sm:p-6">
        <div className="flex items-start gap-4">
          <div className="hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 sm:flex">
            <Cookie className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-sm font-semibold text-foreground sm:text-base">
              We Value Your Privacy
            </h3>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. Read our{" "}
              <Link to="/privacy" className="text-primary underline hover:no-underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link to="/terms" className="text-primary underline hover:no-underline">
                Terms & Conditions
              </Link>
              .
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={accept}
                className="rounded-lg bg-hero-gradient px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-95"
              >
                Accept All
              </button>
              <button
                onClick={decline}
                className="rounded-lg border border-border px-5 py-2 text-sm font-semibold text-foreground transition-all hover:bg-muted active:scale-95"
              >
                Decline
              </button>
              <Link
                to="/privacy"
                className="rounded-lg px-5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Cookie Settings
              </Link>
            </div>
          </div>
          <button onClick={decline} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
