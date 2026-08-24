import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Zap } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  EFT_SESSION_KEY,
  hasCompleteCheckoutDetails,
  loadSavedCheckoutForm,
  paymentErrorMessage,
  startEftCheckout,
} from "@/lib/eftCheckout";

interface Props {
  /** Called right before we navigate away (e.g. close the cart drawer). */
  onNavigate?: () => void;
  className?: string;
}

/**
 * One-tap fast lane: creates the order and takes the shopper straight to the
 * EFT bank-details + unique-reference page. Falls back to the normal checkout
 * form when we don't have complete details on file.
 */
export default function ExpressEftButton({ onNavigate, className = "" }: Props) {
  const { items, totalPrice, clearCart } = useCart();
  const { user, refreshOrders } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const go = async () => {
    if (items.length === 0) return;
    const saved = loadSavedCheckoutForm();

    if (!user || !hasCompleteCheckoutDetails(saved)) {
      onNavigate?.();
      navigate(user ? "/checkout" : "/auth?next=/checkout");
      return;
    }

    setBusy(true);
    try {
      const state = await startEftCheckout({
        userId: user.id,
        items,
        totalPrice,
        form: saved,
      });
      try {
        window.sessionStorage.setItem(EFT_SESSION_KEY, JSON.stringify(state));
      } catch {
        /* storage unavailable — router state still works */
      }
      await refreshOrders();
      await supabase.from("cart_snapshots").delete().eq("user_id", user.id);
      clearCart();
      onNavigate?.();
      navigate("/checkout/eft-instructions", { state });
    } catch (err) {
      toast({
        title: "Checkout unavailable",
        description: paymentErrorMessage(err),
        variant: "destructive",
      });
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={go}
        disabled={busy}
        data-testid="express-checkout-button"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-foreground py-4 text-base font-bold uppercase tracking-wide text-background transition-opacity hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Reserving your order…</>
        ) : (
          <><Zap className="h-4 w-4" /> Express checkout</>
        )}
      </button>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        Pay by EFT from any SA banking app — unique reference on the next screen
      </p>
    </div>
  );
}
