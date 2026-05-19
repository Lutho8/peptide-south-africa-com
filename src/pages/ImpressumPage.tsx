import SEO from "@/components/SEO";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useMarket, marketPath, buildAlternates } from "@/hooks/useMarket";

export default function ImpressumPage() {
  const { market, lang } = useMarket();
  const mp = (p: string) => marketPath(p, market);
  const isDe = lang === "de";

  return (
    <>
      <SEO
        title={isDe ? "Impressum" : "Impressum / Legal Notice"}
        description={
          isDe
            ? "Impressum und Anbieterkennzeichnung gemäß § 5 TMG für Ride The Tide (Jenluko Investments (Pty) Ltd)."
            : "Legal notice and company registration details for Ride The Tide (Jenluko Investments (Pty) Ltd)."
        }
        path={mp("/impressum")}
        lang={lang}
        alternates={buildAlternates("/impressum")}
      />
      <Breadcrumbs crumbs={[{ label: "Home", href: mp("/") }, { label: "Impressum" }]} />
      <div className="container max-w-3xl py-12">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Impressum {isDe ? "" : "/ Legal Notice"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isDe
            ? "Anbieterkennzeichnung gemäß § 5 TMG"
            : "Provider information pursuant to § 5 TMG (German Telemedia Act)"}
        </p>

        <section className="mt-8 rounded-lg border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-foreground">
            {isDe ? "Anbieter / Betreiber" : "Operator"}
          </h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <div className="grid grid-cols-[160px_1fr] gap-3">
              <dt className="font-semibold text-muted-foreground">
                {isDe ? "Unternehmen" : "Company"}
              </dt>
              <dd className="text-foreground">Jenluko Investments (Pty) Ltd</dd>
            </div>
            <div className="grid grid-cols-[160px_1fr] gap-3">
              <dt className="font-semibold text-muted-foreground">
                {isDe ? "Handelsname" : "Trading as"}
              </dt>
              <dd className="text-foreground">Ride The Tide</dd>
            </div>
            <div className="grid grid-cols-[160px_1fr] gap-3">
              <dt className="font-semibold text-muted-foreground">
                {isDe ? "Inhaber / Vertretungs­berechtigter" : "Owner / Authorised representative"}
              </dt>
              <dd className="text-foreground">Justice Lutho Kote</dd>
            </div>
            <div className="grid grid-cols-[160px_1fr] gap-3">
              <dt className="font-semibold text-muted-foreground">
                {isDe ? "Sitz / Anschrift" : "Registered address"}
              </dt>
              <dd className="text-foreground">
                Washington Street, Room 1 Block F<br />
                Cape Town, 7455<br />
                {isDe ? "Republik Südafrika" : "Republic of South Africa"}
              </dd>
            </div>
            <div className="grid grid-cols-[160px_1fr] gap-3">
              <dt className="font-semibold text-muted-foreground">
                {isDe ? "Registernummer" : "Company registration"}
              </dt>
              <dd className="text-foreground">
                2026/105657/07
                <span className="block text-xs text-muted-foreground">
                  {isDe
                    ? "Eingetragen bei der CIPC (Companies and Intellectual Property Commission), Südafrika"
                    : "Registered with the CIPC (Companies and Intellectual Property Commission), South Africa"}
                </span>
              </dd>
            </div>
            <div className="grid grid-cols-[160px_1fr] gap-3">
              <dt className="font-semibold text-muted-foreground">
                {isDe ? "Kontakt" : "Contact"}
              </dt>
              <dd className="text-foreground">
                <a href="mailto:lutho.kote@relicom.de" className="text-primary hover:underline">
                  lutho.kote@relicom.de
                </a>
              </dd>
            </div>
          </dl>
        </section>

        <section className="mt-6 rounded-lg border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-foreground">
            {isDe ? "Verantwortlich für den Inhalt" : "Responsible for content"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isDe
              ? "Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV: Justice Lutho Kote, Anschrift wie oben."
              : "Responsible for content pursuant to § 18 (2) MStV: Justice Lutho Kote, address as above."}
          </p>
        </section>

        <section className="mt-6 rounded-lg border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-foreground">
            {isDe ? "Haftungsausschluss" : "Disclaimer"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isDe
              ? "Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Alle angebotenen Peptide sind ausschließlich für Forschungszwecke bestimmt und nicht für den menschlichen Verzehr."
              : "Our content is created with the utmost care. We cannot, however, guarantee its accuracy, completeness or timeliness. All peptides offered are for research purposes only and not for human consumption."}
          </p>
        </section>

        <section className="mt-6 rounded-lg border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-foreground">
            {isDe ? "Urheberrecht" : "Copyright"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isDe
              ? "Die durch den Betreiber erstellten Inhalte und Werke auf dieser Website unterliegen dem südafrikanischen und internationalen Urheberrecht."
              : "Content and works created by the operator on this website are subject to South African and international copyright law."}
          </p>
        </section>
      </div>
    </>
  );
}
