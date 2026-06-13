import { useState, useEffect } from "react";
import { Shield } from "lucide-react";

const AGE_VERIFIED_KEY = "rtt_age_verified";

export default function AgeVerificationModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(AGE_VERIFIED_KEY)) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  const handleConfirm = () => {
    localStorage.setItem(AGE_VERIFIED_KEY, "true");
    setShow(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/60 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-2xl text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">Age Verification</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          You must be 18 years or older to access this website. Our products are strictly for research purposes only — not for human consumption. By entering, you confirm you are 18 or older under South African law.
        </p>
        <p className="mt-2 text-xs italic text-muted-foreground">
          Sie müssen 18 Jahre oder älter sein. Nur für Forschungszwecke. · Jy moet 18+ wees. Slegs vir navorsing.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleConfirm}
            className="w-full rounded-lg bg-hero-gradient py-3.5 font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-95"
          >
            I am 18 or older — Enter
          </button>
          <a
            href="https://www.google.com"
            className="w-full rounded-lg border border-border py-3.5 font-semibold text-muted-foreground transition-all hover:bg-muted"
          >
            I am under 18 — Leave
          </a>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          For research purposes only. Not for human use.
        </p>
      </div>
    </div>
  );
}
