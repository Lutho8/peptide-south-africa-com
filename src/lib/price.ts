// Display helpers. Product base prices are stored in EUR and converted to ZAR
// at display time (single-market site — ZAR only).
export function formatEUR(n: number): string {
  // Kept for legacy callers; renders as ZAR for consistency.
  return formatZAR(n);
}

export function formatZAR(n: number): string {
  return `R${n.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
