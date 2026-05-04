import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Lock, CheckCircle, Tag } from "lucide-react";
import { formatZAR } from "@/lib/currency";
import CartCountdown from "@/components/CartCountdown";
import SecurityChecklist from "@/components/SecurityChecklist";
import CheckoutTrustBar from "@/components/CheckoutTrustBar";
import DeliveryReturnsAccordion from "@/components/DeliveryReturnsAccordion";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";

export default function CheckoutPage() {
  const { items, subtotal, totalPrice, discountAmount, discountCode, isDiscountEligible, clearCart } = useCart();
  const { user, refreshOrders } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  if (submitted) {
    return (
      <>
        <div className="container flex flex-col items-center justify-center py-32">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-trust/10">
          <CheckCircle className="h-10 w-10 text-trust" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-foreground">Order Confirmed!</h1>
        <p className="mt-2 text-muted-foreground">Thank you for your purchase. You'll receive a confirmation email shortly.</p>
        {orderId && (
          <p className="mt-1 text-sm font-mono text-foreground">
            Order #{orderId.slice(0, 8).toUpperCase()}
          </p>
        )}
        <Link to="/shop" className="mt-6 rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground">Continue Shopping</Link>
        </div>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container py-32 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">Your cart is empty</h1>
        <Link to="/shop" className="mt-4 inline-block text-primary hover:underline">Browse Products</Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    let newOrderId: string | null = null;
    if (user) {
      const { data: orderRow } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total: totalPrice,
          discount_code: discountCode,
        })
        .select("id")
        .single();
      newOrderId = orderRow?.id ?? null;
      await refreshOrders();
      // Clear abandoned cart snapshot now that order is placed
      await supabase.from("cart_snapshots").delete().eq("user_id", user.id);
      // Push order to Nocobase
      const { syncToNocobase, captureLead } = await import("@/lib/nocobase");
      const itemsPayload = items.map((i) => ({
        product_id: i.product.id,
        name: i.product.name,
        variant_label: i.variantLabel ?? null,
        quantity: i.quantity,
        price: i.unitPrice,
      }));
      syncToNocobase("order.created", {
        order_id: newOrderId,
        user_id: user.id,
        email: user.email,
        items: itemsPayload,
        subtotal,
        discount_code: discountCode,
        discount_amount: discountAmount,
        total: totalPrice,
        stage: "customer",
        tags: ["purchase"],
      });
      // Final lead capture: lifecycle → customer, with full order context for CRM accuracy.
      const extraTags = ["order_confirmed"];
      if (discountCode === "RIDETHETIDE10") extraTags.push("first_order_discount_used");
      captureLead({
        source: "order",
        email: user.email,
        extraTags,
        extra: {
          order_id: newOrderId,
          user_id: user.id,
          items: itemsPayload,
          subtotal,
          discount_code: discountCode,
          discount_amount: discountAmount,
          total: totalPrice,
        },
      });
    }
    clearCart();
    setOrderId(newOrderId);
    setSubmitted(true);
    setBusy(false);
  };

  return (
    <>
    <SEO title="Checkout" description="Complete your secure peptide order — discreet packaging, same-day dispatch in South Africa." path="/checkout" noindex />
    <div className="container py-12">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl font-bold text-foreground">Checkout</h1>
        <CartCountdown variant="compact" />
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="lg:col-span-2 flex flex-col gap-6">
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
              <input required placeholder="Province" className="rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <input required placeholder="Postal Code" className="rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <input required defaultValue="South Africa" placeholder="Country" className="rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
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

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-display text-lg font-semibold text-foreground">Payment</h3>
            <div className="mt-4 grid gap-4">
              <input required placeholder="Card Number" className="rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="MM / YY" className="rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                <input required placeholder="CVC" className="rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
          </div>

          <CheckoutTrustBar />

          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-hero-gradient py-4 font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          >
            {busy ? "Processing..." : `Place Order — ${formatZAR(totalPrice)}`}
          </button>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> SSL Encrypted</span>
            <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Secure Payment</span>
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
                  <span className="text-sm font-semibold text-foreground">{formatZAR(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <div className="flex justify-between text-sm text-muted-foreground"><span>Subtotal</span><span>{formatZAR(subtotal)}</span></div>
              {isDiscountEligible && (
                <div className="mt-1 flex justify-between text-sm font-semibold text-trust"><span>{discountCode} (−10%)</span><span>−{formatZAR(discountAmount)}</span></div>
              )}
              <div className="mt-1 flex justify-between text-sm text-muted-foreground"><span>Shipping</span><span className="text-trust font-semibold">Free</span></div>
              <div className="mt-2 flex justify-between font-display text-lg font-bold text-foreground"><span>Total</span><span>{formatZAR(totalPrice)}</span></div>
            </div>
          </div>

          <SecurityChecklist />
        </div>
      </div>
    </div>
    </>
  );
}
