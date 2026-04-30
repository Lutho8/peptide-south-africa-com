import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Avatar from "@/components/Avatar";

interface Testimonial {
  id: string;
  name: string;
  location: string | null;
  quote: string;
  rating: number;
  photo_url: string | null;
}

export default function CustomerProofStrip() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("testimonials")
      .select("id, name, location, quote, rating, photo_url")
      .eq("is_published", true)
      .order("display_order", { ascending: true })
      .limit(5)
      .then(({ data }) => {
        setItems(data ?? []);
        setLoading(false);
      });
  }, []);

  const featured = items[0];
  const portraits = items.slice(0, 5);

  return (
    <section className="bg-background py-12 md:py-16">
      <div className="container px-4">
        <div className="relative">
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:gap-4 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0">
            {(loading ? Array(5).fill(null) : portraits).map((p, i) => (
              <div
                key={p?.id ?? i}
                className="relative aspect-[4/5] w-[180px] flex-shrink-0 overflow-hidden rounded-2xl bg-muted shadow-card md:w-auto"
              >
                <Avatar
                  name={p?.name ?? "Customer"}
                  src={p?.photo_url ?? undefined}
                  alt={p ? `Customer testimonial — ${p.name}` : "Customer"}
                  className="h-full w-full transition-transform duration-700 hover:scale-105"
                />
              </div>
            ))}
          </div>

          {featured && (
            <div className="relative mx-auto mt-4 max-w-md rounded-2xl border border-border bg-card px-6 py-5 text-center shadow-card md:absolute md:left-1/2 md:bottom-6 md:mt-0 md:-translate-x-1/2">
              <div className="mb-2 flex justify-center gap-1">
                {Array(featured.rating).fill(null).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-badge text-badge" />
                ))}
              </div>
              <p className="font-display text-lg font-semibold text-foreground">"{featured.quote}"</p>
              <p className="mt-1 text-sm text-muted-foreground">
                — {featured.name}{featured.location ? `, ${featured.location}` : ""}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
