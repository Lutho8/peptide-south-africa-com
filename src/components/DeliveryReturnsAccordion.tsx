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

/**
 * Centralized Delivery & Returns microcopy.
 * Edit copy here only — used on Checkout and Product pages.
 */
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
            <p className="mb-2 font-semibold text-foreground/90">South Africa</p>
            <ul className="ml-1 flex flex-col gap-1.5">
              <li>• Same-day dispatch on orders placed before 14:00 SAST (Mon–Fri).</li>
              <li>• Delivered nationwide via Aramex / PEP Paxi.</li>
              <li>
                • <span className="font-semibold text-foreground">1–3 business days</span> to major metros,{" "}
                <span className="font-semibold text-foreground">2–5 business days</span> to regional addresses.
              </li>
              <li>• Free shipping on orders over <span className="font-semibold text-foreground">R1,500</span>.</li>
            </ul>
            <p className="mb-2 mt-4 font-semibold text-foreground/90">Germany &amp; EU · Deutschland &amp; EU</p>
            <ul className="ml-1 flex flex-col gap-1.5">
              <li>• Dispatched via DHL within 24 h of order confirmation (Mon–Fri).</li>
              <li>
                • <span className="font-semibold text-foreground">4–7 Werktage</span> across Germany &amp; the EU; 7–10 days to remote regions.
              </li>
              <li>• Free shipping on orders over <span className="font-semibold text-foreground">€75</span> · ab 75 €.</li>
              <li>• Tracking link emailed as soon as the courier collects.</li>
            </ul>
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
              <li>• Plain, unmarked outer box — no Ride The Tide branding, logos, or product references on the exterior.</li>
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
                • <span className="font-semibold text-foreground">30-day satisfaction guarantee</span> on unopened, sealed vials (both markets).
              </li>
              <li>
                • <span className="font-semibold text-foreground">EU 14-day Widerrufsrecht</span>: customers in Germany / the EU may withdraw within 14 days of receipt on sealed, unopened items (§§ 355, 312g BGB).
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
