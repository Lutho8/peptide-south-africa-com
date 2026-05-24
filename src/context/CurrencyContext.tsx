import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

// Single-currency site: ZAR. EUR is no longer offered. The provider keeps the
// existing API so product/cart code that calls `format` / `display` / `convert`
// keeps working without changes.

export type Currency = "ZAR";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  /** Live EUR -> ZAR rate; product prices are still stored EUR-base internally. */
  rate: number;
  /** Convert an EUR base amount into ZAR (number, no formatting). */
  convert: (eur: number) => number;
  /** Format an EUR base amount as ZAR. */
  format: (eur: number) => string;
  /** Returns { primary } — secondary is intentionally unused now. */
  display: (eur: number) => { primary: string; secondary?: string };
}

const FALLBACK_RATE = 19.40;
const RATE_CACHE_KEY = "rtt_fx_rate";
const RATE_TTL_MS = 60 * 60 * 1000;

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

function formatZAR(n: number): string {
  return `R${n.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [rate, setRate] = useState<number>(() => {
    if (typeof window === "undefined") return FALLBACK_RATE;
    try {
      const raw = localStorage.getItem(RATE_CACHE_KEY);
      if (!raw) return FALLBACK_RATE;
      const { rate, fetchedAt } = JSON.parse(raw) as { rate: number; fetchedAt: number };
      if (Date.now() - fetchedAt > RATE_TTL_MS) return FALLBACK_RATE;
      return typeof rate === "number" && rate > 0 ? rate : FALLBACK_RATE;
    } catch {
      return FALLBACK_RATE;
    }
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RATE_CACHE_KEY);
      if (raw) {
        const { fetchedAt } = JSON.parse(raw);
        if (Date.now() - fetchedAt < RATE_TTL_MS) return;
      }
    } catch {
      /* ignore */
    }
    fetch("https://api.exchangerate-api.com/v4/latest/EUR")
      .then((r) => r.json())
      .then((data) => {
        const zar = data?.rates?.ZAR;
        if (typeof zar === "number" && zar > 0) {
          setRate(zar);
          localStorage.setItem(RATE_CACHE_KEY, JSON.stringify({ rate: zar, fetchedAt: Date.now() }));
        }
      })
      .catch(() => {
        /* keep fallback */
      });
  }, []);

  const value = useMemo<CurrencyContextType>(() => {
    const convert = (eur: number) => eur * rate;
    const format = (eur: number) => formatZAR(eur * rate);
    const display = (eur: number) => ({ primary: formatZAR(eur * rate) });
    return {
      currency: "ZAR" as const,
      setCurrency: () => {},
      rate,
      convert,
      format,
      display,
    };
  }, [rate]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
