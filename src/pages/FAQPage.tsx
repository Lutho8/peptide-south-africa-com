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
  { question: "How long does shipping take in South Africa?", answer: "Same-day dispatch on orders placed before 14:00 SAST (Mon–Fri). Delivery is 1–3 business days to major metros (Cape Town, Johannesburg, Durban, Pretoria) and 2–5 business days to regional addresses, via Aramex / PEP Paxi. Free shipping on orders over R1,500." },
  { question: "Do you ship outside South Africa?", answer: "We currently ship within South Africa only. Same-day dispatch from Cape Town on orders placed before 14:00 SAST (Mon–Fri). Contact support@ridethetide.site if you'd like to be notified when other regions open." },
  { question: "Which currency am I charged in?", answer: "All prices are displayed and charged in South African Rand (ZAR / R). PayFast handles the secure checkout in ZAR." },
  { question: "What results can I expect from a fat loss protocol?", answer: "Clients on our fat loss protocols typically see 8–12 kg reduction over 6–12 weeks when following the structured program. Results vary based on adherence, starting point, and individual metabolism. Our GLP-1 agonist protocols (RT3, TZ-2) target visceral fat specifically." },
  { question: "Can I book a consultation before starting?", answer: "Absolutely. After completing the quiz, you can book a free consultation via Zoom to discuss your results and protocol with our team. This helps ensure the recommended protocol aligns with your specific needs and health history." },
  { question: "What payment methods do you accept?", answer: "We accept Visa, Mastercard, Instant EFT, Capitec Pay, SnapScan, Zapper, Mobicred and Masterpass — all processed securely through PayFast. PCI-DSS compliant and POPIA-aligned." },
  { question: "How should peptides be stored?", answer: "Unreconstituted peptides should be stored in a cool, dry place. Once reconstituted, store refrigerated (2–8°C) and use within the recommended timeframe noted in the included protocol guide." },
  { question: "Are research peptides legal to buy?", answer: "In South Africa, research peptides are legal to purchase for research and educational purposes by adults 18+. Our protocols are designed within these frameworks using pharmaceutical-grade compounds." },
];

// FAQ schema combines the visible FAQs with extra dual-market Q&A surfaced for search.
const schemaFaqs: { question: string; answer: string }[] = [
  ...faqs.map((f) => ({ question: f.question, answer: f.answer })),
  {
    question: "What purity are your peptides?",
    answer: "All our peptides are ≥99% purity, verified by independent third-party HPLC testing. A Certificate of Analysis (COA) is provided with every batch.",
  },
  {
    question: "Do you ship within South Africa?",
    answer: "Yes, we offer local courier delivery across South Africa via The Courier Guy / Aramex. Delivery takes 1–3 business days. Free shipping on orders over R1,500.",
  },
  {
    question: "Do you ship within South Africa?",
    answer: "Yes, we offer local courier delivery across South Africa. Delivery takes 1–3 business days. Free shipping on orders over R1,500.",
  },
  {
    question: "Are your peptides for human consumption?",
    answer: "No. All products are strictly for research purposes only and not for human consumption. Every product is clearly labeled 'Research Only — Not for Human Consumption'.",
  },
];
const faqsForSchema = schemaFaqs;

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <SEO title="Peptide Research FAQ | Dosing, Shipping, Purity" description="Common questions about research peptides answered. Shipping, purity testing, dosing protocols, storage & more. GP-led guidance for South Africa." path="/faq" />
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
    </>
  );
}
