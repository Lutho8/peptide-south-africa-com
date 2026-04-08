import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-10">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <Link to="/shop" className="opacity-70 transition-opacity hover:opacity-100">Programs</Link>
          <a href="#how-it-works" className="opacity-70 transition-opacity hover:opacity-100">How It Works</a>
          <Link to="/research" className="opacity-70 transition-opacity hover:opacity-100">Research Hub</Link>
          <Link to="/faq" className="opacity-70 transition-opacity hover:opacity-100">Contact</Link>
          <Link to="/privacy" className="opacity-70 transition-opacity hover:opacity-100">Privacy Policy</Link>
        </div>

        <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-relaxed opacity-50">
          RTD provides clinical consultation and protocol design services. All peptides are prescribed by licensed physicians and dispensed through registered South African pharmacies. Results vary by individual. These statements have not been evaluated by the SAHPRA. This service is not intended to diagnose, treat, cure, or prevent any disease.
        </p>

        <p className="mt-4 text-center text-xs opacity-50">
          © {new Date().getFullYear()} Ride The Tide. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
