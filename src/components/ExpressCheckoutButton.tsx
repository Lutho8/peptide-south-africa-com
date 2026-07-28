import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Zap } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  hasCompleteCheckoutDetails,
  loadSavedCheckoutForm,
  paymentErrorMessage,
  startPayfastCheckout,
} from "@/lib/startPayfastCheckout";

interface Props {
  /** Called right before we navigate away (e.g. close the cart drawer). */
  onNavigate?: () => void;
  className?: string;
}

/**
 * One-tap fast lane into the PayFast hosted page, where Apple Pay, Capitec Pay,
 * instant EFT and cards are all available. Falls back to the normal checkout
 * form when we don't have complete details on file.
 */
export default function ExpressCheckoutButton({ onNavigate, className = "" }: Props) {
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
      await startPayfastCheckout({
        userId: user.id,
        items,
        totalPrice,
        form: saved,
        onBeforeRedirect: async () => {
          await refreshOrders();
          await supabase.from("cart_snapshots").delete().eq("user_id", user.id);
          clearCart();
          onNavigate?.();
        },
      });
    } catch (err) {
      toast({
        title: "Payment unavailable",
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
          <><Loader2 className="h-4 w-4 animate-spin" /> Taking you to payment…</>
        ) : (
          <><Zap className="h-4 w-4" /> Express checkout</>
        )}
      </button>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        Apple Pay, Capitec Pay, instant EFT &amp; card on the next screen
      </p>
    </div>
  );
}
