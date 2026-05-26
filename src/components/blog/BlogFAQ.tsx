import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { FAQ } from "@/data/blog/types";

export default function BlogFAQ({ faqs }: { faqs: FAQ[] }) {
  if (!faqs?.length) return null;
  return (
    <section className="mt-12" aria-labelledby="post-faq">
      <h2 id="post-faq" className="mb-4 font-display text-3xl font-bold text-foreground">
        Frequently asked questions
      </h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-left text-base font-semibold">{f.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
