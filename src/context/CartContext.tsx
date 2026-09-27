import { createContext, startTransition, useContext, useState, useCallback, useEffect, useRef, useMemo, type ReactNode } from "react";
import { getProductBySlug, type Product } from "@/data/products";
import { BAC_SLUG } from "../../supabase/functions/_shared/catalog-release";
import { toast } from "sonner";
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

function currentProduct(product: Product): Product | undefined {
  const current = getProductBySlug(product?.slug ?? "");
  if (!current || current.inStock === false || product?.inStock === false) return undefined;
  if (product.sku && product.sku !== current.sku) return undefined;
  const oldStrength = product.variants?.find((v) => v.mgPerVial)?.mgPerVial;
  const newStrength = current.variants?.find((v) => v.mgPerVial)?.mgPerVial;
  if (oldStrength && newStrength && oldStrength !== newStrength) return undefined;
  return current;
}
/** Restore canonical products/prices, not cached labels or old strengths. */
export function restoreCartItems(parsed: unknown): CartItem[] {
  if (!Array.isArray(parsed)) return [];
  const valid = parsed.filter((i): i is CartItem => !!i?.product && typeof i.lineId === "string" && Number.isInteger(i.quantity) && i.quantity >= 1 && i.quantity <= 99);
  const output: CartItem[] = [];
  const seen = new Set<string>();
  for (const item of valid) {
    try {
      if (item.bundleId) {
        if (seen.has(item.bundleId)) continue;
        seen.add(item.bundleId);
        const lines = valid.filter((candidate) => candidate.bundleId === item.bundleId);
        if (lines.length !== 5 || lines.some((line) => line.quantity !== 1)) continue;
        const canonical = lines.map((line) => currentProduct(line.product));
        if (canonical.some((p) => !p)) continue;
        const quote = quoteMixSlugs(canonical.map((p) => p!.slug), 5);
        const prices = canonical.map((p) => roundCents(catalogPrice(p!.slug) * 0.8));
        prices[4] = roundCents(quote.total - prices.slice(0, 4).reduce((sum, n) => sum + n, 0));
        output.push(...lines.map((line, index) => ({ ...line, product: canonical[index]!, unitPrice: prices[index], compareAtPrice: catalogPrice(canonical[index]!.slug), quantity: 1, variantLabel: "5-Pack Pick & Mix (20% Off)", bundleLabel: "5-Pack Pick & Mix (20% Off)", bundleDiscountPct: 20 })));
      } else {
        const product = currentProduct(item.product);
        if (!product) continue;
        variantPrice(product.slug, item.variantLabel);
        const variantLabel = product.slug === BAC_SLUG ? undefined : item.variantLabel;
        const lineId = makeLineId(product.id, variantLabel);
        const previous = output.find((line) => line.lineId === lineId);
        if (previous) previous.quantity = Math.min(99, previous.quantity + item.quantity);
        else output.push({ ...item, product, variantLabel, lineId, unitPrice: variantPrice(product.slug, variantLabel), compareAtPrice: undefined });
      }
    } catch { /* Reject an invalid group without discarding unrelated lines. */ }
  }
  return output;
}
function loadPersistedItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? "[]");
    const restored = restoreCartItems(parsed);
    if (Array.isArray(parsed) && restored.length < parsed.length) toast.info("Your cart was refreshed. Removed or changed-strength products need to be selected again.");
    return restored;
  } catch { return []; }
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
    // Stock guard: a product explicitly marked out of stock can never enter
    // the cart, regardless of which UI triggered the add. (`=== false` so
    // synthetic payloads without the field, e.g. FloatingProductFollower,
    // keep working.)
    const canonical = currentProduct(product);
    if (!canonical) return;
    product = canonical;
    const variantLabel = product.slug === BAC_SLUG ? undefined : opts.variantLabel;
    const unitPrice = variantPrice(product.slug, variantLabel);
    const lineId = makeLineId(product.id, variantLabel);
    setItems((prev) => {
      const existing = prev.find((i) => i.lineId === lineId);
      if (existing) {
        return prev.map((i) =>
          i.lineId === lineId ? { ...i, quantity: Math.min(99, i.quantity + 1) } : i
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
      // Stock guard: drop any out-of-stock line so it can't be purchased
      // through the bundle path (the builder already blocks these upstream).
      const inStockLines = lines.filter((line) => currentProduct(line.product)).map((line) => ({ ...line, product: currentProduct(line.product)! }));
      const bundleId = `bundle-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      if (inStockLines.length !== lines.length) return bundleId;
      if (inStockLines.length !== 5) throw new Error("Invalid bundle size");
      const size = inStockLines.length as MixBundleSize;
      const quote = quoteMixSlugs(inStockLines.map((line) => line.product.slug), size);
      const multiplier = 1 - PRICING.packDiscounts[size];
      const canonicalPrices = inStockLines.map((line) => roundCents(catalogPrice(line.product.slug) * multiplier));
      const sumBeforeLast = canonicalPrices.slice(0, -1).reduce((sum, amount) => sum + amount, 0);
      canonicalPrices[canonicalPrices.length - 1] = roundCents(quote.total - sumBeforeLast);
      setItems((prev) => [
        ...prev,
        ...inStockLines.map((l, idx) => ({
          product: l.product,
          variantLabel: "5-Pack Pick & Mix (20% Off)",
          unitPrice: canonicalPrices[idx],
          compareAtPrice: catalogPrice(l.product.slug),
          quantity: 1,
          lineId: `${bundleId}::${idx}`,
          bundleId,
          bundleLabel: "5-Pack Pick & Mix (20% Off)",
          bundleDiscountPct: 20,
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
    // Stock guard: out-of-stock products (e.g. an OOS quiz recommendation)
    // are never written into the cart group.
    const inStockLines = lines.filter((line) => currentProduct(line.product)).map((line) => ({ ...line, product: currentProduct(line.product)! }));
    setItems((prev) => [
      ...prev.filter((item) => item.groupId !== groupId),
      ...inStockLines.map((line) => ({
        ...line,
        unitPrice: variantPrice(line.product.slug, line.variantLabel),
        groupId,
        lineId: `${groupId}::${line.product.id}::${line.variantLabel ?? "default"}`,
      })),
    ]);
  }, []);

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity > 99) return;
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.lineId !== lineId));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.lineId === lineId && !i.bundleId ? { ...i, quantity } : i))
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
