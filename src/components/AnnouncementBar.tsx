import { useEffect, useState } from "react";
import { Truck, ShieldCheck, Tag, X } from "lucide-react";

const STORAGE_KEY = "rtt_announcement_dismissed_v1";

const messages = [
  { icon: Tag, text: "First order? Use code RIDETHETIDE10 for 10% off" },
  { icon: Truck, text: "Free shipping on orders over R1,500 · 1–3 day SA dispatch" },
  { icon: ShieldCheck, text: "Every batch ≥99% HPLC tested · COA on every product" },
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
