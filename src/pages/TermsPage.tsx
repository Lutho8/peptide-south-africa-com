import { Link } from "react-router-dom";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import SEO from "@/components/SEO";

const SITE_URL = "https://tide-shop-clone.lovable.app";

const termsSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/terms#page`,
  name: "Terms and Conditions — Ride The Tide",
  url: `${SITE_URL}/terms`,
  description:
    "Website Terms and Conditions of Use for Ride The Tide (Pty) Ltd. Educational content, dual-jurisdiction (South Africa + Germany / EU), user obligations, and disclaimers.",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  publisher: { "@id": `${SITE_URL}/#organization` },
  about: { "@type": "Thing", name: "Terms of Service" },
};

export default function TermsPage() {
  return (
    <>
      <SEO title="Terms &amp; Conditions" description="Ride The Tide terms of service — South African customers and Germany / EU customers. Research-use disclaimers, EU 14-day Widerrufsrecht, and prescription pathway terms." path="/terms" />
      <JsonLd data={termsSchema} />
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Terms", href: "/terms" }]} />
    <div className="container py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-foreground">Website Terms and Conditions of Use</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: April 2026</p>
        <p className="mt-4 text-sm text-muted-foreground">
          If you have concerns about any health condition, diagnosis, or treatment, please consult with a qualified healthcare professional.
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">1. Terms and Conditions of Use</h2>
            <p className="mt-3">
              Welcome to the Ride The Tide website and applications (collectively, "Website"). The content and information on this Website do not constitute licensed medical services or medical advice and are for educational and informational purposes only.
            </p>
            <p className="mt-3">
              By using this Website, you agree to be bound by these Terms and Conditions of Use ("Terms") and our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>. Please review them carefully.
            </p>
            <p className="mt-3">
              Ride The Tide (Pty) Ltd ("Ride The Tide", "we", "us") owns and manages the Website. You may only use the Website if you can form a binding contract with us and comply with these Terms and all applicable South African and international laws, rules, and regulations.
            </p>
            <p className="mt-3">
              We may alter these Terms without notice, and your continued use of the Website signifies agreement to any future changes. You are encouraged to review these Terms regularly. If you disagree, please do not use our Website.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">2. Access Governed by These Terms</h2>
            <p className="mt-3">
              These Terms govern your access to and use of this Website and any content provided on, from, or through our Website, our software, and any applications created by Ride The Tide. For a non-electronic copy, email <a href="mailto:support@ridethetide.info" className="text-primary hover:underline">support@ridethetide.info</a>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">3. Services and Features</h2>
            <p className="mt-3">
              The Website may offer services and features facilitating the coordination of health and wellness protocols. If you wish to utilise such services, you may be required to agree to additional agreements or licensing terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">4. Services Disclaimer</h2>
            <p className="mt-3">
              Ride The Tide is not a medical or healthcare provider. We do not recommend or endorse any specific tests, products, medications, or course of treatment. Protocol advisors operate independently and have sole discretion over protocol recommendations.
            </p>
            <p className="mt-3">
              Information is provided on an "as-is" basis. Ride The Tide disclaims all warranties, express or implied, including warranties of merchantability and fitness for a particular purpose.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">5. Account and Registration</h2>
            <p className="mt-3">
              To access certain features, you must register and create an account. You agree that information you provide is accurate and kept up to date. You are solely responsible for maintaining confidentiality of your account details and accept responsibility for all activities under your account.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">6. Information Collection, Use, and Disclosure</h2>
            <p className="mt-3">
              By using this Website, you agree to allow Ride The Tide to collect, use, and disclose your information under the terms provided in our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">7. No Medical Advice</h2>
            <p className="mt-3">
              This Website's content is provided for informational and educational purposes only. It does not constitute medical advice and is not intended to be a substitute for professional medical advice, diagnosis, or treatment. It is not intended to replace a relationship with a qualified healthcare professional or create a provider-patient relationship.
            </p>
            <p className="mt-3">
              If you have concerns about a medical condition, please consult a licensed healthcare professional. In an emergency, contact your local emergency services.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">8. User Acknowledgements</h2>
            <div className="mt-3 space-y-2">
              <p>As a condition of using the Website, you acknowledge and agree that:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>You are over the age of 18.</li>
                <li>You will not use Website services or content for commercial purposes.</li>
                <li>Corporate entities are not eligible for registration as a member.</li>
                <li>Your use of the Website may be revoked at any time at Ride The Tide's sole discretion.</li>
                <li>Ride The Tide may modify, suspend, or discontinue the Website at any time with or without notice.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">9. Privacy and Health Information</h2>
            <p className="mt-3">
              We take the privacy and confidentiality of our visitors seriously. Please read our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>. Do not use this Website to provide, transmit, or disclose any protected health information unless through a specifically designated secure portal.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">10. Payment and Billing</h2>
            <p className="mt-3">
              Prices are displayed in Euros (EUR) by default and can be switched to South African Rand (ZAR) using the currency
              toggle in the site header. You are charged in your selected currency at checkout via our payment partner NowPayments
              (PayPal, Visa, Mastercard, Apple Pay, Google Pay, SEPA, and major cryptocurrencies). Registered members consent to
              storage of payment methods for processing purposes.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">11. Permitted Use of Content</h2>
            <p className="mt-3">
              Unless otherwise stated, Ride The Tide owns all content on this Website, protected by South African and international copyright laws. You are granted a limited, personal, non-exclusive, and non-transferable licence to use and display the content, provided you comply with these Terms and do not modify any proprietary notices.
            </p>
            <p className="mt-3">
              You may not copy, reproduce, modify, republish, upload, post, transmit, or distribute any content in any commercial manner without prior written consent.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">12. Rules of Conduct</h2>
            <p className="mt-3">
              You expressly agree not to: deceive, harass, stalk, or harm other users; distribute spam; collect information about other users; use the Website for unlawful purposes; reverse engineer the Website; or upload malicious code. We reserve the right to terminate your use for violations.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">13. Minors</h2>
            <p className="mt-3">
              This Website does not knowingly collect personally identifiable information from individuals under the age of 18. If we inadvertently encounter such information, we will not knowingly disclose it to any third party.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">14. Disclaimer of Liability and No Warranty</h2>
            <p className="mt-3 uppercase font-semibold text-foreground/80">
              THE INFORMATION ON OUR WEBSITE IS PROVIDED ON AN "AS IS" BASIS. RIDE THE TIDE MAKES NO REPRESENTATIONS AND NO EXPRESS OR IMPLIED WARRANTIES CONCERNING THE CONTENT OR THIS WEBSITE.
            </p>
            <p className="mt-3 uppercase font-semibold text-foreground/80">
              TO THE FULLEST EXTENT PERMITTED BY SOUTH AFRICAN LAW, RIDE THE TIDE DISCLAIMS ALL EXPRESS OR IMPLIED WARRANTIES, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
            </p>
            <p className="mt-3">
              At all times, Ride The Tide's liability to any member shall not exceed the amount paid by you to Ride The Tide for services during the term of your membership.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">15. Third-Party Links</h2>
            <p className="mt-3">
              This Website may provide links to third-party websites. We are not responsible for the content or practices of any linked websites. Any links should not be construed as endorsements of those products or services.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">16. Indemnification</h2>
            <p className="mt-3">
              You agree to indemnify Ride The Tide against any claims, damages, losses, liabilities, costs, or expenses arising from third-party claims related to your use of this Website, failure to comply with applicable laws, or misrepresentations made in violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">17. Website Operation</h2>
            <p className="mt-3">
              We make all reasonable efforts to keep this Website operational. These efforts are subject to scheduled maintenance, unscheduled maintenance, and system outages. We do not warrant uninterrupted or error-free access.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">18. Intellectual Property</h2>
            <p className="mt-3">
              This Website's content is protected by applicable copyrights, trademarks, and proprietary rights under South African and international law. You agree not to sell, licence, modify, copy, distribute, or create derivative works from the content.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">19. No Warranty or Guarantee of Outcome</h2>
            <p className="mt-3">
              Ride The Tide does not guarantee or warrant that you will achieve any specific result from using our protocols or Website. Testimonials and examples are not guarantees of comparable results. Your results depend on your background, effort, health, and many other factors.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">20. Governing Law &amp; Jurisdiction</h2>
            <p className="mt-3">
              For South African customers, these Terms are governed by the laws of the Republic of South Africa, with disputes subject
              to the exclusive jurisdiction of the South African courts.
            </p>
            <p className="mt-3">
              For customers in Germany and the European Union, mandatory consumer-protection provisions of the customer's habitual
              residence remain unaffected (Art. 6 Rome I Regulation). Statutory rights including the 14-day right of withdrawal
              (§§ 355, 312g BGB) apply and are described in our <a href="/refund" className="text-primary hover:underline">Refund Policy</a>.
              We are not obliged to participate in alternative dispute resolution proceedings before a consumer arbitration board
              (Verbraucherschlichtungsstelle).
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">21. Severability</h2>
            <p className="mt-3">
              If any provision of these Terms is held to be unenforceable, that provision will be modified to the minimum extent necessary to make it enforceable. The rest of these Terms will remain in full effect.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">22. Entire Agreement</h2>
            <p className="mt-3">
              These Terms and our Privacy Policy constitute the entire agreement between you and Ride The Tide relating to this Website. Ride The Tide may amend these Terms at any time without prior notice.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">23. Subscriptions</h2>
            <div className="mt-3 space-y-3">
              <p><strong className="text-foreground/80">Included:</strong> One consultation per calendar month, booked through the usual scheduling process. Free last-minute rescheduling.</p>
              <p><strong className="text-foreground/80">Availability:</strong> Subscriptions are only available to users who have completed their initial consultation.</p>
              <p><strong className="text-foreground/80">Billing Cycle:</strong> The first subscription period runs from the date of purchase until the 1st of the following month. Renewals occur on the 1st of each month.</p>
              <p><strong className="text-foreground/80">Limitations:</strong> Unused consultations do not roll over. Additional consultations must be purchased separately. Missed consultations incur standard no-show fees.</p>
              <p><strong className="text-foreground/80">Refunds:</strong> Subscription payments are non-refundable except in exceptional circumstances.</p>
              <p><strong className="text-foreground/80">Cancellation:</strong> Users may cancel subscriptions at any time. Ride The Tide may cancel subscriptions for failed payments, policy violations, or at its sole discretion.</p>
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">24. Your Agreement</h2>
            <p className="mt-3">
              By your continued use of Ride The Tide's Website, you understand and acknowledge that you have read these Terms and Conditions and agree to be bound by them.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">25. Contact</h2>
            <p className="mt-3">
              For questions about these Terms, contact us at <a href="mailto:support@ridethetide.info" className="text-primary hover:underline">support@ridethetide.info</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
    </>
  );
}
