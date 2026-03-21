import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  { q: "What are peptides?", a: "Peptides are short chains of amino acids that serve as building blocks for proteins. They play crucial roles in biological processes and are widely studied for their therapeutic potential." },
  { q: "Are your peptides lab tested?", a: "Yes, every batch is independently tested by third-party laboratories. Each order includes a Certificate of Analysis (COA) confirming 99%+ purity." },
  { q: "How long does shipping take?", a: "Most orders ship within 24 hours and arrive within 3-5 business days. Free shipping is included on all orders." },
  { q: "Do you ship internationally?", a: "We currently ship to the United States, Canada, and select international destinations. Check our shipping page for details." },
  { q: "What payment methods do you accept?", a: "We accept all major credit cards, debit cards, and cryptocurrency. All transactions are encrypted and secure." },
  { q: "Can I return a product?", a: "We offer a satisfaction guarantee. If you're not happy with your purchase, contact us within 30 days for a full refund." },
  { q: "Are peptides legal?", a: "Research peptides are legal to purchase in most jurisdictions for research and educational purposes. They are not intended for human consumption." },
  { q: "How should peptides be stored?", a: "Unreconstituted peptides should be stored in a cool, dry place. Once reconstituted, store refrigerated and use within the recommended timeframe noted in the included protocol." },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="container py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-foreground text-center">Frequently Asked Questions</h1>
        <p className="mt-3 text-center text-muted-foreground">Everything you need to know about Ride The Tide and our products.</p>

        <div className="mt-10 flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <button
              key={i}
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full rounded-lg border border-border bg-card p-5 text-left shadow-card transition-all hover:shadow-card-hover"
            >
              <div className="flex items-center justify-between">
                <span className="font-display font-semibold text-foreground">{faq.q}</span>
                {open === i ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>
              {open === i && (
                <p className="mt-3 text-sm text-muted-foreground">{faq.a}</p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
