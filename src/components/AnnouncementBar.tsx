import { useEffect, useState } from "react";
import { Truck, ShieldCheck, X } from "lucide-react";

const STORAGE_KEY = "psa_announcement_dismissed_v3";

const messages = [
  {
    icon: Truck,
    text: "Free shipping across South Africa on orders over R1,500 — same-day dispatch from Cape Town",
  },
  {
    icon: ShieldCheck,
    text: "Every batch ≥99% HPLC tested · COA on every product · Independently lab tested",
  },
];

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  useEffect(() => {
    if (messages.length < 2) return;
    const timer = setInterval(() => setIdx((current) => (current + 1) % messages.length), 5200);
    return () => clearInterval(timer);
  }, []);

  if (dismissed) return null;

  const message = messages[idx];
  const Icon = message.icon;

  return (
    <div className="relative z-[60] bg-hero-gradient px-10 py-2 text-center text-xs font-semibold text-primary-foreground sm:text-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-center gap-2">
        <Icon className="h-4 w-4 shrink-0" aria-hidden />
        <span>{message.text}</span>
      </div>
      <button
        type="button"
        onClick={() => {
          localStorage.setItem(STORAGE_KEY, "true");
          setDismissed(true);
        }}
        aria-label="Dismiss announcement"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 transition-colors hover:bg-white/15"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
