import { useState } from "react";
import { ChevronUp } from "lucide-react";
import { formatZAR } from "@/lib/price";

interface Props {
  subtotal: number;
  specialOffer: number;
  shipping: number;
  freeShipping: boolean;
  total: number;
}

/**
 * Sticky single-line order summary for mobile checkout. Keeps subtotal,
 * discounts and the final total visible while the shopper scrolls.
 */
export default function MobileOrderSummaryBar({
  subtotal,
  specialOffer,
  shipping,
  freeShipping,
  total,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden" data-testid="mobile-order-summary">
      {open && (
        <div className="border-b border-border bg-card px-4 py-3 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="text-foreground">{formatZAR(subtotal)}</span>
          </div>
          {specialOffer > 0 && (
            <div className="mt-1 flex justify-between font-semibold text-destructive">
              <span>Special Offer</span>
              <span>−{formatZAR(specialOffer)}</span>
            </div>
          )}
          <div className="mt-1 flex justify-between text-muted-foreground">
            <span>Shipping</span>
            {freeShipping ? (
              <span className="font-semibold text-trust">Free</span>
            ) : (
              <span className="text-foreground">{formatZAR(shipping)}</span>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 bg-card px-4 py-2.5 text-left"
      >
        <span className="truncate text-xs text-muted-foreground">
          {formatZAR(subtotal)} subtotal
          {specialOffer > 0 && <> · −{formatZAR(specialOffer)} off</>}
          {freeShipping ? <> · free shipping</> : <> · +{formatZAR(shipping)} shipping</>}
        </span>
        <span className="flex shrink-0 items-center gap-1 font-display text-sm font-bold text-foreground">
          {formatZAR(total)}
          <ChevronUp className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "" : "rotate-180"}`} />
        </span>
      </button>
    </div>
  );
}
