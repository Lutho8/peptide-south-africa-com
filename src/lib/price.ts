// Display helpers for the EUR-base / ZAR-toggle pricing system.
// Canonical product prices are stored in EUR. ZAR is computed at display time.
export function formatEUR(n: number): string {
  return `€${n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatZAR(n: number): string {
  return `R${n.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
