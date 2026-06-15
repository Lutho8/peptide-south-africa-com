import { Check, ShoppingCart, Truck, CreditCard } from "lucide-react";

type Step = "cart" | "details" | "pay" | "done";

interface Props {
  current: Step;
  className?: string;
}

const STEPS: { id: Step; label: string; icon: typeof ShoppingCart }[] = [
  { id: "cart", label: "Cart", icon: ShoppingCart },
  { id: "details", label: "Details", icon: Truck },
  { id: "pay", label: "Pay", icon: CreditCard },
];

/**
 * Mobile-first 3-step indicator. Sticks at the top of the checkout flow so
 * users always know what step they're on and how many remain.
 */
export default function CheckoutStepper({ current, className = "" }: Props) {
  const currentIdx = STEPS.findIndex((s) => s.id === current);

  return (
    <nav
      aria-label="Checkout progress"
      className={`sticky top-14 z-30 -mx-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:static sm:mx-0 sm:rounded-xl sm:border ${className}`}
    >
      <ol className="mx-auto flex max-w-xl items-center justify-between gap-1">
        {STEPS.map((step, i) => {
          const isDone = i < currentIdx || current === "done";
          const isActive = i === currentIdx;
          const Icon = step.icon;
          return (
            <li key={step.id} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                  isDone
                    ? "border-trust bg-trust text-trust-foreground"
                    : isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-glow"
                    : "border-border bg-card text-muted-foreground"
                }`}
                aria-current={isActive ? "step" : undefined}
              >
                {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <div className="hidden flex-col sm:flex">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Step {i + 1}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    isActive ? "text-foreground" : isDone ? "text-trust" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              <span
                className={`sm:hidden text-xs font-semibold ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-1 h-0.5 flex-1 rounded-full ${
                    i < currentIdx ? "bg-trust" : "bg-border"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
