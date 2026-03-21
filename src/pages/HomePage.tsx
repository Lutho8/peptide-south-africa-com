import { Link } from "react-router-dom";
import { ArrowRight, Shield, Truck, FlaskConical, Star, CheckCircle, Package } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import heroImage from "@/assets/product-hero.jpg";

const testimonials = [
  { name: "Dr. M. Chen", role: "Research Director", text: "The quality and purity of Ride The Tide products are consistently excellent. Our lab relies on them for reproducible results.", rating: 5 },
  { name: "Sarah K.", role: "Independent Researcher", text: "Fast shipping, great documentation, and COA with every order. Exactly what serious researchers need.", rating: 5 },
  { name: "James R.", role: "PhD Candidate", text: "Best value in the market without compromising on purity. The research protocols included are incredibly helpful.", rating: 5 },
];

const steps = [
  { icon: FlaskConical, title: "Choose Your Peptide", description: "Browse our curated selection of research-grade peptides with variant options." },
  { icon: Shield, title: "Verified Quality", description: "Every product is lab-tested with ≥99% purity and includes a Certificate of Analysis." },
  { icon: Truck, title: "SA Domestic Shipping", description: "Fast, discreet domestic shipping. Most orders arrive within 1-3 business days." },
  { icon: CheckCircle, title: "Start Research", description: "Follow included protocols and guides to begin your research journey." },
];

const benefits = [
  { title: "Fat Loss", description: "GLP-1 pathway support for metabolic optimization and sustainable body composition research." },
  { title: "Lean Muscle Growth", description: "IGF-1 and GH secretagogue combinations for muscle protein synthesis studies." },
  { title: "Skin Health", description: "GHK-Cu and collagen-stimulating peptides for dermatological rejuvenation research." },
  { title: "Healing & Recovery", description: "BPC-157 and TB-500 stacks for accelerated tissue repair and regeneration." },
  { title: "Cognitive Enhancement", description: "Nootropic peptides like Semax and Selank for focus, memory, and neuroprotection." },
  { title: "Longevity", description: "Telomerase activation and mitochondrial support for cutting-edge aging research." },
];

export default function HomePage() {
  const featured = products.slice(0, 4);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-card">
        <div className="container flex flex-col items-center gap-8 py-20 md:flex-row md:py-28">
          <div className="flex-1 text-center md:text-left">
            <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              Research Peptides — Lab Tested
            </span>
            <h1 className="font-display text-4xl font-bold leading-tight text-foreground md:text-6xl">
              Peptides Priced{" "}
              <span className="text-gradient">Correctly.</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-muted-foreground">
              Lab-tested. ≥99% purity. SA domestic shipping. For researchers who refuse to overpay.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4 md:justify-start">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-lg bg-hero-gradient px-8 py-3.5 font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 active:scale-95"
              >
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/track-order"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-8 py-3.5 font-semibold text-foreground transition-all hover:bg-muted"
              >
                <Package className="h-4 w-4" /> Track Order
              </Link>
            </div>
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground md:justify-start">
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-trust" /> Lab Tested</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-trust" /> ≥99% Purity</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-trust" /> SA Shipping</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="relative mx-auto max-w-md">
              <div className="absolute -inset-4 rounded-2xl bg-hero-gradient opacity-10 blur-2xl" />
              <img src={heroImage} alt="Research peptide vial" className="relative rounded-2xl shadow-card-hover" />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Marquee */}
      <div className="overflow-hidden border-y border-border bg-muted py-3">
        <div className="marquee flex whitespace-nowrap">
          {Array(4).fill(null).map((_, i) => (
            <span key={i} className="mx-8 text-sm font-medium text-muted-foreground">
              SA Domestic Shipping &nbsp;·&nbsp; Lab Tested &nbsp;·&nbsp; ≥99% Purity &nbsp;·&nbsp; COA Available &nbsp;·&nbsp; Research Use Only &nbsp;·&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* Top Sellers */}
      <section className="container py-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <span className="text-sm font-medium uppercase tracking-wider text-primary">Best Selling</span>
            <h2 className="mt-1 font-display text-3xl font-bold text-foreground">Top Sellers</h2>
          </div>
          <Link to="/shop" className="hidden text-sm font-semibold text-primary hover:underline md:inline-flex items-center gap-1">
            Show All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="mt-6 text-center md:hidden">
          <Link to="/shop" className="text-sm font-semibold text-primary hover:underline">View All Products →</Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-card py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-primary">Simple Process</span>
            <h2 className="mt-1 font-display text-3xl font-bold text-foreground">How It Works</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container py-20">
        <div className="mb-12 text-center">
          <span className="text-sm font-medium uppercase tracking-wider text-primary">Why Ride The Tide</span>
          <h2 className="mt-1 font-display text-3xl font-bold text-foreground">Research Benefits</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-6 shadow-card transition-all hover:shadow-card-hover">
              <h3 className="font-display text-lg font-semibold text-foreground">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-card py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-primary">Social Proof</span>
            <h2 className="mt-1 font-display text-3xl font-bold text-foreground">Trusted by Researchers</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <div key={i} className="rounded-lg border border-border bg-background p-6 shadow-card">
                <div className="mb-3 flex gap-1">
                  {Array(t.rating).fill(null).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-badge text-badge" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">"{t.text}"</p>
                <div className="mt-4">
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-hero-gradient py-16">
        <div className="container text-center">
          <h2 className="font-display text-3xl font-bold text-primary-foreground">Ready to Start Your Research?</h2>
          <p className="mx-auto mt-3 max-w-lg text-primary-foreground/80">
            Browse our full catalog of lab-tested, research-grade peptides. SA domestic shipping on all orders.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-card px-8 py-3.5 font-semibold text-foreground shadow-card transition-all hover:shadow-card-hover active:scale-95"
          >
            Shop All Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
