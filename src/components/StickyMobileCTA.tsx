import { Link, useLocation } from "react-router-dom";
import { ArrowRight, ShoppingCart, LineChart } from "lucide-react";
import { useEffect, useState } from "react";
import { TRACKER_URL } from "@/lib/contact";

export default function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  // Only show on homepage
  const isHome = location.pathname === "/";

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  if (!isHome || !visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-[1fr_auto] gap-2 border-t border-border bg-card/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-lg md:hidden">
      <Link
        to="/shop"
        className="flex items-center justify-center gap-2 rounded-lg bg-hero-gradient px-4 py-3 text-sm font-bold text-primary-foreground shadow-glow transition-all active:scale-95"
      >
        <ShoppingCart className="h-4 w-4" /> Shop <ArrowRight className="h-4 w-4" />
      </Link>
      <a
        href={TRACKER_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open Peptide Tracker (external)"
        className="flex items-center justify-center gap-1.5 rounded-lg border-2 border-[#0a2540] bg-background px-3 py-3 text-sm font-bold text-[#0a2540] transition-all active:scale-95"
      >
        <LineChart className="h-4 w-4" /> Tracker
      </a>
    </div>
  );
}
