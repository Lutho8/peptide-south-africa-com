import { Shield, FlaskConical, Truck, DollarSign } from "lucide-react";

const differentiators = [
  { icon: FlaskConical, title: "Third-party lab tested", description: "Every batch, every time. Certificates of Analysis are publicly available on each product page." },
  { icon: Shield, title: "99% purity guaranteed", description: "If it doesn't pass the test, it doesn't ship. Period." },
  { icon: Truck, title: "SA domestic shipping", description: "Fast, discreet, and reliable. No international customs delays or surprises." },
  { icon: DollarSign, title: "Honest pricing", description: "We don't inflate margins to fund glossy marketing. You pay for the peptide, not the packaging." },
];

export default function AboutPage() {
  return (
    <div className="container py-16">
      {/* Intro */}
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-medium uppercase tracking-wider text-primary">Who We Are</span>
        <h1 className="mt-2 font-display text-4xl font-bold text-foreground">Research Peptides. Priced for Everyone.</h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
          Born from the idea that being a better you doesn't have to cost a fortune. At Ride The Tide, we believe every researcher deserves access to high-quality, lab-tested peptides without the premium markup.
        </p>
      </div>

      {/* Stats */}
      <div className="mx-auto mt-16 grid max-w-3xl gap-8 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-6 text-center shadow-card">
          <p className="font-display text-3xl font-bold text-primary">5,000+</p>
          <p className="mt-1 text-sm text-muted-foreground">Vials Shipped</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 text-center shadow-card">
          <p className="font-display text-3xl font-bold text-primary">2,800+</p>
          <p className="mt-1 text-sm text-muted-foreground">Orders Fulfilled</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 text-center shadow-card">
          <p className="font-display text-3xl font-bold text-primary">99%</p>
          <p className="mt-1 text-sm text-muted-foreground">Purity Guaranteed</p>
        </div>
      </div>

      {/* Why Pepkits */}
      <div className="mx-auto mt-20 max-w-3xl">
        <div className="text-center">
          <span className="text-sm font-medium uppercase tracking-wider text-primary">What Sets Us Apart</span>
          <h2 className="mt-2 font-display text-3xl font-bold text-foreground">Why Pepkits?</h2>
          <p className="mt-4 text-muted-foreground">
            There's no shortage of peptide suppliers out there. What's rare is one that actually stands behind its product. Here's what makes us different:
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {differentiators.map((item, i) => (
            <div key={i} className="flex gap-4 rounded-lg border border-border bg-card p-6 shadow-card">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-base font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transparency Commitment */}
      <div className="mx-auto mt-20 max-w-3xl">
        <div className="text-center">
          <span className="text-sm font-medium uppercase tracking-wider text-primary">Quality First</span>
          <h2 className="mt-2 font-display text-3xl font-bold text-foreground">Our Commitment to Transparency</h2>
        </div>

        <blockquote className="mt-10 rounded-lg border-l-4 border-primary bg-card p-6 shadow-card">
          <p className="text-lg italic text-foreground">
            "If you can't show a researcher exactly what's in their vial, you have no business selling it to them."
          </p>
          <footer className="mt-3 text-sm font-semibold text-primary">— Pepkits</footer>
        </blockquote>

        <div className="mt-8 space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Every product in our catalog is independently tested by a third-party laboratory before it reaches you. The Certificate of Analysis — showing purity, identity, and concentration — is linked directly on every product page. No digging. No asking. Just the data, front and center.
          </p>
          <p>
            We believe the research community deserves better than vague quality claims and hidden sourcing. That's not how we operate, and it never will be.
          </p>
        </div>
      </div>

      {/* Research Use Disclaimer */}
      <div className="mx-auto mt-20 max-w-3xl rounded-lg border border-border bg-muted p-8 text-center">
        <h3 className="font-display text-lg font-semibold text-foreground">For Research Use Only</h3>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          All products sold by Pepkits are strictly intended for in vitro research and laboratory use only. They are not intended for human consumption, veterinary use, or any clinical application. By purchasing from our store, you confirm that you are a qualified researcher and will use these compounds accordingly.
        </p>
      </div>
    </div>
  );
}
