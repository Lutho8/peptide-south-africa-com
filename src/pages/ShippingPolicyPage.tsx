import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import SEO from "@/components/SEO";
import { buildAlternates } from "@/hooks/useMarket";

const SITE_URL = "https://www.peptide-south-africa.com";

const shippingSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/shipping#page`,
  name: "Shipping Policy — Peptide South Africa",
  url: `${SITE_URL}/shipping`,
  description:
    "Peptide South Africa shipping policy: in-house Cape Town packing, PostNet-to-Door or PostNet-to-PostNet delivery, tracking, and free shipping over R1,500.",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  publisher: { "@id": `${SITE_URL}/#organization` },
  about: { "@type": "Thing", name: "Shipping & Delivery" },
};

export default function ShippingPolicyPage() {
  return (
    <>
      <SEO
        title="Shipping Policy — South Africa"
        description="In-house Cape Town packing with PostNet-to-Door or PostNet-to-PostNet delivery. Tracking included and free shipping over R1,500."
        path="/shipping"
        lang="en"
        alternates={buildAlternates("/shipping")}
      />
      <JsonLd data={shippingSchema} />
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Shipping Policy", href: "/shipping" }]} />
      <div className="container py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-3xl font-bold text-foreground">Shipping Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">Effective: May 2026 · Cape Town, South Africa</p>

          <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
            <p>
              Peptide South Africa dispatches all orders from our Cape Town fulfilment hub. Please review the shipping terms below
              before placing your order.
            </p>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground">1. Order Processing &amp; Dispatch</h2>
              <ul className="mt-3 list-disc space-y-1 pl-5">
                <li>Orders released before <span className="font-semibold text-foreground">12:00 SAST</span> are normally handed to PostNet the same business day, Monday–Thursday.</li>
                <li>Orders placed after the cut-off ship on the next business day.</li>
                <li>East London and other longer-distance parcels are normally dispatched Monday–Wednesday.</li>
                <li>No dispatch on weekends or South African public holidays.</li>
              </ul>
              <p className="mt-3">Processing time refers to preparing and handing the package to the carrier; it does not include carrier transit time.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground">2. Estimated Delivery Times</h2>
              <div className="mt-3 overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/60 text-foreground">
                    <tr>
                      <th className="px-4 py-2 font-semibold">Region</th>
                      <th className="px-4 py-2 font-semibold">Carrier</th>
                      <th className="px-4 py-2 font-semibold">Window</th>
                      <th className="px-4 py-2 font-semibold">Free over</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-t border-border">
                      <td className="px-4 py-2">PostNet-to-Door</td>
                      <td className="px-4 py-2">PostNet</td>
                      <td className="px-4 py-2">1–3 business days</td>
                      <td className="px-4 py-2 font-semibold text-foreground">R1,500</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="px-4 py-2">PostNet-to-PostNet collection</td>
                      <td className="px-4 py-2">PostNet</td>
                      <td className="px-4 py-2">2–3 business days</td>
                      <td className="px-4 py-2 font-semibold text-foreground">R1,500</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3">All windows are carrier estimates and are not guaranteed unless explicitly stated.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground">3. Pre-Order Shipments</h2>
              <p className="mt-3">
                Pre-orders are classified separately from standard in-stock orders and ship within 2–3 weeks unless otherwise stated.
                Delays may arise from supplier timelines, QC testing, carrier disruption, or inventory intake.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground">4. Tracking &amp; Delivery Responsibility</h2>
              <p className="mt-3">
                Once handed over, your PostNet tracking number is added to your order tracker. Branch-collection customers should wait for the
                collection notification before visiting the selected PostNet branch. Contact our support team if a parcel is delayed or the
                tracking status appears incorrect so we can assist with the carrier enquiry.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground">5. Address Accuracy</h2>
              <p className="mt-3">
                Door-delivery customers must provide a complete address and reachable mobile number. Branch-collection customers must enter the
                exact PostNet branch name. Address or branch corrections after handover may incur an additional fee.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground">6. Discreet Packaging</h2>
              <p className="mt-3">
                All orders ship in plain, unmarked outer boxes with a neutral sender name on the waybill. No Peptide South Africa branding,
                logos, or product references appear on the exterior.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground">7. PAXI</h2>
              <p className="mt-3">
                PAXI is not offered for peptide orders. It may be used only for eligible accessory-only or merchandise parcels when that option
                is shown at checkout.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground">8. Policy Acceptance</h2>
              <p className="mt-3">By placing an order you acknowledge that you have read, understood, and agreed to this Shipping Policy.</p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
