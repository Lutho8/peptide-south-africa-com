import { Link } from "react-router-dom";
import { useState } from "react";
import { Mail } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-5">
          <div className="md:col-span-2">
            <Link to="/" className="font-display text-lg font-bold text-foreground">Ride The Tide</Link>
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
              <Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground">All Products</Link>
              <Link to="/shop?category=Weight+Loss" className="text-sm text-muted-foreground hover:text-foreground">Weight Loss</Link>
              <Link to="/shop?category=Growth+Hormone" className="text-sm text-muted-foreground hover:text-foreground">Growth Hormone</Link>
              <Link to="/shop?category=Healing" className="text-sm text-muted-foreground hover:text-foreground">Healing</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Company</h4>
            <div className="flex flex-col gap-2">
              <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">About Us</Link>
              <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground">FAQ</Link>
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Trust & Safety</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span>✓ Lab Tested</span>
              <span>✓ 99% Purity</span>
              <span>✓ Fast Shipping</span>
              <span>✓ Secure Checkout</span>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Ride The Tide. All rights reserved. For research purposes only.
        </div>
      </div>
    </footer>
  );
}
