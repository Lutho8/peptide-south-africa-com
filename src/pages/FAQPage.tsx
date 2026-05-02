import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedContent from "@/components/RelatedContent";
import { faqSchema, entityClusters } from "@/lib/seo";
import SEO from "@/components/SEO";

const faqs = [
  { question: "What are peptides?", answer: "Peptides are short chains of amino acids that serve as building blocks for proteins. They play crucial roles in biological processes including fat metabolism, tissue repair, immune function, and hormone regulation. Common research peptides include Retatrutide (RT3), BPC-157, Tesamorelin, and GHK-Cu." },
  { question: "How does a personalized peptide protocol work?", answer: "After completing our 2-minute assessment quiz, our system analyzes your goals, body composition, and health history to recommend a tailored protocol. This includes specific peptides, dosages, timing schedules, and weekly guidance — all reviewed against clinical research data." },
  { question: "What makes Ride The Tide different from other peptide suppliers?", answer: "We don't just sell peptides — we provide GP-led, structured protocols with German-certified compounds (≥99% purity). Every client gets personalized dosing, weekly check-ins, and a complete transformation system rather than standalone products." },
  { question: "Are your peptides lab tested?", answer: "Yes, every batch is independently tested by third-party laboratories. Each order includes a Certificate of Analysis (COA) confirming ≥99% purity. Our compounds meet strict German pharmaceutical quality standards." },
  { question: "How long does shipping take?", answer: "Most orders ship within 24 hours and arrive within 1–3 business days across South Africa. All shipments include tracking. We serve Cape Town, Johannesburg, Durban, Pretoria, and nationwide." },
  { question: "What results can I expect from a fat loss protocol?", answer: "Clients on our fat loss protocols typically see 8–12 kg reduction over 6–12 weeks when following the structured program. Results vary based on adherence, starting point, and individual metabolism. Our GLP-1 agonist protocols (RT3, TZ-2) target visceral fat specifically." },
  { question: "Can I book a consultation before starting?", answer: "Absolutely. After completing the quiz, you can book a free consultation via Zoom to discuss your results and protocol with our team. This helps ensure the recommended protocol aligns with your specific needs and health history." },
  { question: "What payment methods do you accept?", answer: "We accept all major credit cards, debit cards, and EFT payments. All transactions are encrypted and secure. Prices are listed in South African Rand (ZAR)." },
  { question: "How should peptides be stored?", answer: "Unreconstituted peptides should be stored in a cool, dry place. Once reconstituted, store refrigerated (2–8°C) and use within the recommended timeframe noted in the included protocol guide." },
  { question: "Are peptides legal in South Africa?", answer: "Research peptides are legal to purchase in South Africa for research and educational purposes. Our protocols are designed within the framework of GP-led health guidance using pharmaceutical-grade compounds." },
];

const faqsForSchema = faqs.map(f => ({ question: f.question, answer: f.answer }));

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <SEO title="Peptide FAQ — Dosing, Storage, Legality in South Africa" description="Answers to common questions about peptides in South Africa: legality, storage, dosing, shipping, and how our GP-led protocols work." path="/faq" />
      <div className="flex flex-col">
      <JsonLd data={faqSchema(faqsForSchema)} />
      <Breadcrumbs crumbs={[
        { label: "Home", href: "/" },
        { label: "FAQ" },
      ]} />

      <div className="container py-12">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl font-bold text-foreground text-center">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-center text-muted-foreground">
            Everything you need to know about Ride The Tide's personalized peptide protocols, shipping, and quality standards.
          </p>

          <div className="mt-10 flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="w-full rounded-lg border border-border bg-card shadow-card transition-all hover:shadow-card-hover"
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <span className="font-display font-semibold text-foreground">{faq.question}</span>
                  {open === i ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>
                {open === i && (
                  <div className="border-t border-border px-5 pb-5 pt-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <RelatedContent
        title="Learn More"
        links={[
          ...entityClusters.trust.links.filter(l => l.href !== "/faq"),
          ...entityClusters.fatLoss.links.slice(0, 1),
        ]}
      />
    </div>
  );
}
