import SEO from "@/components/SEO";
import Breadcrumbs from "@/components/Breadcrumbs";
import { buildAlternates } from "@/hooks/useMarket";

export default function ImpressumPage() {
  return (
    <>
      <SEO
        title="Legal Notice"
        description="Legal notice and company registration details for Peptide South Africa (Pty) Ltd, Cape Town, South Africa."
        path="/impressum"
        lang="en"
        alternates={buildAlternates("/impressum")}
      />
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Legal Notice" }]} />
      <div className="container max-w-3xl py-12">
        <h1 className="font-display text-3xl font-bold text-foreground">Legal Notice</h1>
        <p className="mt-2 text-sm text-muted-foreground">Company &amp; operator details</p>

        <section className="mt-8 rounded-lg border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-foreground">Operator</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <div className="grid grid-cols-[160px_1fr] gap-3">
              <dt className="font-semibold text-muted-foreground">Company</dt>
              <dd className="text-foreground">Peptide South Africa (Pty) Ltd</dd>
            </div>
            <div className="grid grid-cols-[160px_1fr] gap-3">
              <dt className="font-semibold text-muted-foreground">Director</dt>
              <dd className="text-foreground">Justice Lutho Kote</dd>
            </div>
            <div className="grid grid-cols-[160px_1fr] gap-3">
              <dt className="font-semibold text-muted-foreground">Registered address</dt>
              <dd className="text-foreground">
                Washington Street, Room 1 Block F<br />
                Cape Town, 7455<br />
                Republic of South Africa
              </dd>
            </div>
            <div className="grid grid-cols-[160px_1fr] gap-3">
              <dt className="font-semibold text-muted-foreground">Company registration</dt>
              <dd className="text-foreground">
                2026/105657/07
                <span className="block text-xs text-muted-foreground">
                  Registered with the CIPC (Companies and Intellectual Property Commission), South Africa
                </span>
              </dd>
            </div>
            <div className="grid grid-cols-[160px_1fr] gap-3">
              <dt className="font-semibold text-muted-foreground">Contact</dt>
              <dd className="text-foreground">
                <a href="mailto:support@peptide-south-africa.com" className="text-primary hover:underline">
                  support@peptide-south-africa.com
                </a>
              </dd>
            </div>
          </dl>
        </section>

        <section className="mt-6 rounded-lg border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-foreground">Responsible for content</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Justice Lutho Kote, address as above.
          </p>
        </section>

        <section className="mt-6 rounded-lg border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-foreground">Disclaimer</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Our content is created with the utmost care. We cannot, however, guarantee its accuracy, completeness or timeliness.
            All peptides offered are for research purposes only and not for human consumption.
          </p>
        </section>

        <section className="mt-6 rounded-lg border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-foreground">Copyright</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Content and works created by the operator on this website are subject to South African and international copyright law.
          </p>
        </section>
      </div>
    </>
  );
}
