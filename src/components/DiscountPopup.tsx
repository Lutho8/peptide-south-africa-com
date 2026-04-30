import { useState, useEffect } from "react";
import { X, Gift } from "lucide-react";
import { captureLead } from "@/lib/nocobase";

const POPUP_DISMISSED_KEY = "rtt_discount_dismissed";

export default function DiscountPopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(POPUP_DISMISSED_KEY)) return;
    const timer = setTimeout(() => setShow(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  const handleClose = () => {
    localStorage.setItem(POPUP_DISMISSED_KEY, "true");
    setShow(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      captureLead({ source: "discount_popup", email });
      setSubmitted(true);
      localStorage.setItem(POPUP_DISMISSED_KEY, "true");
      setTimeout(() => setShow(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        {submitted ? (
          <div className="text-center py-4">
            <Gift className="mx-auto h-12 w-12 text-primary" />
            <h3 className="mt-4 font-display text-xl font-bold text-foreground">Welcome aboard! 🎉</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Use code <span className="font-bold text-primary">RIDETHETIDE10</span> at checkout for 10% off your first order.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Gift className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">Get 10% Off Your First Order</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Join our newsletter and receive an exclusive discount code instantly.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-hero-gradient py-3 font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-95"
              >
                Claim My 10% Off
              </button>
            </form>
            <p className="mt-3 text-center text-xs text-muted-foreground">No spam, ever. Unsubscribe anytime.</p>
          </>
        )}
      </div>
    </div>
  );
}
