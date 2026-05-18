import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Currency = "EUR" | "ZAR";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  /** Live EUR -> ZAR rate. Falls back to 19.40 if fetch fails. */
  rate: number;
  /** Convert an EUR amount into the current display currency (number, no formatting). */
  convert: (eur: number) => number;
  /** Format an EUR base amount for display. */
  format: (eur: number) => string;
  /** Returns { primary, secondary } — secondary is only set in ZAR mode (shows EUR ref). */
  display: (eur: number) => { primary: string; secondary?: string };
}

const FALLBACK_RATE = 19.40;
const STORAGE_KEY = "rtt_currency";
const RATE_CACHE_KEY = "rtt_fx_rate";
const RATE_TTL_MS = 60 * 60 * 1000; // 1h

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

function formatEUR(n: number): string {
  return `€${n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function formatZAR(n: number): string {
  return `R${n.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    if (typeof window === "undefined") return "EUR";
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "ZAR" ? "ZAR" : "EUR";
  });
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

  // Fetch live rate (cached 1h).
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

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem(STORAGE_KEY, c);
  };

  const value = useMemo<CurrencyContextType>(() => {
    const convert = (eur: number) => (currency === "EUR" ? eur : eur * rate);
    const format = (eur: number) =>
      currency === "EUR" ? formatEUR(eur) : formatZAR(eur * rate);
    const display = (eur: number) => {
      if (currency === "EUR") return { primary: formatEUR(eur) };
      return { primary: formatZAR(eur * rate), secondary: `≈ ${formatEUR(eur)}` };
    };
    return { currency, setCurrency, rate, convert, format, display };
  }, [currency, rate]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
