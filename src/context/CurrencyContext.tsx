import { createContext, useContext, type ReactNode } from "react";

// Single-currency site: ZAR. All product prices are stored in ZAR.
// The provider keeps the original API surface so legacy callers compile.

export type Currency = "ZAR";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  /** Always 1 — kept for API compatibility. */
  rate: number;
  /** Identity — input is already ZAR. */
  convert: (zar: number) => number;
  /** Format a ZAR amount as "Rxxx.xx". */
  format: (zar: number) => string;
  display: (zar: number) => { primary: string; secondary?: string };
}

function formatZAR(n: number): string {
  return `R${n.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const value: CurrencyContextType = {
  currency: "ZAR",
  setCurrency: () => {},
  rate: 1,
  convert: (zar) => zar,
  format: (zar) => formatZAR(zar),
  display: (zar) => ({ primary: formatZAR(zar) }),
};

const CurrencyContext = createContext<CurrencyContextType>(value);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
