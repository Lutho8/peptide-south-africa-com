import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import MarketSwitcher from "@/components/MarketSwitcher";
import { useMarket, marketPath } from "@/hooks/useMarket";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { market } = useMarket();
  const mp = (p: string) => marketPath(p, market);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to={mp("/")} className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
          <img src={logo} alt="Ride The Tide logo" className="h-8 w-8" />
          Ride The Tide
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link to={mp("/")} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Home</Link>
          <Link to={mp("/impressum")} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Impressum</Link>
          <Link to="/research" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Research</Link>
          <Link to="/faq" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">FAQ</Link>
          <Link to={mp("/shop")} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Shop</Link>
          <MarketSwitcher />
          <CurrencySwitcher />
          <Link
            to="/quiz"
            className="inline-flex items-center gap-2 rounded-lg bg-hero-gradient px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-95"
          >
            Get Started
          </Link>
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          <MarketSwitcher />
          <CurrencySwitcher />
          <Link
            to="/quiz"
            className="inline-flex items-center rounded-lg bg-hero-gradient px-3.5 py-2 text-xs font-semibold text-primary-foreground"
          >
            Start
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border bg-card p-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link to={mp("/")} onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground">Home</Link>
            <Link to={mp("/impressum")} onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground">Impressum</Link>
            <Link to="/research" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground">Research</Link>
            <Link to="/faq" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground">FAQ</Link>
            <Link to={mp("/shop")} onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground">Shop</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
