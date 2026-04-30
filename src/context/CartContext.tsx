import { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo, type ReactNode } from "react";
import type { Product } from "@/data/products";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export interface CartItem {
  product: Product;
  variantLabel?: string;
  unitPrice: number;
  quantity: number;
  lineId: string;
}

export interface AddToCartOptions {
  variantLabel?: string;
  unitPrice?: number;
  /** When true, do not auto-open the cart drawer. */
  silent?: boolean;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, opts?: AddToCartOptions) => void;
  removeFromCart: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  totalPrice: number;
  discountCode: string | null;
  discountAmount: number;
  isDiscountEligible: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const FIRST_ORDER_CODE = "RIDETHETIDE10";
export const FIRST_ORDER_PCT = 0.10;

function makeLineId(productId: string, variantLabel?: string) {
  return `${productId}::${variantLabel ?? "default"}`;
}

function computeSignature(items: CartItem[]): string {
  return items
    .map((i) => `${i.lineId}x${i.quantity}`)
    .sort()
    .join("|");
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, hasFirstOrder } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = useCallback((product: Product, opts: AddToCartOptions = {}) => {
    const variantLabel = opts.variantLabel;
    const unitPrice = opts.unitPrice ?? product.price;
    const lineId = makeLineId(product.id, variantLabel);
    setItems((prev) => {
      const existing = prev.find((i) => i.lineId === lineId);
      if (existing) {
        return prev.map((i) =>
          i.lineId === lineId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, variantLabel, unitPrice, quantity: 1, lineId }];
    });
    if (!opts.silent) setIsCartOpen(true);
  }, []);

  const removeFromCart = useCallback((lineId: string) => {
    setItems((prev) => prev.filter((i) => i.lineId !== lineId));
  }, []);

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.lineId !== lineId));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.lineId === lineId ? { ...i, quantity } : i))
      );
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  const isDiscountEligible = !!user && hasFirstOrder === false;
  const discountAmount = isDiscountEligible ? subtotal * FIRST_ORDER_PCT : 0;
  const totalPrice = subtotal - discountAmount;
  const discountCode = isDiscountEligible ? FIRST_ORDER_CODE : null;

  const signature = useMemo(() => computeSignature(items), [items]);

  // Persist abandoned-cart snapshot for logged-in users (debounced).
  // Using `cart_signature` lets the edge function avoid re-notifying for the
  // same cart, while a real change resets `notified_at` so a new reminder fires.
  const snapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSentSig = useRef<string | null>(null);
  useEffect(() => {
    if (!user) return;
    if (snapTimer.current) clearTimeout(snapTimer.current);
    snapTimer.current = setTimeout(async () => {
      if (items.length === 0) {
        await supabase.from("cart_snapshots").delete().eq("user_id", user.id);
        lastSentSig.current = null;
        return;
      }
      const sigChanged = lastSentSig.current !== signature;
      const itemsPayload = items.map((i) => ({
        product_id: i.product.id,
        name: i.product.name,
        variant_label: i.variantLabel ?? null,
        quantity: i.quantity,
        price: i.unitPrice,
      }));
      await supabase.from("cart_snapshots").upsert(
        {
          user_id: user.id,
          items: itemsPayload,
          subtotal,
          cart_signature: signature,
          // Only reset notified_at when the cart actually changed; otherwise
          // keep whatever the edge function stamped to avoid duplicate reminders.
          ...(sigChanged ? { notified_at: null } : {}),
        },
        { onConflict: "user_id" },
      );
      lastSentSig.current = signature;
    }, 1500);
    return () => { if (snapTimer.current) clearTimeout(snapTimer.current); };
  }, [items, user, subtotal, signature]);

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
