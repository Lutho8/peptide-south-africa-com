import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import SEO from "@/components/SEO";
import { businessInfo } from "@/data/businessInfo";

const SITE = "https://www.peptide-south-africa.com";

const policySchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE}/editorial-policy#webpage`,
  name: "Editorial policy",
  url: `${SITE}/editorial-policy`,
  isPartOf: { "@id": `${SITE}/#website` },
  about: { "@id": `${SITE}/#organization` },
  inLanguage: "en-ZA",
};

const sections = [
  {
    title: "Who publishes our content",
    body: "Peptide South Africa (Pty) Ltd publishes the Peptide South Africa research blog. Articles are prepared by the Peptide South Africa Editorial team. The company director responsible for website content is identified in our Legal Notice.",
  },
  {
    title: "Evidence and sourcing",
    body: "We prioritise peer-reviewed papers, registered clinical trials, regulator publications, official product information and directly linked laboratory reports. References appear on the article page so readers can inspect the underlying source. Early, preclinical and observational evidence is labelled as such.",
  },
  {
    title: "Medical review and scope",
    body: "Our articles provide general education and research context, not individual medical advice, diagnosis or treatment. We distinguish approved medicines from investigational or unregistered compounds and direct readers to a registered healthcare practitioner for personal decisions.",
  },
  {
    title: "Commercial disclosure",
    body: "Peptide South Africa sells research catalogue products and may offer clinician-guided pathways. That commercial interest is disclosed because it may be relevant to how readers assess our coverage. Editorial claims must still be supported by the cited evidence and must not overstate what a study or laboratory report proves.",
  },
  {
    title: "Dates, updates and corrections",
    body: "Every article displays its publication and most recent update date. Material changes should update the date; cosmetic edits should not. If we identify a meaningful factual error, we correct the article and clarify the change where readers could otherwise be misled.",
  },
];

export default function EditorialPolicyPage() {
  return (
    <>
      <SEO
        title="Editorial Policy & Medical Content Standards"
        description="How Peptide South Africa sources, reviews, dates, corrects and commercially discloses its research and medical education content."
        path="/editorial-policy"
      />
      <JsonLd data={policySchema} />
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Editorial Policy" }]} />

      <main className="container max-w-3xl px-4 py-12 md:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Transparency</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">
          Editorial policy &amp; medical content standards
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          These standards explain who is responsible for our content, how we select sources and
          how we separate evidence-based education from our commercial activity.
        </p>

        <div className="mt-10 space-y-5">
          {sections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h2 className="font-display text-lg font-bold text-foreground">{section.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
            </section>
          ))}
        </div>

        <section className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <h2 className="font-display text-lg font-bold text-foreground">Contact the editorial team</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Send correction requests, source questions or editorial feedback to{" "}
            <a className="font-semibold text-primary hover:underline" href={`mailto:${businessInfo.email}`}>
              {businessInfo.email}
            </a>
            . Include the article URL and the specific statement you would like us to review.
          </p>
        </section>

        <p className="mt-8 text-xs text-muted-foreground">Last reviewed: 31 August 2026</p>
      </main>
    </>
  );
}
