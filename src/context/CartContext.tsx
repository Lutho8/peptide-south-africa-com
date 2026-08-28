import { createContext, startTransition, useContext, useState, useCallback, useEffect, useRef, useMemo, type ReactNode } from "react";
import type { Product } from "@/data/products";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PRICING, catalogPrice, quoteMixSlugs, roundCents, variantPrice, type MixBundleSize } from "../../supabase/functions/_shared/pricing";

export interface CartItem {
  product: Product;
  variantLabel?: string;
  unitPrice: number;
  quantity: number;
  lineId: string;
  /** Groups the per-vial lines of one Pick & Mix bundle. */
  bundleId?: string;
  /** e.g. "5-Pack Pick & Mix (20% Off)". */
  bundleLabel?: string;
  bundleDiscountPct?: number;
  /** Undiscounted single-vial price — used to display "You Save". */
  compareAtPrice?: number;
  /** Stable source group for atomic replacement (for example quiz plans). */
  groupId?: string;
}

export interface BundleLineInput {
  product: Product;
  /** Discounted per-vial price (allocated so the bundle sums exactly). */
  unitPrice: number;
  /** Undiscounted single-vial price. */
  compareAtPrice: number;
}

export interface CartGroupLineInput {
  product: Product;
  variantLabel?: string;
  unitPrice: number;
  quantity: number;
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
  /** Adds a Pick & Mix bundle as grouped per-vial lines. Returns the bundleId. */
  addBundleToCart: (lines: BundleLineInput[], meta: { label: string; discountPct: number }) => string;
  /** Replaces only lines created by the same guided flow, preserving manual cart items. */
  replaceCartGroup: (groupId: string, lines: CartGroupLineInput[]) => void;
  /** Removes every line belonging to a bundle. */
  removeBundle: (bundleId: string) => void;
  removeFromCart: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function makeLineId(productId: string, variantLabel?: string) {
  return `${productId}::${variantLabel ?? "default"}`;
}

function computeSignature(items: CartItem[]): string {
  return items
    .map((i) => `${i.lineId}x${i.quantity}`)
    .sort()
    .join("|");
}

const CART_STORAGE_KEY = "psa.cart.v1";

function loadPersistedItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Basic shape validation to avoid crashes if the schema drifts.
    const valid = parsed.filter(
      (i): i is CartItem =>
        !!i && typeof i === "object" && !!i.product && i.product.track !== "GP" && typeof i.lineId === "string" && typeof i.quantity === "number",
    );
    const bundleIds = [...new Set(valid.flatMap((item) => item.bundleId ? [item.bundleId] : []))];
    const repricedBundles = new Map<string, number[]>();
    for (const bundleId of bundleIds) {
      const lines = valid.filter((item) => item.bundleId === bundleId);
      if (lines.length !== 5 && lines.length !== 10) continue;
      const size = lines.length as MixBundleSize;
      const quote = quoteMixSlugs(lines.map((line) => line.product.slug), size);
      const multiplier = 1 - PRICING.packDiscounts[size];
      const prices = lines.map((line) => roundCents(catalogPrice(line.product.slug) * multiplier));
      const sumBeforeLast = prices.slice(0, -1).reduce((sum, amount) => sum + amount, 0);
      prices[prices.length - 1] = roundCents(quote.total - sumBeforeLast);
      repricedBundles.set(bundleId, prices);
    }
    return valid.flatMap((item) => {
      if (item.bundleId) {
        const lines = valid.filter((candidate) => candidate.bundleId === item.bundleId);
        const prices = repricedBundles.get(item.bundleId);
        if (!prices) return [];
        const index = lines.findIndex((candidate) => candidate.lineId === item.lineId);
        return [{ ...item, unitPrice: prices[index], compareAtPrice: catalogPrice(item.product.slug), quantity: 1 }];
      }
      try {
        return [{ ...item, unitPrice: variantPrice(item.product.slug, item.variantLabel), quantity: Math.max(1, Math.floor(item.quantity)) }];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  // Match the server-rendered empty cart for the first client render. Restoring
  // local data in a transition prevents an app-shell update from interrupting
  // a lazy route while its prerendered HTML is still hydrating.
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const persisted = loadPersistedItems();
    if (persisted.length > 0) {
      startTransition(() => setItems(persisted));
    }
  }, []);

  // Mirror items to localStorage so refreshes, tab closes, and /auth navigation
  // don't wipe the cart. Runs on every change; JSON.stringify is cheap here.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (items.length === 0) {
        window.localStorage.removeItem(CART_STORAGE_KEY);
      } else {
        window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      }
    } catch {
      // storage full / disabled — silently ignore, cart still works in-memory
    }
  }, [items]);


  const addToCart = useCallback((product: Product, opts: AddToCartOptions = {}) => {
    if (product.track === "GP") return;
    const variantLabel = opts.variantLabel;
    const unitPrice = variantPrice(product.slug, variantLabel);
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

  const addBundleToCart = useCallback(
    (lines: BundleLineInput[], meta: { label: string; discountPct: number }) => {
      if (lines.length !== 5 && lines.length !== 10) throw new Error("Invalid bundle size");
      if (lines.some((line) => line.product.track === "GP")) throw new Error("Clinician-guided products cannot be added to a research bundle");
      const size = lines.length as MixBundleSize;
      const quote = quoteMixSlugs(lines.map((line) => line.product.slug), size);
      const multiplier = 1 - PRICING.packDiscounts[size];
      const canonicalPrices = lines.map((line) => roundCents(catalogPrice(line.product.slug) * multiplier));
      const sumBeforeLast = canonicalPrices.slice(0, -1).reduce((sum, amount) => sum + amount, 0);
      canonicalPrices[canonicalPrices.length - 1] = roundCents(quote.total - sumBeforeLast);
      const bundleId = `bundle-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setItems((prev) => [
        ...prev,
        ...lines.map((l, idx) => ({
          product: l.product,
          variantLabel: meta.label,
          unitPrice: canonicalPrices[idx],
          compareAtPrice: catalogPrice(l.product.slug),
          quantity: 1,
          lineId: `${bundleId}::${idx}`,
          bundleId,
          bundleLabel: meta.label,
          bundleDiscountPct: meta.discountPct,
        })),
      ]);
      setIsCartOpen(true);
      return bundleId;
    },
    [],
  );

  const removeBundle = useCallback((bundleId: string) => {
    setItems((prev) => prev.filter((i) => i.bundleId !== bundleId));
  }, []);

  const replaceCartGroup = useCallback((groupId: string, lines: CartGroupLineInput[]) => {
    if (lines.some((line) => line.product.track === "GP")) throw new Error("Clinician-guided products cannot be added to the cart");
    setItems((prev) => [
      ...prev.filter((item) => item.groupId !== groupId),
      ...lines.map((line) => ({
        ...line,
        unitPrice: variantPrice(line.product.slug, line.variantLabel),
        groupId,
        lineId: `${groupId}::${line.product.id}::${line.variantLabel ?? "default"}`,
      })),
    ]);
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

  const totalPrice = subtotal;

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
        items, addToCart, addBundleToCart, replaceCartGroup, removeBundle, removeFromCart, updateQuantity, clearCart,
        totalItems, subtotal, totalPrice,
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
