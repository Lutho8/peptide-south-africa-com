import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
          <img src={logo} alt="Ride The Tide logo" className="h-8 w-8" />
          Ride The Tide
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Home</Link>
          <Link to="/shop" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Shop</Link>
          <Link to="/research" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Research</Link>
          <Link to="/blog" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Blog</Link>
          <Link to="/faq" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">FAQ</Link>
          <a
            href="https://ridethetide.info"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Tracker
          </a>
          <a
            href="https://capetownpeptideclub.co.za"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Club
          </a>
          <Link
            to="/quiz"
            className="inline-flex items-center gap-2 rounded-lg bg-hero-gradient px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-95"
          >
            Get Started
          </Link>
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          <Link
            to="/quiz"
            className="inline-flex items-center rounded-lg bg-hero-gradient px-3.5 py-2 text-xs font-semibold text-primary-foreground"
          >
            Start
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border bg-card p-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link to="/" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground">Home</Link>
            <Link to="/shop" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground">Shop</Link>
            <Link to="/research" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground">Research</Link>
            <Link to="/faq" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground">FAQ</Link>
            <a
              href="https://ridethetide.info"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-foreground"
            >
              Tracker ↗
            </a>
            <a
              href="https://capetownpeptideclub.co.za"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-foreground"
            >
              Club ↗
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
