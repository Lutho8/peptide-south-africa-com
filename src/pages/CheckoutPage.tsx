import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Shield, Lock, CheckCircle } from "lucide-react";
import { formatZAR } from "@/lib/currency";
import CartCountdown from "@/components/CartCountdown";
import SecurityChecklist from "@/components/SecurityChecklist";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="container flex flex-col items-center justify-center py-32">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-trust/10">
          <CheckCircle className="h-10 w-10 text-trust" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-foreground">Order Confirmed!</h1>
        <p className="mt-2 text-muted-foreground">Thank you for your purchase. You'll receive a confirmation email shortly.</p>
        <Link to="/shop" className="mt-6 rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground">Continue Shopping</Link>
      </div>
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearCart();
    setSubmitted(true);
  };

  return (
    <div className="container py-12">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl font-bold text-foreground">Checkout</h1>
        <CartCountdown variant="compact" />
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="lg:col-span-2 flex flex-col gap-6">
          {/* Contact */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-display text-lg font-semibold text-foreground">Contact Information</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <input required placeholder="First Name" className="rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              <input required placeholder="Last Name" className="rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              <input required type="email" placeholder="Email" className="rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:col-span-2" />
            </div>
          </div>

          {/* Shipping */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-display text-lg font-semibold text-foreground">Shipping Address</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <input required placeholder="Address" className="rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:col-span-2" />
              <input required placeholder="City" className="rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              <input required placeholder="State / Province" className="rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              <input required placeholder="ZIP Code" className="rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              <input required placeholder="Country" className="rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-display text-lg font-semibold text-foreground">Payment</h3>
            <div className="mt-4 grid gap-4">
              <input required placeholder="Card Number" className="rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="MM / YY" className="rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                <input required placeholder="CVC" className="rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="rounded-lg bg-hero-gradient py-4 font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-[0.98]"
          >
            Place Order — {formatZAR(totalPrice)}
          </button>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> SSL Encrypted</span>
            <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Secure Payment</span>
          </div>
        </form>

        {/* Order summary + trust */}
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-card p-6 h-fit">
            <h3 className="font-display text-lg font-bold text-foreground">Order Summary</h3>
            <div className="mt-4 flex flex-col gap-3">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <img src={item.product.image} alt={item.product.name} className="h-12 w-12 rounded-md object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{formatZAR(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <div className="flex justify-between text-sm text-muted-foreground"><span>Shipping</span><span className="text-trust font-semibold">Free</span></div>
              <div className="mt-2 flex justify-between font-display text-lg font-bold text-foreground"><span>Total</span><span>{formatZAR(totalPrice)}</span></div>
            </div>
          </div>

          {/* Reduce purchase anxiety */}
          <SecurityChecklist />
        </div>
      </div>
    </div>
  );
}
