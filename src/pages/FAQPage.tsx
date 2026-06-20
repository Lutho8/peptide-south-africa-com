import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedContent from "@/components/RelatedContent";
import { faqSchema, entityClusters } from "@/lib/seo";
import SEO from "@/components/SEO";

const faqs = [
  { question: "Do you ship peptides to all of South Africa?", answer: "Yes — we ship discreetly to all 9 provinces via courier. Orders placed before 12pm ship the same day. Delivery takes 1–3 business days to major centres (Johannesburg, Cape Town, Durban, Pretoria) and 3–5 days to outlying areas." },
  { question: "Are your peptides pharmaceutical grade?", answer: "All our peptides are HPLC-verified with a Certificate of Analysis (COA) from an independent third-party lab. We test for purity, identity, and bacterial endotoxins. COA documents are available on every product page." },
  { question: "How do I pay in South African Rand (ZAR)?", answer: "We accept EFT/direct bank transfer, credit/debit cards, and instant EFT via PayFast. All prices are displayed in ZAR with no hidden import fees." },
  { question: "What is the shelf life of your peptides?", answer: "Lyophilised (freeze-dried) peptides have a shelf life of 24 months when stored correctly at room temperature away from light and moisture. Once reconstituted with bacteriostatic water, use within 4 weeks and keep refrigerated at 2–8°C." },
  { question: "Do you offer a Certificate of Analysis for every product?", answer: "Yes. Every batch is independently tested via HPLC and mass spectrometry. COA documents are linked on each product page and verified via our COA verification portal." },
  { question: "What peptides do you stock for weight loss?", answer: "We stock semaglutide, tirzepatide (TZ2-Tirz), and retatrutide (RT3-Reta) — the three most clinically researched GLP-1 class peptides for weight management. We also carry MOTS-c for metabolic support." },
  { question: "What is the difference between semaglutide and tirzepatide?", answer: "Semaglutide is a GLP-1 receptor agonist (same mechanism as Ozempic/Wegovy). Tirzepatide is a dual GLP-1/GIP agonist that typically produces greater weight loss. Retatrutide (triple agonist) is the newest and shows the highest weight loss in clinical trials at up to 24% body weight." },
  { question: "How do I track my order?", answer: "Once your order ships you will receive a tracking number via email or SMS. You can track your parcel directly on our website at peptide-south-africa.com/track-order." },
  { question: "What is your return and refund policy?", answer: "We accept returns for damaged or incorrect items within 7 days of delivery. Due to the nature of research peptides, opened vials cannot be returned. See our full refund policy at peptide-south-africa.com/refund." },
  { question: "Do you offer peptide protocol advice?", answer: "We provide educational resources and a free protocol finder tool on our site. For personalised medical advice, consult a registered South African healthcare practitioner. Visit our Research section for guides on reconstitution, injection technique, and bloodwork." },
];

const faqsForSchema = faqs;

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
            Everything you need to know about Peptide South Africa's personalized peptide protocols, shipping, and quality standards.
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
