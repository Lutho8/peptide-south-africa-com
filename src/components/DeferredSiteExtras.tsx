import { lazy, Suspense, useEffect, useState } from "react";

const Analytics = lazy(() => import("@vercel/analytics/react").then((module) => ({ default: module.Analytics })));
const CookieConsent = lazy(() => import("@/components/CookieConsent"));
const DiscountPopup = lazy(() => import("@/components/DiscountPopup"));
const FloatingProductFollower = lazy(() => import("@/components/FloatingProductFollower"));
const FloatingTrustBadge = lazy(() => import("@/components/FloatingTrustBadge"));
const StickyMobileCTA = lazy(() => import("@/components/StickyMobileCTA"));
const WhatsAppButton = lazy(() => import("@/components/WhatsAppButton"));

type WindowWithIdleCallback = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export default function DeferredSiteExtras() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const browserWindow = window as WindowWithIdleCallback;
    let idleHandle: number | undefined;
    let timeoutHandle: number | undefined;

    const reveal = () => setReady(true);
    const schedule = () => {
      if (browserWindow.requestIdleCallback) {
        idleHandle = browserWindow.requestIdleCallback(reveal, { timeout: 2000 });
      } else {
        timeoutHandle = window.setTimeout(reveal, 0);
      }
    };

    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      window.removeEventListener("load", schedule);
      if (idleHandle !== undefined) browserWindow.cancelIdleCallback?.(idleHandle);
      if (timeoutHandle !== undefined) window.clearTimeout(timeoutHandle);
    };
  }, []);

  if (!ready) return null;

  return (
    <Suspense fallback={null}>
      <DiscountPopup />
      <StickyMobileCTA />
      <FloatingProductFollower />
      <FloatingTrustBadge />
      <CookieConsent />
      <WhatsAppButton />
      <Analytics />
    </Suspense>
  );
}
