import { Link } from "react-router-dom";
import { useState } from "react";
import { Mail, Globe2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMarket, marketPath } from "@/hooks/useMarket";
import { captureLead } from "@/lib/nocobase";
import PaymentMethodsBanner from "@/components/PaymentMethodsBanner";

const LEGAL_LINKS: { to: string; label: string }[] = [
  { to: "/impressum", label: "Impressum" },
  { to: "/terms", label: "Terms & Conditions" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/shipping", label: "Shipping Policy" },
  { to: "/refund", label: "Refund Policy" },
];

export default function Footer() {
  const { user, isAdmin, signOut } = useAuth();
  const { market } = useMarket();
  const mp = (p: string) => marketPath(p, market);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      captureLead({ source: "newsletter", email });
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="font-display text-2xl font-normal text-foreground tracking-tight">
              Peptide South Africa
            </Link>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              South Africa's first peptide-forward telehealth platform. Personalised programs for weight loss, longevity, recovery, energy and performance.
            </p>
            <div className="mt-5">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Mail className="h-4 w-4 text-accent" /> Stay in the loop
              </h4>
              {subscribed ? (
                <p className="mt-2 text-sm text-trust font-medium">Thanks for subscribing! 🎉</p>
              ) : (
                <form onSubmit={handleSubscribe} className="mt-2 flex gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
          <div>
            <h4 className="mb-3 font-display text-base font-normal text-foreground">Programs</h4>
            <div className="flex flex-col gap-2">
              <Link to="/assessment" className="text-sm font-semibold text-accent hover:text-foreground">Take the Assessment →</Link>
              <Link to="/shop?category=GLP" className="text-sm text-muted-foreground hover:text-foreground">Weight Loss</Link>
              <Link to="/shop?category=Longevity" className="text-sm text-muted-foreground hover:text-foreground">Longevity</Link>
              <Link to="/shop?category=Healing" className="text-sm text-muted-foreground hover:text-foreground">Recovery</Link>
              <Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground">All Programs</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-3 font-display text-base font-normal text-foreground">Learn</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/research" className="hover:text-foreground">Research Hub</Link>
              <Link to="/blog" className="hover:text-foreground">Blog</Link>
              <Link to="/faq" className="hover:text-foreground">FAQ</Link>
              <Link to="/affiliate" className="font-semibold text-accent hover:text-foreground">Affiliate Program</Link>
              <span className="mt-2 inline-flex items-center gap-1.5 text-xs"><Globe2 className="h-3.5 w-3.5" /> South Africa</span>
              <span className="text-xs">✓ GP-led · Lab Tested · POPIA-compliant</span>
            </div>
          </div>

        </div>
        <div className="mt-8 border-t border-border pt-6 flex flex-col items-center gap-3 px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Peptide South Africa. All rights reserved.</p>
          <p className="text-xs max-w-2xl">Where clinically required, a licensed physician will review your eligibility before treatment activation. Peptide programs are not a substitute for medical advice.</p>
          <nav
            aria-label="Legal"
            className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs"
          >
            {LEGAL_LINKS.map((link, i) => (
              <span key={link.to} className="inline-flex items-center gap-x-3 whitespace-nowrap">
                <Link to={mp(link.to)} className="whitespace-nowrap hover:text-foreground">
                  {link.label}
                </Link>
                {i < LEGAL_LINKS.length - 1 && (
                  <span aria-hidden className="text-border">·</span>
                )}
              </span>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-xs">
            {!user ? (
              <Link to="/auth" className="hover:text-foreground">Sign in</Link>
            ) : (
              <>
                {isAdmin && <Link to="/admin" className="hover:text-foreground">Admin</Link>}
                <button onClick={signOut} className="hover:text-foreground">Sign out</button>
              </>
            )}
          </div>
        </div>
      </div>
      <PaymentMethodsBanner />
    </footer>
  );
}
