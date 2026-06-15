import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, ShoppingCart } from "lucide-react";
import { useState, type MouseEvent } from "react";
import { useCart } from "@/context/CartContext";
import logoIcon from "@/assets/logo-icon.png.asset.json";
import logoHorizontal from "@/assets/logo-horizontal.png.asset.json";

type Dropdown = { label: string; items: { label: string; to: string; external?: boolean; desc?: string }[] };

const DROPDOWNS: Dropdown[] = [
  {
    label: "Weight Loss",
    items: [
      { label: "RT3 (Reta)", to: "/product/rt3-reta", desc: "Triple agonist · best seller" },
      { label: "TZ-2 (Tirzepatide)", to: "/product/tz2-tirz", desc: "Dual GLP-1 / GIP" },
      { label: "Fat-Loss Protocol", to: "/fat-loss-protocol", desc: "12-week guided program" },
      { label: "Shop all Weight Loss", to: "/shop?category=GLP" },
    ],
  },
  {
    label: "Wellness & Longevity",
    items: [
      { label: "MOTS-C", to: "/product/mots-c", desc: "Mitochondrial peptide" },
      { label: "KLOW80", to: "/product/klow80", desc: "Longevity blend" },
      { label: "GHK-Cu", to: "/product/ghk-cu-50mg", desc: "Skin · hair · repair" },
      { label: "Shop all Longevity", to: "/shop?category=Longevity" },
    ],
  },
  {
    label: "Recovery",
    items: [
      { label: "BPC / TB-500 Blend", to: "/product/bpc-tb500-blend", desc: "Healing stack" },
      { label: "Tesamorelin", to: "/product/tesamorelin", desc: "GH releasing" },
      { label: "Shop all Recovery", to: "/shop?category=Healing" },
    ],
  },
  {
    label: "Explore",
    items: [
      { label: "Lab Testing & COAs", to: "/testing", desc: "Janoshik-verified · per-batch reports" },
      { label: "Research Hub", to: "/research", desc: "Protocols & studies" },
      { label: "Blog", to: "/blog", desc: "Guides & deep dives" },
      { label: "FAQ", to: "/faq", desc: "Common questions" },
      { label: "Find My Protocol (Quiz)", to: "/quiz", desc: "60-second match" },
      { label: "Join WhatsApp Community", to: "/community", desc: "Free · 2,000-member cap" },
      { label: "Tracker", to: "https://ridethetide.info", external: true },
      { label: "Cape Town Peptide Club", to: "https://capetownpeptideclub.co.za", external: true },
    ],
  },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const { totalItems, setIsCartOpen } = useCart();
  const location = useLocation();

  const handleLogoClick = (e: MouseEvent<HTMLAnchorElement>) => {
    setMobileOpen(false);
    setOpenIdx(null);
    if (location.pathname === "/") {
      e.preventDefault();
      const hero = document.getElementById("top");
      if (hero) {
        hero.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };


  const CartButton = ({ className = "" }: { className?: string }) => (
    <button
      type="button"
      onClick={() => setIsCartOpen(true)}
      aria-label={`Open cart (${totalItems} item${totalItems === 1 ? "" : "s"})`}
      className={`relative inline-flex items-center justify-center rounded-lg border border-border p-2 text-foreground transition-colors hover:bg-muted ${className}`}
    >
      <ShoppingCart className="h-5 w-5" />
      {totalItems > 0 && (
        <span className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] font-bold text-primary-foreground shadow">
          {totalItems}
        </span>
      )}
    </button>
  );


  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2 font-display text-xl font-bold text-foreground" aria-label="Peptide South Africa — home">
          <img src={logoHorizontal.url} alt="Peptide South Africa" className="hidden h-9 w-auto md:block" />
          <img src={logoIcon.url} alt="Peptide South Africa" className="h-9 w-9 md:hidden" />
          <span className="sr-only">Peptide South Africa</span>
        </Link>



        <nav className="hidden items-center gap-1 lg:flex">
          <Link to="/shop" className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Shop
          </Link>

          {DROPDOWNS.map((d, idx) => (
            <div
              key={d.label}
              className="relative"
              onMouseEnter={() => setOpenIdx(idx)}
              onMouseLeave={() => setOpenIdx(null)}
            >
              <button
                className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              >
                {d.label} <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {openIdx === idx && (
                <div className="absolute left-0 top-full z-50 w-72 rounded-xl border border-border bg-card p-2 shadow-card-hover">
                  {d.items.map((it) =>
                    it.external ? (
                      <a
                        key={it.label}
                        href={it.to}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-lg px-3 py-2 text-sm hover:bg-muted"
                      >
                        <div className="font-medium text-foreground">{it.label} ↗</div>
                        {it.desc && <div className="text-xs text-muted-foreground">{it.desc}</div>}
                      </a>
                    ) : (
                      <Link
                        key={it.label}
                        to={it.to}
                        onClick={() => setOpenIdx(null)}
                        className="block rounded-lg px-3 py-2 text-sm hover:bg-muted"
                      >
                        <div className="font-medium text-foreground">{it.label}</div>
                        {it.desc && <div className="text-xs text-muted-foreground">{it.desc}</div>}
                      </Link>
                    )
                  )}
                </div>
              )}
            </div>
          ))}

          <Link to="/affiliate" className="px-3 py-2 text-sm font-semibold text-primary hover:underline">
            Affiliate
          </Link>
          <Link to="/account" className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Account
          </Link>

          <Link
            to="/quiz?intent=consult"
            className="ml-2 inline-flex items-center gap-1.5 rounded-lg bg-hero-gradient px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-95"
          >
            Book Consult
          </Link>
          <CartButton className="ml-2" />
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <CartButton />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            className="inline-flex items-center justify-center rounded-lg p-2 text-foreground hover:bg-muted"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>


      {mobileOpen && (
        <nav className="border-t border-border bg-card p-4 lg:hidden">
          <div className="flex flex-col gap-2">
            <Link to="/" onClick={() => setMobileOpen(false)} className="rounded-lg px-2 py-2 text-sm font-medium text-foreground hover:bg-muted">Home</Link>
            <Link to="/shop" onClick={() => setMobileOpen(false)} className="rounded-lg px-2 py-2 text-sm font-medium text-foreground hover:bg-muted">Shop</Link>
            {DROPDOWNS.map((d) => (
              <details key={d.label} className="rounded-lg border border-border">
                <summary className="cursor-pointer list-none px-3 py-2 text-sm font-semibold text-foreground">
                  {d.label}
                </summary>
                <div className="flex flex-col gap-1 border-t border-border px-3 py-2">
                  {d.items.map((it) =>
                    it.external ? (
                      <a key={it.label} href={it.to} target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)} className="py-1.5 text-sm text-muted-foreground">
                        {it.label} ↗
                      </a>
                    ) : (
                      <Link key={it.label} to={it.to} onClick={() => setMobileOpen(false)} className="py-1.5 text-sm text-muted-foreground">
                        {it.label}
                      </Link>
                    )
                  )}
                </div>
              </details>
            ))}
            <Link to="/affiliate" onClick={() => setMobileOpen(false)} className="rounded-lg px-2 py-2 text-sm font-semibold text-primary hover:bg-muted">
              Affiliate Program
            </Link>
            <Link to="/account" onClick={() => setMobileOpen(false)} className="rounded-lg px-2 py-2 text-sm font-medium text-foreground hover:bg-muted">
              My Account
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
