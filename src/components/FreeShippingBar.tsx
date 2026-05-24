import { Progress } from "@/components/ui/progress";
import { useCurrency } from "@/context/CurrencyContext";
import { SHIPPING_RULES } from "@/lib/shipping";
import { cn } from "@/lib/utils";

interface Props {
  /** Cart subtotal in EUR (canonical, internal base). */
  subtotalEur: number;
  className?: string;
}

export default function FreeShippingBar({ subtotalEur, className }: Props) {
  const { format, rate } = useCurrency();
  const rule = SHIPPING_RULES["South Africa"];

  const destSubtotal = subtotalEur * rate; // ZAR
  const remainingDest = Math.max(0, rule.freeOver - destSubtotal);
  const pct = Math.min(100, (destSubtotal / rule.freeOver) * 100);
  const remainingEurEquivalent = remainingDest / rate;
  const unlocked = remainingDest <= 0;

  return (
    <div
      className={cn("rounded-lg border border-border bg-card p-4", className)}
      data-testid="free-shipping-bar"
    >
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-foreground">
          🇿🇦{" "}
          {unlocked ? (
            <span className="text-trust">✅ You've unlocked free shipping!</span>
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
          Only {format(remainingEurEquivalent)} to go for free delivery anywhere in South Africa.
        </p>
      )}
    </div>
  );
}
