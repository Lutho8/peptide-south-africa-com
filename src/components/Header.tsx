import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="font-display text-xl font-extrabold text-primary">
          RTD
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/shop" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Programs</Link>
          <a href="#how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">How It Works</a>
          <Link to="/research" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Research</Link>
          <Link
            to="/quiz"
            className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-all hover:opacity-90 active:scale-95"
          >
            Start Assessment
          </Link>
        </nav>

        <div className="flex items-center gap-4 md:hidden">
          <Link
            to="/quiz"
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
          >
            Start Assessment
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border bg-card p-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link to="/shop" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground">Programs</Link>
            <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground">How It Works</a>
            <Link to="/research" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground">Research</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
