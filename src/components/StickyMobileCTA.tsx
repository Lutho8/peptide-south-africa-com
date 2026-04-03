import { Link, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

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
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 p-3 backdrop-blur-lg md:hidden">
      <Link
        to="/quiz"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-hero-gradient px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-glow transition-all active:scale-95"
      >
        Get Started <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
