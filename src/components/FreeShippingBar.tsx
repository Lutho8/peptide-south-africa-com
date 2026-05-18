import { Progress } from "@/components/ui/progress";
import { useCurrency } from "@/context/CurrencyContext";
import { SHIPPING_RULES, type ShippingCountry } from "@/lib/shipping";
import { cn } from "@/lib/utils";

interface Props {
  /** Cart subtotal in EUR (canonical). */
  subtotalEur: number;
  /** Override which market's threshold to show (defaults to currency-derived country). */
  country?: ShippingCountry;
  className?: string;
}

/**
 * Progress bar showing how close the cart is to free shipping in the
 * selected market's destination currency.
 */
export default function FreeShippingBar({ subtotalEur, country: countryProp, className }: Props) {
  const { currency, format, rate } = useCurrency();
  const country: ShippingCountry = countryProp ?? (currency === "ZAR" ? "South Africa" : "Germany");
  const rule = SHIPPING_RULES[country];

  // Convert EUR subtotal into the market's destination currency.
  const destSubtotal = rule.currency === "EUR" ? subtotalEur : subtotalEur * rate;
  const remainingDest = Math.max(0, rule.freeOver - destSubtotal);
  const pct = Math.min(100, (destSubtotal / rule.freeOver) * 100);
  // For display in the user's selected currency.
  const remainingEurEquivalent = rule.currency === "EUR" ? remainingDest : remainingDest / rate;
  const unlocked = remainingDest <= 0;

  const flag = country === "South Africa" ? "🇿🇦" : "🇩🇪";

  return (
    <div
      className={cn("rounded-lg border border-border bg-card p-4", className)}
      data-testid="free-shipping-bar"
    >
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
