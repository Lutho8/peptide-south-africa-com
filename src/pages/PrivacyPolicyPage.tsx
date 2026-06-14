import { Link } from "react-router-dom";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import SEO from "@/components/SEO";
import { buildAlternates } from "@/hooks/useMarket";

const SITE_URL = "https://www.peptide-south-africa.com";

const privacySchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/privacy#page`,
  name: "Privacy Policy — Peptide South Africa",
  url: `${SITE_URL}/privacy`,
  description:
    "POPIA-compliant Privacy Policy explaining how Peptide South Africa collects, uses, stores, and safeguards personal information.",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  publisher: { "@id": `${SITE_URL}/#organization` },
  about: { "@type": "Thing", name: "Privacy & Data Protection" },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <SEO
        title="Privacy Policy — POPIA Compliant"
        description="How Peptide South Africa handles your personal information, compliant with South Africa's Protection of Personal Information Act (POPIA)."
        path="/privacy"
        lang="en"
        alternates={buildAlternates("/privacy")}
      />
      <JsonLd data={privacySchema} />
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Privacy Policy", href: "/privacy" }]} />
    <div className="container py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-foreground">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: April 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">1. Introduction</h2>
            <p className="mt-3">
              Peptide South Africa (Pty) Ltd ("Peptide South Africa", "we", "us", or "our") respects your privacy and is committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our Website, use our services, or interact with us.
            </p>
            <p className="mt-3">
              This policy complies with the Protection of Personal Information Act (POPIA) of South Africa.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">2. Information We Collect</h2>
            <div className="mt-3 space-y-3">
              <h3 className="font-semibold text-foreground/80">Personal Information</h3>
              <p>When you use our Website, take our quiz, register, or purchase services, we may collect:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Full name</li>
                <li>Email address</li>
                <li>Phone number / WhatsApp number</li>
                <li>Shipping and billing address</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Health and wellness goals (as provided through our quiz and assessments)</li>
              </ul>

              <h3 className="font-semibold text-foreground/80">Automatically Collected Information</h3>
              <p>We may automatically collect:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Device information (type, operating system, browser)</li>
                <li>IP address and approximate location</li>
                <li>Usage data (pages visited, time spent, clicks)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">3. How We Use Your Information</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Process and fulfil your orders and protocol subscriptions</li>
              <li>Provide personalised protocol recommendations</li>
              <li>Communicate order updates, check-in reminders, and support</li>
              <li>Improve our Website, services, and user experience</li>
              <li>Send promotional communications (you may opt out at any time)</li>
              <li>Analyse trends and usage to develop new features and services</li>
              <li>Comply with legal obligations under South African law</li>
              <li>Prevent fraud and enhance security</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">4. Cookies and Tracking Technologies</h2>
            <div className="mt-3 space-y-3">
              <p>Our Website uses cookies and similar technologies to enhance your experience. Types of cookies we use:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li><strong className="text-foreground/80">Essential Cookies:</strong> Required for Website functionality, authentication, and security. Cannot be disabled.</li>
                <li><strong className="text-foreground/80">Analytics Cookies:</strong> Help us understand how visitors interact with our Website, measure traffic, and improve performance.</li>
                <li><strong className="text-foreground/80">Marketing Cookies:</strong> Used to deliver relevant advertisements and track campaign effectiveness.</li>
                <li><strong className="text-foreground/80">Preference Cookies:</strong> Remember your settings and preferences for a personalised experience.</li>
              </ul>
              <p>
                You can manage cookie preferences through your browser settings or our cookie consent banner. Disabling certain cookies may limit Website functionality.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">5. Information Sharing and Disclosure</h2>
            <p className="mt-3">We do not sell your personal information. We may share your data with:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong className="text-foreground/80">Service Providers:</strong> Shipping carriers, payment processors, and analytics services that assist in our operations.</li>
              <li><strong className="text-foreground/80">Protocol Advisors:</strong> To provide personalised protocol recommendations and support.</li>
              <li><strong className="text-foreground/80">Legal Authorities:</strong> When required by law, regulation, or legal process.</li>
              <li><strong className="text-foreground/80">Business Transfers:</strong> In connection with any merger, acquisition, or sale of assets.</li>
            </ul>
            <p className="mt-3">
              All third parties are required to protect your information and use it only for the purposes for which it was shared.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">6. Data Security</h2>
            <p className="mt-3">
              We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction. These include encryption, secure servers, and access controls. However, no method of electronic transmission or storage is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">7. Data Retention</h2>
            <p className="mt-3">
              We retain your personal information only for as long as necessary to fulfil the purposes outlined in this policy, comply with legal obligations, resolve disputes, and enforce our agreements. When data is no longer needed, it is securely deleted or anonymised.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">8. Your Rights — POPIA</h2>
            <p className="mt-3">Under POPIA you have the right to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Request access to your personal information</li>
              <li>Request correction of inaccurate or incomplete information</li>
              <li>Request deletion of your personal information</li>
              <li>Object to processing for direct marketing</li>
              <li>Withdraw consent for marketing communications at any time</li>
              <li>Lodge a complaint with the Information Regulator of South Africa</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at <a href="mailto:support@ridethetide.info" className="text-primary hover:underline">support@ridethetide.info</a>. We respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">9. International Data Transfers</h2>
            <p className="mt-3">
              Your information may be transferred to countries where our service providers operate. For cross-border transfers
              out of South Africa, we ensure POPIA's cross-border-transfer requirements (s. 72) are met.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">10. Children's Privacy</h2>
            <p className="mt-3">
              Our Website and services are not intended for individuals under the age of 18. We do not knowingly collect personal information from minors. If we become aware that we have collected information from a child under 18, we will take steps to delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">11. Third-Party Links</h2>
            <p className="mt-3">
              Our Website may contain links to third-party websites. We are not responsible for the privacy practices or content of these sites. We encourage you to review the privacy policies of any third-party sites you visit.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">12. Changes to This Policy</h2>
            <p className="mt-3">
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. The updated policy will be posted on this page with a revised "Last updated" date. We encourage you to review this page periodically.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">13. Contact Us</h2>
            <p className="mt-3">
              For questions, requests, or concerns about this Privacy Policy or how we handle your personal information, please contact us:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Email: <a href="mailto:support@ridethetide.info" className="text-primary hover:underline">support@ridethetide.info</a></li>
              <li>Website: <Link to="/" className="text-primary hover:underline">ridethetide.info</Link></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
    </>
  );
}
