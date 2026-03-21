import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="container flex flex-col items-center justify-center py-32">
        <ShoppingBag className="mb-4 h-20 w-20 text-muted-foreground/20" />
        <h1 className="font-display text-2xl font-bold text-foreground">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add some products to get started.</p>
        <Link to="/shop" className="mt-6 rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <Link to="/shop" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Continue Shopping
      </Link>
      <h1 className="mb-8 font-display text-3xl font-bold text-foreground">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <div key={item.product.id} className="flex gap-4 rounded-lg border border-border bg-card p-4 shadow-card">
                <img src={item.product.image} alt={item.product.name} className="h-24 w-24 rounded-md object-cover" />
                <div className="flex flex-1 flex-col">
                  <Link to={`/product/${item.product.slug}`} className="font-display font-semibold text-foreground hover:text-primary">
                    {item.product.name}
                  </Link>
                  <span className="text-sm text-muted-foreground">{item.product.category}</span>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="rounded-md border border-border p-1.5 hover:bg-muted">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="min-w-[2ch] text-center font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="rounded-md border border-border p-1.5 hover:bg-muted">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-display font-bold text-foreground">${(item.product.price * item.quantity).toFixed(2)}</span>
                      <button onClick={() => removeFromCart(item.product.id)} className="text-destructive hover:text-destructive/80">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-card h-fit">
          <h3 className="font-display text-lg font-bold text-foreground">Order Summary</h3>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span><span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span><span className="font-semibold text-trust">Free</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax</span><span>$0.00</span>
            </div>
          </div>
          <div className="mt-4 border-t border-border pt-4 flex justify-between font-display text-lg font-bold text-foreground">
            <span>Total</span><span>${totalPrice.toFixed(2)}</span>
          </div>
          <Link
            to="/checkout"
            className="mt-6 block w-full rounded-lg bg-hero-gradient py-3.5 text-center font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90"
          >
            Proceed to Checkout
          </Link>
          <p className="mt-4 text-center text-xs text-muted-foreground">🔒 Secure checkout · Free shipping</p>
        </div>
      </div>
    </div>
  );
}
