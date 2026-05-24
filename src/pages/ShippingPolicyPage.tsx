import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import SEO from "@/components/SEO";
import { buildAlternates } from "@/hooks/useMarket";

const SITE_URL = "https://www.ridethetide.site";

const shippingSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/shipping#page`,
  name: "Shipping Policy — Ride The Tide",
  url: `${SITE_URL}/shipping`,
  description:
    "Ride The Tide shipping policy: same-day dispatch from Cape Town, Aramex / PEP Paxi carriers, tracking, and free shipping over R1,500.",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  publisher: { "@id": `${SITE_URL}/#organization` },
  about: { "@type": "Thing", name: "Shipping & Delivery" },
};

export default function ShippingPolicyPage() {
  return (
    <>
      <SEO
        title="Shipping Policy — South Africa"
        description="Same-day dispatch from Cape Town before 14:00 SAST. Aramex / PEP Paxi 1–5 business days. Free shipping over R1,500. Discreet, unbranded packaging."
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
              Ride The Tide dispatches all orders from our Cape Town fulfilment hub. Please review the shipping terms below
              before placing your order.
            </p>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground">1. Order Processing &amp; Dispatch</h2>
              <ul className="mt-3 list-disc space-y-1 pl-5">
                <li>Same-day dispatch on orders placed before <span className="font-semibold text-foreground">14:00 SAST</span>, Monday–Friday.</li>
                <li>Orders placed after the cut-off ship on the next business day.</li>
                <li>No dispatch on Sundays or South African public holidays.</li>
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
                      <td className="px-4 py-2">Metro (Cape Town, JHB, DBN, PTA)</td>
                      <td className="px-4 py-2">Aramex / PEP Paxi</td>
                      <td className="px-4 py-2">1–3 business days</td>
                      <td className="px-4 py-2 font-semibold text-foreground">R1,500</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="px-4 py-2">Regional &amp; outlying</td>
                      <td className="px-4 py-2">Aramex / PEP Paxi</td>
                      <td className="px-4 py-2">2–5 business days</td>
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
                Once shipped, you receive an email with a carrier tracking link. Ride The Tide's responsibility ends when the package is
                handed to the carrier. For lost, delayed, or marked-as-delivered-but-not-received packages, please open a claim with the
                carrier directly; we will supply shipment details on request.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground">5. Address Accuracy</h2>
              <p className="mt-3">
                Customers are responsible for ensuring the shipping address is correct and complete. We are not liable for undeliverable
                packages caused by address errors; re-shipment may incur an additional fee.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground">6. Discreet Packaging</h2>
              <p className="mt-3">
                All orders ship in plain, unmarked outer boxes with a neutral sender name on the waybill. No Ride The Tide branding,
                logos, or product references appear on the exterior.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground">7. Policy Acceptance</h2>
              <p className="mt-3">By placing an order you acknowledge that you have read, understood, and agreed to this Shipping Policy.</p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
