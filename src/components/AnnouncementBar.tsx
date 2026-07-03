import { useEffect, useState } from "react";
import { Truck, ShieldCheck, Tag, Sparkles, X } from "lucide-react";

const STORAGE_KEY = "psa_announcement_dismissed_v2";

const messages = [
  { icon: Sparkles, text: "NEW: Build Your Own 5-Pack — pick any 5 peptides, save 20%. The only pick & mix in SA." },
  { icon: Tag, text: "🎁 Sign in to auto-apply 10% off your first order — code PEPTIDESA10" },
  { icon: Truck, text: "Free shipping across South Africa on orders over R1,500 — same-day dispatch from Cape Town" },
  { icon: ShieldCheck, text: "Every batch ≥99% HPLC tested · COA on every product · Independently lab tested" },
];

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  useEffect(() => {
    if (dismissed) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % messages.length), 4500);
    return () => clearInterval(id);
  }, [dismissed]);

  if (dismissed) return null;

  const M = messages[index];

  return (
    <div className="relative bg-hero-gradient text-primary-foreground">
      <div className="container flex min-h-[36px] items-center justify-center gap-2 px-4 py-1.5 text-center text-xs font-medium sm:text-sm">
        <M.icon className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="truncate">{M.text}</span>
      </div>
      <button
        onClick={() => {
          localStorage.setItem(STORAGE_KEY, "1");
          setDismissed(true);
        }}
        aria-label="Dismiss announcement"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
