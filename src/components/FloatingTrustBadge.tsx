import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

/**
 * Floating centered trust badge.
 * `position: fixed + transform: translate(-50%, -50%)` keeps it pinned visually
 * centered while the user scrolls. Appears between scroll milestones, hides on
 * mobile and when reduced motion is requested.
 */
export default function FloatingTrustBadge() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(max-width: 1023px)").matches) return;

    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? y / max : 0;
      // Show only in the "mid-scroll" reading zone (15%–80% of page height).
      setVisible(ratio > 0.15 && ratio < 0.8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={`pointer-events-none fixed left-1/2 top-[18%] z-40 hidden -translate-x-1/2 transition-all duration-500 lg:block ${
        visible ? "opacity-100 translate-y-0" : "-translate-y-4 opacity-0"
      }`}
    >
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-primary/20 bg-card/90 px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-foreground shadow-lg backdrop-blur">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <span>99% HPLC · COA Verified · Same-Day SA Courier</span>
      </div>
    </div>
  );
}
