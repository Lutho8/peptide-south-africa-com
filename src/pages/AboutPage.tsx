export default function AboutPage() {
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-medium uppercase tracking-wider text-primary">Who We Are</span>
        <h1 className="mt-2 font-display text-4xl font-bold text-foreground">Research Peptides. Priced for Everyone.</h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
          Born from the idea that being a better you doesn't have to cost a fortune. At Ride The Tide, we believe every researcher deserves access to high-quality, lab-tested peptides without the premium markup.
        </p>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Every product in our catalog is independently verified at 99%+ purity and ships with a Certificate of Analysis. We're not just selling peptides — we're building a community of informed researchers who demand transparency and value.
        </p>
      </div>

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
    </div>
  );
}
