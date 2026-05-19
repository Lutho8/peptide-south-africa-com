import { Link } from "react-router-dom";
import { useState } from "react";
import { Mail, Globe2, FlaskConical, Languages } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { captureLead } from "@/lib/nocobase";
import PaymentMethodsBanner from "@/components/PaymentMethodsBanner";
import { useMarket, marketPath } from "@/hooks/useMarket";

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
        <div className="grid gap-8 md:grid-cols-5">
          <div className="md:col-span-2">
            <Link to={mp("/")} className="font-display text-lg font-bold text-foreground">Ride The Tide</Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Research-grade peptides. Lab-tested. 99% purity. Trusted by researchers worldwide.
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
              <Link to={mp("/shop")} className="text-sm text-muted-foreground hover:text-foreground">All Products</Link>
              <Link to={`${mp("/shop")}?category=Weight+Loss`} className="text-sm text-muted-foreground hover:text-foreground">Weight Loss</Link>
              <Link to={`${mp("/shop")}?category=Growth+Hormone`} className="text-sm text-muted-foreground hover:text-foreground">Growth Hormone</Link>
              <Link to={`${mp("/shop")}?category=Healing`} className="text-sm text-muted-foreground hover:text-foreground">Healing</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Legal</h4>
            <div className="flex flex-col gap-2">
              <Link to={mp("/impressum")} className="text-sm text-muted-foreground hover:text-foreground">Impressum</Link>
              <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground">FAQ</Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms & Conditions</Link>
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link>
              <Link to="/shipping" className="text-sm text-muted-foreground hover:text-foreground">Shipping Policy</Link>
              <Link to="/refund" className="text-sm text-muted-foreground hover:text-foreground">Refund Policy</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Trust & Safety</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span>✓ Lab Tested · 99% Purity</span>
              <span className="inline-flex items-center gap-1.5"><FlaskConical className="h-3.5 w-3.5" /> Laborgeprüfte Reinheit</span>
              <span className="inline-flex items-center gap-1.5"><Globe2 className="h-3.5 w-3.5" /> Shipping to 🇿🇦 South Africa &amp; 🇩🇪 Germany</span>
              <span className="pl-5 text-xs">🇿🇦 1–3 days · free over R1,500</span>
              <span className="pl-5 text-xs">🇩🇪 4–7 Werktage · gratis ab €120</span>
              <span>✓ Secure Checkout</span>
              <span className="inline-flex items-center gap-1.5 pt-1 text-xs"><Languages className="h-3 w-3" /> English · Deutsch · Afrikaans</span>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Ride The Tide. All rights reserved. For research purposes only.</p>
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
