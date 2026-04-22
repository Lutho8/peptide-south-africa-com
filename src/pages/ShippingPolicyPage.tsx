import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";

const SITE_URL = "https://tide-shop-clone.lovable.app";

const shippingSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/shipping#page`,
  name: "Shipping Policy — Ride The Tide",
  url: `${SITE_URL}/shipping`,
  description:
    "Ride The Tide shipping policy: same-day dispatch for orders before 2:00 PM ET, UPS and USPS carriers, tracking, pre-order timelines, and delivery responsibility.",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  publisher: { "@id": `${SITE_URL}/#organization` },
  about: { "@type": "Thing", name: "Shipping & Delivery" },
};

export default function ShippingPolicyPage() {
  return (
    <>
      <JsonLd data={shippingSchema} />
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Shipping Policy", href: "/shipping" }]} />
    <div className="container py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-foreground">Shipping Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Effective Date: 02/25/2026 · Company: Ride The Tide</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <p>Ride The Tide is committed to processing and shipping orders efficiently. Please review the following shipping terms carefully before placing your order.</p>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">1. Order Processing Times</h2>
            <div className="mt-3 space-y-3">
              <h3 className="font-semibold text-foreground/80">Standard Orders</h3>
              <ul className="list-disc space-y-1 pl-5">
                <li>Orders placed before 2:00 PM Eastern Time (ET) on a business day will be processed and shipped the same business day or the following morning.</li>
                <li>Orders placed after 2:00 PM ET will be processed and shipped on the next business day.</li>
              </ul>
              <h3 className="font-semibold text-foreground/80">Business Days</h3>
              <ul className="list-disc space-y-1 pl-5">
                <li>Business days are Monday through Friday, excluding federal holidays.</li>
                <li>No orders are shipped on Sundays.</li>
                <li>Orders placed on Saturday after 2:00 PM ET will not be processed or shipped until Monday (or the next business day if Monday is a holiday).</li>
              </ul>
              <p>Processing times refer to the time required to prepare and hand off the package to the carrier. They do not include carrier transit times.</p>
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">2. Pre-Order Shipments</h2>
            <div className="mt-3 space-y-3">
              <p>Pre-orders are classified separately from standard in-stock orders and are expected to ship within 2–3 weeks, unless otherwise stated on the product listing.</p>
              <p>Some pre-orders may ship sooner, while others may take longer due to factors outside of Ride The Tide's control, including but not limited to:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Customs clearance</li>
                <li>Supplier timelines</li>
                <li>Quality control and testing procedures</li>
                <li>Carrier delays</li>
                <li>Inventory intake timing</li>
              </ul>
              <p>By placing a pre-order, the customer acknowledges and accepts that shipping timelines are estimates only and may vary. Ride The Tide is not responsible for delays outside of its direct operational control.</p>
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">3. Shipping Methods</h2>
            <div className="mt-3 space-y-3">
              <p>Ride The Tide primarily utilizes the following shipping services:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>UPS Ground</li>
                <li>UPS Ground Select</li>
                <li>UPS Ground Select 3 Day</li>
                <li>UPS Ground Connect (in partnership with USPS)</li>
              </ul>
              <p>In certain circumstances, packages may be shipped via USPS or alternative methods depending on speed, logistics, or regional availability.</p>
              <p>The selected carrier and method are determined at Ride The Tide's discretion based on operational efficiency and delivery optimization. Transit times provided by carriers are estimates only and are not guaranteed unless explicitly stated by the carrier.</p>
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">4. Tracking & Delivery Responsibility</h2>
            <div className="mt-3 space-y-3">
              <p>Once an order has been shipped, the customer will receive tracking information. Ride The Tide's responsibility ends once the package is transferred to the carrier.</p>
              <p>If a package is delayed, marked delivered but not received, lost, or otherwise undelivered:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>The customer is responsible for initiating a claim directly with the shipping carrier.</li>
                <li>Due to order volume, Ride The Tide does not open claims on behalf of customers.</li>
                <li>Ride The Tide will provide shipment details upon request to assist with carrier claims.</li>
              </ul>
              <p>Failure to open a claim in a timely manner may limit recovery options through the carrier.</p>
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">5. Address Accuracy</h2>
            <div className="mt-3 space-y-3">
              <p>Customers are responsible for ensuring that shipping information is accurate and complete at checkout. Ride The Tide is not responsible for:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Incorrect addresses</li>
                <li>Undeliverable packages due to address errors</li>
                <li>Packages returned due to failed delivery attempts</li>
              </ul>
              <p>Additional shipping fees may apply for re-shipment.</p>
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">6. Delays Beyond Our Control</h2>
            <div className="mt-3 space-y-3">
              <p>Ride The Tide is not liable for delays caused by:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Carrier service disruptions</li>
                <li>Weather conditions</li>
                <li>Customs inspections</li>
                <li>Force majeure events</li>
                <li>High-volume shipping periods</li>
                <li>Supply chain interruptions</li>
              </ul>
              <p>All shipping timelines are estimates and are not guaranteed.</p>
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">7. Policy Acceptance</h2>
            <p className="mt-3">By placing an order with Ride The Tide, you acknowledge that you have read, understood, and agreed to this Shipping Policy.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
