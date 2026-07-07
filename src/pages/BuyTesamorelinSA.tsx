import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Shield, CheckCircle, Truck, MapPin, FlaskConical, ArrowRight } from "lucide-react";

const PRODUCT_LD = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Tesamorelin",
  "description": "Buy Tesamorelin in South Africa. GHRH analog for GH secretion research, ZAR pricing, third-party tested ≥99% purity. Local Cape Town peptide supplier.",
  "brand": {
    "@type": "Brand",
    "name": "Peptide South Africa"
  },
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "ZAR",
    "lowPrice": "775",
    "highPrice": "2141",
    "availability": "https://schema.org/InStock",
    "areaServed": {
      "@type": "Country",
      "name": "South Africa"
    },
    "seller": {
      "@type": "Organization",
      "name": "Peptide South Africa",
      "url": "https://peptide-south-africa.com"
    }
  },
  "additionalProperty": [
    { "@type": "PropertyValue", "name": "Purity", "value": "≥99%" },
    { "@type": "PropertyValue", "name": "Category", "value": "GHRH analog" },
    { "@type": "PropertyValue", "name": "Testing", "value": "Third-party HPLC tested at Janoshik Analytical" }
  ]
};

const BREADCRUMB_LD = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://peptide-south-africa.com" },
    { "@type": "ListItem", "position": 2, "name": "Shop", "item": "https://peptide-south-africa.com/shop" },
    { "@type": "ListItem", "position": 3, "name": "Buy Tesamorelin in South Africa" }
  ]
};

export default function BuyTesamorelinSA() {
  return (
    <>
      <SEO
        title="Buy Tesamorelin in South Africa | GHRH Analog Research Peptide"
        description="Buy Tesamorelin in South Africa. GHRH analog for GH secretion research, ZAR pricing, third-party tested ≥99% purity. Local Cape Town peptide supplier."
        path="/buy-tesamorelin-south-africa"
        type="product"
        keywords="buy tesamorelin south africa, tesamorelin SA, GHRH peptide south africa, tesamorelin ZAR, growth hormone peptide SA"
        jsonLd={[PRODUCT_LD, BREADCRUMB_LD]}
      />

      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6">

          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/shop" className="hover:text-foreground">Shop</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Buy Tesamorelin in South Africa</span>
          </nav>

          {/* Hero */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-4">
              <MapPin className="w-3 h-3" /> Cape Town, South Africa
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Buy Tesamorelin in South Africa</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">Tesamorelin is a synthetic analog of growth hormone-releasing hormone (GHRH) studied for GH production stimulation and visceral adipose tissue reduction. HPLC-tested to ≥99% purity at Janoshik Analytical.</p>
          </div>

          {/* Trust bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {[
              { icon: <Shield className="w-5 h-5 text-primary" />, text: "≥99% Purity" },
              { icon: <FlaskConical className="w-5 h-5 text-primary" />, text: "HPLC Tested" },
              { icon: <MapPin className="w-5 h-5 text-primary" />, text: "SA-Based Supplier" },
              { icon: <Truck className="w-5 h-5 text-primary" />, text: "ZAR Pricing" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card text-center">
                {item.icon}
                <span className="text-xs font-medium text-foreground">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Pricing card */}
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 mb-8 shadow-card">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">Tesamorelin</h2>
                <p className="text-sm text-muted-foreground">GHRH analog</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">R775</p>
                <p className="text-xs text-muted-foreground">ZAR · single vial</p>
              </div>
            </div>

            <ul className="space-y-2 mb-6">
              {[
                "Third-party HPLC tested at Janoshik Analytical",
                "Certificate of Analysis included with every order",
                "South Africa-based supplier — ZAR pricing, no forex fees",
                "Batch-certified ≥99% purity guaranteed",
                "Fast local dispatch from Cape Town",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              to="/product/tesamorelin"
              className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-xl hover:bg-primary/90 transition-colors"
            >
              View Tesamorelin Product Page <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Why SA matters */}
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Why Buy From a South African Peptide Supplier?</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p><strong className="text-foreground">ZAR pricing.</strong> International suppliers quote in USD or EUR. With rand weakness, that adds 20–30% to your cost before shipping. We price entirely in ZAR with local payment methods.</p>
              <p><strong className="text-foreground">No customs delays.</strong> Importing peptides from overseas introduces SAHPRA customs exposure and unpredictable delays. Our stock ships domestically from Cape Town.</p>
              <p><strong className="text-foreground">Local support.</strong> Reconstitution guidance, dosing FAQs, and storage advice from a team that understands the South African climate and regulatory context.</p>
            </div>
          </div>

          {/* FAQ */}
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-1">Is Tesamorelin legal in South Africa?</h3>
                <p className="text-sm text-muted-foreground">Research peptides are sold for research purposes only and are not scheduled medicines under SAHPRA when used in a research context. They are not approved for therapeutic use without a practitioner.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">What purity is guaranteed?</h3>
                <p className="text-sm text-muted-foreground">≥99% purity — every batch is third-party HPLC tested at Janoshik Analytical. The Certificate of Analysis is downloadable directly from the product page.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">How do you ship in South Africa?</h3>
                <p className="text-sm text-muted-foreground">We dispatch from Cape Town via overnight courier. Cold-pack included for temperature-sensitive shipments. ZAR shipping fees — no international surcharges.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Do I need BAC water?</h3>
                <p className="text-sm text-muted-foreground">Yes — all lyophilised peptides require bacteriostatic water for reconstitution. BAC water is available from most compounding pharmacies in South Africa. See our <a href="https://peptide-south-africa.co.za" className="text-primary hover:underline">reconstitution guide</a> for step-by-step instructions.</p>
              </div>
            </div>
          </div>

          {/* CTA footer */}
          <div className="text-center">
            <Link
              to="/product/tesamorelin"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold py-3 px-8 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Order Tesamorelin <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-xs text-muted-foreground mt-3">For research purposes only. Not for human therapeutic use.</p>
          </div>

        </div>
      </div>
    </>
  );
}
