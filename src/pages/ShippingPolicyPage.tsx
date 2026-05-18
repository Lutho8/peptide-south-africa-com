import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import SEO from "@/components/SEO";

const SITE_URL = "https://tide-shop-clone.lovable.app";

const shippingSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/shipping#page`,
  name: "Shipping Policy — Ride The Tide",
  url: `${SITE_URL}/shipping`,
  description:
    "Ride The Tide shipping policy: same-day dispatch in South Africa, 24-hour cut-off for Germany & the EU, DHL / Aramex / PEP Paxi carriers, tracking, and free-shipping thresholds.",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  publisher: { "@id": `${SITE_URL}/#organization` },
  about: { "@type": "Thing", name: "Shipping & Delivery" },
};

export default function ShippingPolicyPage() {
  return (
    <>
      <SEO
        title="Shipping Policy — South Africa & Germany / EU"
        description="Dual-market shipping: South Africa 1–3 business days (free over R1,500) · Germany & EU 4–7 business days via DHL (free over €75). Discreet, unbranded packaging."
        path="/shipping"
      />
      <JsonLd data={shippingSchema} />
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Shipping Policy", href: "/shipping" }]} />
      <div className="container py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-3xl font-bold text-foreground">Shipping Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">Effective: May 2026 · Markets served: South Africa, Germany &amp; the EU</p>

          <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
            <p>
              Ride The Tide dispatches orders from two regional hubs: Johannesburg (for South African customers) and an EU
              fulfilment partner (for Germany &amp; the EU). Please review the shipping terms below before placing your order.
            </p>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground">1. Order Processing &amp; Dispatch</h2>
              <div className="mt-3 space-y-3">
                <h3 className="font-semibold text-foreground/80">South Africa</h3>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Same-day dispatch on orders placed before <span className="font-semibold text-foreground">14:00 SAST</span>, Monday–Friday.</li>
                  <li>Orders placed after the cut-off ship on the next business day.</li>
                  <li>No dispatch on Sundays or South African public holidays.</li>
                </ul>
                <h3 className="font-semibold text-foreground/80">Germany &amp; EU · Deutschland &amp; EU</h3>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Orders are picked, packed, and handed to DHL within <span className="font-semibold text-foreground">24 hours</span> of confirmation (Mon–Fri).</li>
                  <li>Bestellungen werden innerhalb von 24 Stunden an DHL übergeben.</li>
                  <li>No dispatch on Sundays or German federal holidays.</li>
                </ul>
                <p>Processing time refers to preparing and handing the package to the carrier; it does not include carrier transit time.</p>
              </div>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground">2. Estimated Delivery Times</h2>
              <div className="mt-3 overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/60 text-foreground">
                    <tr>
                      <th className="px-4 py-2 font-semibold">Market</th>
                      <th className="px-4 py-2 font-semibold">Carrier</th>
                      <th className="px-4 py-2 font-semibold">Window</th>
                      <th className="px-4 py-2 font-semibold">Free over</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-t border-border">
                      <td className="px-4 py-2">South Africa — metro</td>
                      <td className="px-4 py-2">Aramex / PEP Paxi</td>
                      <td className="px-4 py-2">1–3 business days</td>
                      <td className="px-4 py-2 font-semibold text-foreground">R1,500</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="px-4 py-2">South Africa — regional</td>
                      <td className="px-4 py-2">Aramex / PEP Paxi</td>
                      <td className="px-4 py-2">2–5 business days</td>
                      <td className="px-4 py-2 font-semibold text-foreground">R1,500</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="px-4 py-2">Germany</td>
                      <td className="px-4 py-2">DHL</td>
                      <td className="px-4 py-2">4–7 Werktage</td>
                      <td className="px-4 py-2 font-semibold text-foreground">€75</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="px-4 py-2">EU (rest)</td>
                      <td className="px-4 py-2">DHL Parcel International</td>
                      <td className="px-4 py-2">5–10 business days</td>
                      <td className="px-4 py-2 font-semibold text-foreground">€75</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3">All windows are estimates from the carrier and are not guaranteed unless explicitly stated.</p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground">3. Pre-Order Shipments</h2>
              <p className="mt-3">
                Pre-orders are classified separately from standard in-stock orders and ship within 2–3 weeks unless otherwise stated.
                Delays may arise from customs clearance, supplier timelines, QC testing, carrier disruption, or inventory intake.
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
                logos, or product references appear on the exterior — same standard for both South Africa and the EU.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-foreground">7. Customs &amp; Import Duties (EU)</h2>
              <p className="mt-3">
                Shipments within the EU are dispatched from an EU fulfilment partner — no customs duties or import VAT apply for EU
                destinations. South African orders are dispatched domestically and incur no import duty.
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
