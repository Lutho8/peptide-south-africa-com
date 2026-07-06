import { Link } from "react-router-dom";
import { useState } from "react";
import { Mail, Globe2, Phone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMarket, marketPath } from "@/hooks/useMarket";
import { captureLead } from "@/lib/nocobase";
import PaymentMethodsBanner from "@/components/PaymentMethodsBanner";
import { businessInfo } from "@/data/businessInfo";

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
            <Link to="/" className="font-display text-lg font-bold text-foreground">Peptide South Africa</Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Research-grade peptides. Lab-tested. 99% purity. Cape Town, South Africa.
            </p>
            {/* Newsletter */}
            <div className="mt-5">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Mail className="h-4 w-4 text-primary" /> Stay in the loop
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
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Shop</h4>
            <div className="flex flex-col gap-2">
              <Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground">All Products</Link>
              <Link to="/shop?category=GLP" className="text-sm text-muted-foreground hover:text-foreground">Weight Loss</Link>
              <Link to="/shop?category=Longevity" className="text-sm text-muted-foreground hover:text-foreground">Longevity</Link>
              <Link to="/shop?category=Healing" className="text-sm text-muted-foreground hover:text-foreground">Recovery</Link>
              <Link to="/shop?category=Skin+%26+Hair" className="text-sm text-muted-foreground hover:text-foreground">Skin &amp; Hair</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Learn</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/research" className="hover:text-foreground">Research Hub</Link>
              <Link to="/blog" className="hover:text-foreground">Blog</Link>
              <Link to="/faq" className="hover:text-foreground">FAQ</Link>
              <Link to="/quiz" className="hover:text-foreground">Find My Protocol</Link>
              <Link to="/affiliate" className="font-semibold text-primary hover:text-foreground">Affiliate Program</Link>
              <a href="https://ridethetide.info" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Tracker ↗</a>
              <a href="https://capetownpeptideclub.co.za" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Cape Town Peptide Club ↗</a>
              <address className="mt-2 flex flex-col gap-1 text-xs not-italic" itemScope itemType="https://schema.org/LocalBusiness">
                <span className="inline-flex items-start gap-1.5" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                  <Globe2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    <span itemProp="streetAddress">{businessInfo.streetAddress}</span>,{" "}
                    <span itemProp="addressLocality">{businessInfo.addressLocality}</span>,{" "}
                    <span itemProp="postalCode">{businessInfo.postalCode}</span>,{" "}
                    <span itemProp="addressRegion">{businessInfo.addressRegion}</span>, South Africa
                  </span>
                </span>
                <a href={`tel:${businessInfo.telephone}`} className="inline-flex items-center gap-1.5 hover:text-foreground" itemProp="telephone">
                  <Phone className="h-3.5 w-3.5 shrink-0" /> {businessInfo.telephoneDisplay}
                </a>
              </address>
              <span className="text-xs">✓ Lab Tested · 99% Purity · Secure Checkout</span>
            </div>
          </div>

        </div>
        <div className="mt-8 border-t border-border pt-6 flex flex-col items-center gap-3 px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Peptide South Africa. All rights reserved. For research purposes only.</p>
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
