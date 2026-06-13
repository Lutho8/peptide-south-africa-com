// Display helpers (ZAR only — single-market site).
export function formatZAR(n: number): string {
  return `R${n.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Legacy alias kept so older callers compile. Renders as ZAR.
export const formatEUR = formatZAR;
