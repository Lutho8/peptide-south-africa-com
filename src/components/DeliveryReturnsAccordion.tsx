import { Truck, PackageCheck, RotateCcw } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

type SectionKey = "shipping" | "packaging" | "returns";

interface Props {
  defaultOpen?: SectionKey | null;
  className?: string;
}

export default function DeliveryReturnsAccordion({ defaultOpen = null, className }: Props) {
  return (
    <div className={cn("rounded-lg border border-border bg-card px-5", className)}>
      <Accordion
        type="single"
        collapsible
        defaultValue={defaultOpen ?? undefined}
      >
        <AccordionItem value="shipping" className="last:border-b-0">
          <AccordionTrigger className="text-left font-display font-semibold text-foreground">
            <span className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              Shipping &amp; Timing
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">
            <p className="mb-2 font-semibold text-foreground/90">🇿🇦 Cape Town, South Africa</p>
            <ul className="ml-1 flex flex-col gap-1.5">
              <li>• Same-day dispatch on orders placed before 14:00 SAST (Mon–Fri).</li>
              <li>• Local courier (The Courier Guy / Ramhis).</li>
              <li>• <span className="font-semibold text-foreground">1–3 business days</span> nationwide.</li>
              <li>• Flat <span className="font-semibold text-foreground">R89</span> · free shipping on orders over <span className="font-semibold text-foreground">R1,500</span>.</li>
              <li>• Tracking link emailed once the courier collects.</li>
            </ul>
            <p className="mt-4 text-xs italic text-muted-foreground">We currently ship within South Africa only.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="packaging" className="last:border-b-0">
          <AccordionTrigger className="text-left font-display font-semibold text-foreground">
            <span className="flex items-center gap-2">
              <PackageCheck className="h-4 w-4 text-trust" />
              Discreet, Unbranded Packaging
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">
            <ul className="ml-1 flex flex-col gap-1.5">
              <li>• Plain, unmarked outer box — no Peptide South Africa branding, logos, or product references on the exterior.</li>
              <li>• Sealed, temperature-stable inner packaging with a silica desiccant.</li>
              <li>• Sender shown on the waybill as a neutral fulfilment name.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="returns" className="last:border-b-0">
          <AccordionTrigger className="text-left font-display font-semibold text-foreground">
            <span className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-primary" />
              Returns &amp; Guarantee
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">
            <ul className="ml-1 flex flex-col gap-1.5">
              <li>
                • <span className="font-semibold text-foreground">30-day satisfaction guarantee</span> on unopened, sealed vials.
              </li>
              <li>• Damaged-in-transit or incorrect items: replaced free of charge when reported within 48 hours of delivery.</li>
              <li>• For health and safety reasons, opened or reconstituted vials are non-returnable (industry standard).</li>
              <li>• Refunds processed to the original payment method within 5–7 business days of receiving the return.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
