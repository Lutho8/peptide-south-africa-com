import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="font-display text-lg font-bold text-foreground">Ride The Tide</Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Research-grade peptides. Lab-tested. 99% purity. Trusted by researchers worldwide.
            </p>
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
