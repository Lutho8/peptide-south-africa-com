import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import type { Product } from "@/data/products";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  totalPrice: number; // discounted total
  discountCode: string | null;
  discountAmount: number;
  isDiscountEligible: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const FIRST_ORDER_CODE = "RIDETHETIDE10";
export const FIRST_ORDER_PCT = 0.10;

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, hasFirstOrder } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
      );
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  // Eligible: signed in AND no prior orders
  const isDiscountEligible = !!user && hasFirstOrder === false;
  const discountAmount = isDiscountEligible ? subtotal * FIRST_ORDER_PCT : 0;
  const totalPrice = subtotal - discountAmount;
  const discountCode = isDiscountEligible ? FIRST_ORDER_CODE : null;

  // Persist abandoned-cart snapshot for logged-in users (debounced)
  const snapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!user) return;
    if (snapTimer.current) clearTimeout(snapTimer.current);
    snapTimer.current = setTimeout(() => {
      if (items.length === 0) {
        supabase.from("cart_snapshots").delete().eq("user_id", user.id);
      } else {
        supabase.from("cart_snapshots").upsert({
          user_id: user.id,
          items: items.map((i) => ({
            product_id: i.product.id,
            name: i.product.name,
            quantity: i.quantity,
            price: i.product.price,
          })),
          subtotal,
          notified_at: null,
        }, { onConflict: "user_id" });
      }
    }, 1500);
    return () => { if (snapTimer.current) clearTimeout(snapTimer.current); };
  }, [items, user, subtotal]);

  return (
    <CartContext.Provider
      value={{
        items, addToCart, removeFromCart, updateQuantity, clearCart,
        totalItems, subtotal, totalPrice, discountCode, discountAmount, isDiscountEligible,
        isCartOpen, setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
