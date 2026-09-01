import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface Props {
  /** Called right before we navigate away (e.g. close the cart drawer). */
  onNavigate?: () => void;
  className?: string;
}

/**
 * Checkout hand-off. Research-use acknowledgements are intentionally completed
 * on every order, so the cart never bypasses the versioned consent screen.
 */
export default function ExpressEftButton({ onNavigate, className = "" }: Props) {
  const { items } = useCart();
  const navigate = useNavigate();

  const go = () => {
    if (items.length === 0) return;
    onNavigate?.();
    navigate("/checkout");
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={go}
        data-testid="express-checkout-button"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-foreground py-4 text-base font-bold uppercase tracking-wide text-background transition-opacity hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        Continue to checkout <ArrowRight className="h-4 w-4" />
      </button>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        Delivery details · research acknowledgement · EFT payment
      </p>
    </div>
  );
}
