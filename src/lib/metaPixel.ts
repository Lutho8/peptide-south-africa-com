let pixelInitAttempted = false;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export function initMetaPixel(): void {
  if (pixelInitAttempted) return;
  pixelInitAttempted = true;
  const pixelId = import.meta.env.VITE_META_PIXEL_ID;
  if (!pixelId || typeof window === "undefined") return;
  try {
    if (window.fbq) return;
    const fbq = function (...args: unknown[]) {
      const queue = (fbq as unknown as { queue: unknown[][] }).queue;
      queue.push(args);
    } as unknown as Window["fbq"] & { queue: unknown[][]; loaded: boolean; version: string; push: Window["fbq"] };
    fbq!.queue = [];
    fbq!.loaded = true;
    fbq!.version = "2.0";
    fbq!.push = fbq!;
    window.fbq = fbq;
    window._fbq = fbq;
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
    window.fbq("init", pixelId);
    window.fbq("track", "PageView");
  } catch {
    // Pixel bootstrap must never break the app.
  }
}
