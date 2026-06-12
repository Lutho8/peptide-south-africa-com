import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { ProductTrack } from "@/data/products";

export interface LastViewedProduct {
  slug: string;
  name: string;
  image: string;
  price: number;
  track?: ProductTrack;
}

interface Ctx {
  lastViewed: LastViewedProduct | null;
  setLastViewed: (p: LastViewedProduct | null) => void;
  dismissed: boolean;
  dismiss: () => void;
}

const LastViewedContext = createContext<Ctx | undefined>(undefined);

const STORAGE_KEY = "rtt:last-viewed-product";
const DISMISSED_KEY = "rtt:last-viewed-dismissed";

export function LastViewedProductProvider({ children }: { children: ReactNode }) {
  const [lastViewed, setLastViewedState] = useState<LastViewedProduct | null>(null);
  const [dismissedSlug, setDismissedSlug] = useState<string | null>(null);

  // Hydrate from sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setLastViewedState(JSON.parse(raw));
      const d = sessionStorage.getItem(DISMISSED_KEY);
      if (d) setDismissedSlug(d);
    } catch {
      // ignore
    }
  }, []);

  const setLastViewed = useCallback((p: LastViewedProduct | null) => {
    setLastViewedState(p);
    try {
      if (p) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(p));
        // New product viewed → clear prior dismissal
        if (dismissedSlug && dismissedSlug !== p.slug) {
          sessionStorage.removeItem(DISMISSED_KEY);
          setDismissedSlug(null);
        }
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [dismissedSlug]);

  const dismiss = useCallback(() => {
    if (!lastViewed) return;
    setDismissedSlug(lastViewed.slug);
    try { sessionStorage.setItem(DISMISSED_KEY, lastViewed.slug); } catch { /* ignore */ }
  }, [lastViewed]);

  const dismissed = !!lastViewed && dismissedSlug === lastViewed.slug;

  return (
    <LastViewedContext.Provider value={{ lastViewed, setLastViewed, dismissed, dismiss }}>
      {children}
    </LastViewedContext.Provider>
  );
}

export function useLastViewedProduct() {
  const ctx = useContext(LastViewedContext);
  if (!ctx) throw new Error("useLastViewedProduct must be used within LastViewedProductProvider");
  return ctx;
}
