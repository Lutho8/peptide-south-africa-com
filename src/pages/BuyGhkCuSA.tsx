import { getProductBySlug } from "@/data/products";
import { productSchema } from "@/lib/seo";
import { formatZAR } from "@/lib/price";
import { BAC_NOTICE, DELIVERY_NOTICE, DISCOUNT_POLICY } from "../../supabase/functions/_shared/catalog-release";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Shield, CheckCircle, Truck, MapPin, FlaskConical, ArrowRight } from "lucide-react";

const product = getProductBySlug("ghk-cu-50mg")!;
const PRODUCT_LD = productSchema(product);

const BREADCRUMB_LD = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.peptide-south-africa.com" },
    { "@type": "ListItem", "position": 2, "name": "Shop", "item": "https://www.peptide-south-africa.com/shop" },
    { "@type": "ListItem", "position": 3, "name": "Buy GHK-Cu in South Africa" }
  ]
};

export default function BuyGhkCuSA() {
  return (
    <>
      <SEO
        title="Buy GHK-Cu in South Africa | Copper Peptide Research Vial"
        description={`${product.name}: current South African single-vial, 3-pack and 5-pack prices. BAC water sold separately. Check report availability.`}
        path="/buy-ghk-cu-south-africa"
        type="product"
        keywords="buy GHK-Cu south africa, copper peptide south africa, GHK-Cu SA, buy copper peptide ZAR, anti-aging peptide south africa"
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
            <span className="text-foreground">Buy GHK-Cu in South Africa</span>
          </nav>

          {/* Hero */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-4">
              <MapPin className="w-3 h-3" /> Cape Town, South Africa
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{product.name} in South Africa</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">{product.shortDescription} Current offer: {product.strength} per vial. {product.documentationPending ? "Matching-strength source documentation pending." : "Source report available; check its sample and batch scope."}</p>
          </div>

          {/* Trust bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {[
              { icon: <Shield className="w-5 h-5 text-primary" />, text: "Explicit vial strength" },
              { icon: <FlaskConical className="w-5 h-5 text-primary" />, text: "Check report status" },
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
                <h2 className="text-xl font-bold text-foreground mb-1">{product.name}</h2>
                <p className="text-sm text-muted-foreground">Tripeptide copper complex</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{formatZAR(product.price)}</p>
                <p className="text-xs text-muted-foreground">ZAR · single vial</p>
              </div>
            </div>

            <ul className="space-y-2 mb-6">
              {[
                `${product.strength} in each vial; current SKU ${product.sku}`,
                "3-pack: 15% off. 5-pack: 20% off. Pack totals rounded once.",
                BAC_NOTICE, DELIVERY_NOTICE, DISCOUNT_POLICY,
                product.documentationPending ? "Matching-strength report pending; historical reports are not proof of this offer." : "Source report available: check the named sample and batch scope.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              to="/product/ghk-cu-50mg"
              className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-xl hover:bg-primary/90 transition-colors"
            >
              View GHK-Cu Product Page <ArrowRight className="w-4 h-4" />
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
                <h3 className="font-semibold text-foreground mb-1">Is GHK-Cu 50mg legal in South Africa?</h3>
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
                <p className="text-sm text-muted-foreground">{BAC_NOTICE}</p>
              </div>
            </div>
          </div>

          {/* CTA footer */}
          <div className="text-center">
            <Link
              to="/product/ghk-cu-50mg"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold py-3 px-8 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Order GHK-Cu 50mg <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-xs text-muted-foreground mt-3">For research purposes only. Not for human therapeutic use.</p>
          </div>

        </div>
      </div>
    </>
  );
}
