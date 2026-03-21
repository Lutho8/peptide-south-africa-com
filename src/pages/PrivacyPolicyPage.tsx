export default function PrivacyPolicyPage() {
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-foreground">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: March 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">1. Introduction</h2>
            <p className="mt-3">Ride The Tide ("we", "us", or "our") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or place an order.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">2. Information We Collect</h2>
            <div className="mt-3 space-y-3">
              <h3 className="font-semibold text-foreground/80">Personal Information</h3>
              <p>When you place an order or create an account, we may collect:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Name, email address, phone number</li>
                <li>Shipping and billing address</li>
                <li>Payment information (processed securely through third-party providers)</li>
              </ul>
              <h3 className="font-semibold text-foreground/80">Automatically Collected Information</h3>
              <p>We may collect device information, IP address, browser type, and usage data through cookies and analytics tools.</p>
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">3. How We Use Your Information</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Process and fulfill your orders</li>
              <li>Communicate order updates and support</li>
              <li>Improve our website and services</li>
              <li>Send promotional emails (you may opt out at any time)</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">4. Information Sharing</h2>
            <p className="mt-3">We do not sell your personal information. We may share your data with:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Shipping carriers to deliver your orders</li>
              <li>Payment processors to complete transactions</li>
              <li>Analytics services to improve our website</li>
              <li>Law enforcement when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">5. Data Security</h2>
            <p className="mt-3">We use industry-standard security measures to protect your personal data. However, no method of electronic transmission or storage is 100% secure. We cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">6. Cookies</h2>
            <p className="mt-3">Our website uses cookies to enhance your browsing experience, remember preferences, and analyze site traffic. You can manage cookie settings through your browser.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">7. Your Rights</h2>
            <p className="mt-3">Depending on your jurisdiction, you may have the right to access, correct, delete, or restrict processing of your personal data. Contact us at <a href="mailto:support@ridethetide.info" className="text-primary hover:underline">support@ridethetide.info</a> to exercise these rights.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">8. Changes to This Policy</h2>
            <p className="mt-3">We may update this Privacy Policy from time to time. Changes take effect upon posting. We encourage you to review this page periodically.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">9. Contact</h2>
            <p className="mt-3">For questions about this Privacy Policy, contact us at <a href="mailto:support@ridethetide.info" className="text-primary hover:underline">support@ridethetide.info</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
