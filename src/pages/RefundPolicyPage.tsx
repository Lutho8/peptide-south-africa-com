import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import SEO from "@/components/SEO";
import { buildAlternates } from "@/hooks/useMarket";

const SITE_URL = "https://www.ridethetide.site";

const refundSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/refund#page`,
  name: "Refund Policy — Ride The Tide",
  url: `${SITE_URL}/refund`,
  description:
    "Refund eligibility for damaged, lost, or incorrect orders. Research-use products are non-returnable once opened. 2-hour cancellation window.",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  publisher: { "@id": `${SITE_URL}/#organization` },
  about: { "@type": "Thing", name: "Returns & Refunds" },
};

export default function RefundPolicyPage() {
  return (
    <>
      <SEO
        title="Refund Policy"
        description="Refunds for damaged, lost, or incorrect orders. Sealed vials only. 2-hour cancellation window for South African customers."
        path="/refund"
        lang="en"
        alternates={buildAlternates("/refund")}
      />
      <JsonLd data={refundSchema} />
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Refund Policy", href: "/refund" }]} />
      <div className="container py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-3xl font-bold text-foreground">Refund Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: May 2026</p>

          <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground">Research Use Only — No Returns on Opened Products</h2>
              <p className="mt-3">Due to the nature of our research products and compliance requirements, all sales are final once products are opened. We cannot accept returns of opened or used products.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground">Eligible Refunds</h2>
              <div className="mt-3 space-y-3">
                <p>We will issue a refund or replacement in the following situations:</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Product arrived visibly damaged</li>
                  <li>Wrong item was shipped</li>
                  <li>Package was lost in transit (after carrier investigation)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground">How to Request a Refund</h2>
              <ul className="mt-3 list-disc space-y-1 pl-5">
                <li>Contact us at <a href="mailto:support@ridethetide.info" className="text-primary hover:underline">support@ridethetide.info</a> within 7 days of delivery</li>
                <li>Include your order number and photos of any damaged/incorrect items</li>
                <li>We will review and respond within 2–3 business days</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground">Refund Processing</h2>
              <p className="mt-3">Approved refunds are processed to the original payment method within 5–10 business days.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground">Cancellations</h2>
              <p className="mt-3">Orders can be cancelled within 2 hours of placement. Once an order enters processing, it cannot be cancelled.</p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
