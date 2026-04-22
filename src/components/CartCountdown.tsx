import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

const STORAGE_KEY = "rtt_cart_reserved_until";
const RESERVE_MINUTES = 10;

function getOrCreateDeadline(): number {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    const ts = parseInt(existing, 10);
    if (!isNaN(ts) && ts > Date.now()) return ts;
  }
  const next = Date.now() + RESERVE_MINUTES * 60 * 1000;
  localStorage.setItem(STORAGE_KEY, String(next));
  return next;
}

function format(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface Props {
  variant?: "compact" | "banner";
  className?: string;
}

export default function CartCountdown({ variant = "banner", className = "" }: Props) {
  const [deadline, setDeadline] = useState<number>(() => getOrCreateDeadline());
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      // auto-renew once expired so the urgency is persistent (most ecom does this)
      if (t >= deadline) {
        const next = t + RESERVE_MINUTES * 60 * 1000;
        localStorage.setItem(STORAGE_KEY, String(next));
        setDeadline(next);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  const remaining = deadline - now;

  if (variant === "compact") {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-semibold text-destructive ring-1 ring-destructive/20 ${className}`}>
        <Timer className="h-3 w-3" />
        Reserved {format(remaining)}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 ${className}`}>
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-destructive/10">
        <Timer className="h-3.5 w-3.5 text-destructive" />
      </div>
      <div className="flex-1 text-xs">
        <p className="font-semibold text-foreground">Your items are reserved</p>
        <p className="text-muted-foreground">
          Cart held for{" "}
          <span className="font-mono font-bold tabular-nums text-destructive">
            {format(remaining)}
          </span>
          {" "}— complete checkout to lock in stock & price
        </p>
      </div>
    </div>
  );
}
