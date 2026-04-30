import { Star } from "lucide-react";
import c1 from "@/assets/customer-1.jpg";
import c2 from "@/assets/customer-2.jpg";
import c3 from "@/assets/customer-3.jpg";
import c4 from "@/assets/customer-4.jpg";
import c5 from "@/assets/customer-5.jpg";

const portraits = [
  { src: c1, alt: "Customer testimonial — Linda" },
  { src: c2, alt: "Customer testimonial — Naledi" },
  { src: c3, alt: "Customer testimonial — Thandi" },
  { src: c4, alt: "Customer testimonial — Sipho" },
  { src: c5, alt: "Customer testimonial — Adam" },
];

export default function CustomerProofStrip() {
  return (
    <section className="bg-background py-12 md:py-16">
      <div className="container px-4">
        <div className="relative">
          {/* portrait row */}
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:gap-4 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0">
            {portraits.map((p, i) => (
              <div
                key={i}
                className="relative aspect-[4/5] w-[180px] flex-shrink-0 overflow-hidden rounded-2xl shadow-card md:w-auto"
              >
                <img
                  src={p.src}
                  alt={p.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            ))}
          </div>

          {/* centered testimonial overlay */}
          <div className="relative mx-auto mt-4 max-w-md rounded-2xl border border-border bg-card px-6 py-5 text-center shadow-card md:absolute md:left-1/2 md:bottom-6 md:mt-0 md:-translate-x-1/2">
            <div className="mb-2 flex justify-center gap-1">
              {Array(5).fill(null).map((_, j) => (
                <Star key={j} className="h-4 w-4 fill-badge text-badge" />
              ))}
            </div>
            <p className="font-display text-lg font-semibold text-foreground">
              "This changed everything for me"
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              — Sarah M., Johannesburg
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
