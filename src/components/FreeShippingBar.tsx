import { Progress } from "@/components/ui/progress";
import { SHIPPING_RULES } from "@/lib/shipping";
import { formatZAR } from "@/lib/price";
import { cn } from "@/lib/utils";

interface Props {
  /** Cart subtotal in ZAR. */
  subtotalEur?: number; // legacy prop name — value is treated as ZAR now.
  subtotalZar?: number;
  /** Legacy prop — ignored. */
  country?: string;
  className?: string;
}

export default function FreeShippingBar({ subtotalEur, subtotalZar, className }: Props) {
  const rule = SHIPPING_RULES["South Africa"];
  const subtotal = subtotalZar ?? subtotalEur ?? 0;
  const remaining = Math.max(0, rule.freeOver - subtotal);
  const pct = Math.min(100, (subtotal / rule.freeOver) * 100);
  const unlocked = remaining <= 0;

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
              🛒 You're <span className="font-bold">{formatZAR(remaining)}</span> away from free shipping
            </>
          )}
        </span>
      </div>
      <Progress value={pct} className="h-2" />
      {!unlocked && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          Only {formatZAR(remaining)} to go for free delivery anywhere in South Africa.
        </p>
      )}
    </div>
  );
}
