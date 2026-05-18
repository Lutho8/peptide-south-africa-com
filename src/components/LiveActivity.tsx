import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

const events = [
  { name: "Sarah", city: "Cape Town", item: "BPC-157 Recovery Kit", ago: "2 minutes ago" },
  { name: "Lukas", city: "Berlin", item: "Retatrutide Fat Loss Protocol", ago: "4 minutes ago" },
  { name: "Michael", city: "Johannesburg", item: "Tirzepatide Starter Kit", ago: "6 minutes ago" },
  { name: "Anja", city: "München", item: "GHK-Cu Skin Stack", ago: "9 minutes ago" },
  { name: "Thandi", city: "Durban", item: "TB-500 + BPC-157 Bundle", ago: "12 minutes ago" },
  { name: "Jonas", city: "Hamburg", item: "Tesamorelin Longevity Stack", ago: "15 minutes ago" },
  { name: "Lerato", city: "Pretoria", item: "Epitalon Anti-Aging Kit", ago: "18 minutes ago" },
  { name: "Sophie", city: "Köln", item: "BPC-157 Recovery Kit", ago: "22 minutes ago" },
];

export default function LiveActivity() {
  const [index, setIndex] = useState(-1);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (closed) return;
    // first toast appears after 8s
    const first = setTimeout(() => setIndex(0), 8000);
    return () => clearTimeout(first);
  }, [closed]);

  useEffect(() => {
    if (closed || index < 0) return;
    // each toast visible 6s, gap 8s → cycle 14s
    const id = setTimeout(() => setIndex((i) => (i + 1) % events.length), 14000);
    return () => clearTimeout(id);
  }, [index, closed]);

  if (closed || index < 0) return null;

  // alternate visibility — show for 6s, hide for 8s within the 14s cycle
  const e = events[index];

  return (
    <div
      key={index}
      className="fixed bottom-20 left-3 z-40 hidden w-[300px] animate-in fade-in slide-in-from-bottom-4 sm:block md:bottom-5"
    >
      <div className="relative flex items-start gap-2.5 rounded-xl border border-border bg-card p-3 pr-7 shadow-card-hover">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-trust/10">
          <CheckCircle2 className="h-4 w-4 text-trust" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground">
            {e.name} from {e.city}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            ordered {e.item}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground/70">{e.ago} · verified</p>
        </div>
        <button
          onClick={() => setClosed(true)}
          aria-label="Dismiss"
          className="absolute right-1.5 top-1.5 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
