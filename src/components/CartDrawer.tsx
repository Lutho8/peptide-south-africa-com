import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { formatZAR } from "@/lib/currency";

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-display text-lg font-bold text-foreground">Your Cart ({totalItems})</h2>
          <button onClick={() => setIsCartOpen(false)} className="rounded-full p-2 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <button
              onClick={() => setIsCartOpen(false)}
              className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col gap-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4 rounded-lg border border-border p-3">
                    <img src={item.product.image} alt={item.product.name} className="h-20 w-20 rounded-md object-cover" />
                    <div className="flex flex-1 flex-col">
                      <h4 className="font-display text-sm font-semibold text-foreground">{item.product.name}</h4>
                      <span className="text-sm font-bold text-primary">{formatZAR(item.product.price)}</span>
                      <div className="mt-auto flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="rounded-md border border-border p-1 hover:bg-muted">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-[2ch] text-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="rounded-md border border-border p-1 hover:bg-muted">
                          <Plus className="h-3 w-3" />
                        </button>
                        <button onClick={() => removeFromCart(item.product.id)} className="ml-auto text-xs text-destructive hover:underline">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border p-4">
              <div className="mb-2 flex justify-between text-sm text-muted-foreground">
                <span>Shipping</span><span className="font-semibold text-trust">Free!</span>
              </div>
              <div className="mb-4 flex justify-between font-display text-lg font-bold text-foreground">
                <span>Total</span><span>{formatZAR(totalPrice)}</span>
              </div>
              <Link
                to="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="block w-full rounded-lg bg-primary py-3 text-center text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
              >
                Checkout
              </Link>
              <Link
                to="/cart"
                onClick={() => setIsCartOpen(false)}
                className="mt-2 block w-full rounded-lg border border-border py-3 text-center text-sm font-semibold text-foreground transition-all hover:bg-muted"
              >
                View Cart
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
