import { Progress } from "@/components/ui/progress";
import { useCurrency } from "@/context/CurrencyContext";
import { SHIPPING_RULES } from "@/lib/shipping";
import { cn } from "@/lib/utils";

interface Props {
  /** Cart subtotal in EUR (canonical). */
  subtotalEur: number;
  className?: string;
}

/**
 * Cart-page progress bar showing how close the user is to free shipping in
 * their currently selected display currency / market.
 */
export default function FreeShippingBar({ subtotalEur, className }: Props) {
  const { currency, format, rate } = useCurrency();
  const country = currency === "ZAR" ? "South Africa" : "Germany";
  const rule = SHIPPING_RULES[country];

  const destSubtotal = currency === "EUR" ? subtotalEur : subtotalEur * rate;
  const remainingDest = Math.max(0, rule.freeOver - destSubtotal);
  const pct = Math.min(100, (destSubtotal / rule.freeOver) * 100);
  // Convert remaining (destination currency) back into EUR so format() can render in
  // whichever currency the user is viewing.
  const remainingEurEquivalent = currency === "EUR" ? remainingDest : remainingDest / rate;
  const unlocked = remainingDest <= 0;

  const flag = country === "South Africa" ? "🇿🇦" : "🇩🇪";

  return (
    <div className={cn("rounded-lg border border-border bg-card p-4", className)}>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-foreground">
          {flag}{" "}
          {unlocked ? (
            <span className="text-trust">✅ You've unlocked free shipping! · Gratis Versand freigeschaltet!</span>
          ) : (
            <>
              🛒 You're <span className="font-bold">{format(remainingEurEquivalent)}</span> away from free shipping
            </>
          )}
        </span>
      </div>
      <Progress value={pct} className="h-2" />
      {!unlocked && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          Nur noch {format(remainingEurEquivalent)} bis zum kostenlosen Versand · Nog {format(remainingEurEquivalent)} tot gratis versending
        </p>
      )}
    </div>
  );
}
