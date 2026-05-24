import { Link } from "react-router-dom";
import { useState } from "react";
import { Mail, Globe2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { captureLead } from "@/lib/nocobase";
import PaymentMethodsBanner from "@/components/PaymentMethodsBanner";

export default function Footer() {
  const { user, isAdmin, signOut } = useAuth();
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
            <Link to="/" className="font-display text-lg font-bold text-foreground">Ride The Tide</Link>
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
              <Link to="/shop?category=Weight+Loss" className="text-sm text-muted-foreground hover:text-foreground">Weight Loss</Link>
              <Link to="/shop?category=Growth+Hormone" className="text-sm text-muted-foreground hover:text-foreground">Growth Hormone</Link>
              <Link to="/shop?category=Healing" className="text-sm text-muted-foreground hover:text-foreground">Healing</Link>
              <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground">FAQ</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Ecosystem &amp; Trust</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a href="https://ridethetide.info" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">RTD Tracker ↗</a>
              <a href="https://capetownpeptideclub.co.za" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Cape Town Peptide Club ↗</a>
              <span>✓ Lab Tested · 99% Purity</span>
              <span className="inline-flex items-center gap-1.5"><Globe2 className="h-3.5 w-3.5" /> Cape Town, South Africa</span>
              <span className="pl-5 text-xs">🇿🇦 1–3 days · free over R1,500</span>
              <span>✓ Secure Checkout</span>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 flex flex-col items-center gap-3 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Ride The Tide. All rights reserved. For research purposes only.</p>
          <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
            <Link to="/impressum" className="hover:text-foreground">Impressum</Link>
            <span aria-hidden className="text-border">·</span>
            <Link to="/terms" className="hover:text-foreground">Terms &amp; Conditions</Link>
            <span aria-hidden className="text-border">·</span>
            <Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <span aria-hidden className="text-border">·</span>
            <Link to="/shipping" className="hover:text-foreground">Shipping Policy</Link>
            <span aria-hidden className="text-border">·</span>
            <Link to="/refund" className="hover:text-foreground">Refund Policy</Link>
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
