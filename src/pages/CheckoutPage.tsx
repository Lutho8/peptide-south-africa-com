import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useCurrency } from "@/context/CurrencyContext";
import { Shield, Lock, Tag, CreditCard, Bitcoin, Loader2 } from "lucide-react";
import CartCountdown from "@/components/CartCountdown";
import SecurityChecklist from "@/components/SecurityChecklist";
import CheckoutTrustBar from "@/components/CheckoutTrustBar";
import DeliveryReturnsAccordion from "@/components/DeliveryReturnsAccordion";
import PaymentMethodsBanner from "@/components/PaymentMethodsBanner";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";

export default function CheckoutPage() {
  const { items, subtotal, totalPrice, discountAmount, discountCode, isDiscountEligible, clearCart } = useCart();
  const { user, refreshOrders } = useAuth();
  const { format, currency, convert } = useCurrency();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  if (items.length === 0) {
    return (
      <div className="container py-32 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">Your cart is empty</h1>
        <Link to="/shop" className="mt-4 inline-block text-primary hover:underline">Browse Products</Link>
      </div>
    );
  }

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please sign in", description: "Sign in to complete checkout.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    setBusy(true);
    try {
      // 1. Create pending order in our DB (EUR canonical amount).
      const description = items
        .map((i) => `${i.product.name}${i.variantLabel ? ` (${i.variantLabel})` : ""} x${i.quantity}`)
        .join(", ")
        .slice(0, 500);

      const { data: orderRow, error: orderErr } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total: totalPrice,
          discount_code: discountCode,
          status: "pending",
          currency,
          order_description: description,
        })
        .select("id")
        .single();
      if (orderErr || !orderRow) throw orderErr ?? new Error("Failed to create order");

      // 2. Ask edge function for NowPayments payment_url. Amount goes in the
      //    customer's chosen currency.
      const amount = currency === "EUR" ? totalPrice : Math.round(convert(totalPrice) * 100) / 100;
      const origin = window.location.origin;

      const { data, error: fnErr } = await supabase.functions.invoke("nowpayments-create-payment", {
        body: {
          orderId: orderRow.id,
          amount,
          currency: currency.toLowerCase(),
          description,
          successUrl: `${origin}/checkout/success?order_id=${orderRow.id}`,
          cancelUrl: `${origin}/checkout/cancel?order_id=${orderRow.id}`,
        },
      });
      if (fnErr) throw new Error(fnErr.message);
      if (data?.error) throw new Error(data.error);
      if (!data?.payment_url) throw new Error("No payment URL returned");

      await refreshOrders();
      await supabase.from("cart_snapshots").delete().eq("user_id", user.id);
      clearCart();
      window.location.href = data.payment_url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment could not be started";
      toast({
        title: "Payment unavailable",
        description: msg.includes("not configured")
          ? "Payments come online once our NowPayments verification completes. Please try again shortly."
          : msg,
        variant: "destructive",
      });
      setBusy(false);
    }
  };

  return (
    <>
    <SEO title="Checkout" description="Complete your secure peptide order — discreet packaging, SA & EU shipping." path="/checkout" noindex />
    <div className="container py-12">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl font-bold text-foreground">Checkout</h1>
        <CartCountdown variant="compact" />
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <form onSubmit={handlePay} className="lg:col-span-2 flex flex-col gap-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-display text-lg font-semibold text-foreground">Contact Information</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <input required placeholder="First Name" className="rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <input required placeholder="Last Name" className="rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <input required type="email" defaultValue={user?.email ?? ""} placeholder="Email" className="rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring sm:col-span-2" />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-display text-lg font-semibold text-foreground">Shipping Address</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <input required placeholder="Address" className="rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring sm:col-span-2" />
              <input required placeholder="City" className="rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <input required placeholder="Province / State" className="rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <input required placeholder="Postal Code" className="rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <input required defaultValue={currency === "EUR" ? "Germany" : "South Africa"} placeholder="Country" className="rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Shipping: South Africa 1–3 days · Germany / EU 4–7 days. Free over R1,500 (SA) or €75 (DE/EU).
            </p>
          </div>

          <DeliveryReturnsAccordion defaultOpen="shipping" />

          {/* Discount field */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
              <Tag className="h-4 w-4 text-primary" /> Discount Code
            </h3>
            <div className="mt-3 flex items-center gap-2">
              <input
                readOnly
                value={discountCode ?? ""}
                placeholder={isDiscountEligible ? "" : "Sign in to auto-apply RIDETHETIDE10"}
                className="flex-1 rounded-lg border border-input bg-muted px-4 py-3 text-sm font-mono text-foreground"
              />
              {isDiscountEligible ? (
                <span className="rounded-md bg-trust/10 px-3 py-2 text-xs font-bold text-trust">−10% APPLIED</span>
              ) : (
                <Link to="/auth" className="rounded-md bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">Sign in</Link>
              )}
            </div>
          </div>

          {/* Payment — NowPayments */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
              <CreditCard className="h-4 w-4 text-primary" /> Payment
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Pay securely via PayPal, credit/debit card, Apple Pay, Google Pay, SEPA bank transfer, or cryptocurrency.
              All payments are processed securely through our payment partner{" "}
              <a href="https://nowpayments.io" target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:text-primary">NowPayments</a>.
            </p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {["PayPal","Visa","Mastercard","Apple Pay","Google Pay","SEPA","Revolut"].map((m) => (
                <li key={m} className="rounded-md border border-border bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{m}</li>
              ))}
              <li className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                <Bitcoin className="h-3 w-3" /> Crypto
              </li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              You'll be redirected to NowPayments' secure checkout. Your charged currency: <span className="font-semibold text-foreground">{currency}</span>.
            </p>
          </div>

          <CheckoutTrustBar />

          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-hero-gradient py-4 font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          >
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Preparing payment…</> : <>Pay Now — {format(totalPrice)}</>}
          </button>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> SSL Encrypted</span>
            <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Secure Payment via NowPayments</span>
          </div>
        </form>

        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-card p-6 h-fit">
            <h3 className="font-display text-lg font-bold text-foreground">Order Summary</h3>
            <div className="mt-4 flex flex-col gap-3">
              {items.map((item) => (
                <div key={item.lineId} className="flex items-center gap-3">
                  <img src={item.product.image} alt={item.product.name} className="h-12 w-12 rounded-md object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {item.product.name}
                      {item.variantLabel && <span className="ml-1 text-muted-foreground">· {item.variantLabel}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{format(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <div className="flex justify-between text-sm text-muted-foreground"><span>Subtotal</span><span>{format(subtotal)}</span></div>
              {isDiscountEligible && (
                <div className="mt-1 flex justify-between text-sm font-semibold text-trust"><span>{discountCode} (−10%)</span><span>−{format(discountAmount)}</span></div>
              )}
              <div className="mt-1 flex justify-between text-sm text-muted-foreground"><span>Shipping</span><span className="text-trust font-semibold">Free</span></div>
              <div className="mt-2 flex justify-between font-display text-lg font-bold text-foreground"><span>Total</span><span>{format(totalPrice)}</span></div>
            </div>
          </div>

          <SecurityChecklist />
        </div>
      </div>
      <div className="mt-10">
        <PaymentMethodsBanner />
      </div>
    </div>
    </>
  );
}
