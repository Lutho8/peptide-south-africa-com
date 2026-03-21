export default function TermsPage() {
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-foreground">Terms & Conditions</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: March 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">1. Agreement to Terms</h2>
            <p className="mt-3">By accessing or using the Ride The Tide website and purchasing products from us, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our services.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">2. Research Use Only</h2>
            <p className="mt-3">All products sold by Ride The Tide are intended solely for in vitro research and laboratory use. Products are not intended for human or animal consumption, medical diagnosis, or therapeutic purposes. By purchasing, you confirm that you understand and agree to this restriction.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">3. Eligibility</h2>
            <p className="mt-3">You must be at least 18 years old to use our website and purchase products. By placing an order, you represent and warrant that you meet this age requirement.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">4. Product Information</h2>
            <p className="mt-3">We strive to provide accurate product descriptions, images, and pricing. However, we do not warrant that product information is error-free or complete. We reserve the right to correct any errors, update information, or cancel orders if pricing or product details are inaccurate.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">5. Orders & Payment</h2>
            <div className="mt-3 space-y-3">
              <p>All orders are subject to availability and acceptance. We reserve the right to refuse or cancel any order at our discretion. Payment is due at the time of purchase. We accept major credit cards and other payment methods displayed at checkout.</p>
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">6. Shipping & Delivery</h2>
            <p className="mt-3">Please refer to our <a href="/shipping" className="text-primary hover:underline">Shipping Policy</a> for detailed information on processing times, carriers, and delivery terms.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">7. Returns & Refunds</h2>
            <p className="mt-3">Please refer to our <a href="/refund" className="text-primary hover:underline">Refund Policy</a> for detailed information on eligibility, process, and timelines.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">8. Intellectual Property</h2>
            <p className="mt-3">All content on this website — including text, graphics, logos, images, and software — is the property of Ride The Tide and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our prior written consent.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">9. Limitation of Liability</h2>
            <p className="mt-3">To the fullest extent permitted by law, Ride The Tide shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our website or products. Our total liability shall not exceed the amount you paid for the relevant order.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">10. Changes to These Terms</h2>
            <p className="mt-3">We reserve the right to update these Terms & Conditions at any time. Changes take effect upon posting. Continued use of the site constitutes acceptance of the updated terms.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">11. Contact</h2>
            <p className="mt-3">For questions about these Terms, contact us at <a href="mailto:support@ridethetide.info" className="text-primary hover:underline">support@ridethetide.info</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
