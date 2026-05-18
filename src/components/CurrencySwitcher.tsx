import { useCurrency, type Currency } from "@/context/CurrencyContext";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const OPTIONS: { value: Currency; flag: string; label: string }[] = [
  { value: "EUR", flag: "🇪🇺", label: "EUR €" },
  { value: "ZAR", flag: "🇿🇦", label: "ZAR R" },
];

export default function CurrencySwitcher({ className = "" }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const current = OPTIONS.find((o) => o.value === currency)!;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Change currency"
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
      >
        <span aria-hidden>{current.flag}</span>
        <span>{current.label}</span>
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1.5 min-w-[8rem] overflow-hidden rounded-md border border-border bg-card shadow-lg">
          {OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                setCurrency(o.value);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-muted ${
                o.value === currency ? "text-primary" : "text-foreground"
              }`}
            >
              <span aria-hidden>{o.flag}</span>
              <span>{o.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
