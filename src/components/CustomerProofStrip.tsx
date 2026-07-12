import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TESTIMONIAL_CLIPS, type TestimonialClip } from "@/data/testimonialClips";

interface Testimonial {
  id: string;
  name: string;
  location: string | null;
  quote: string;
  rating: number;
  photo_url: string | null;
}

function ClipTile({ clip, eager = false }: { clip: TestimonialClip; eager?: boolean }) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (eager && !el.src) {
      el.src = el.dataset.src ?? "";
      el.play().catch(() => {});
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) {
            if (!v.src) v.src = v.dataset.src ?? "";
            v.play().catch(() => {});
          } else {
            v.pause();
          }
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [eager]);

  return (
    <div className="relative aspect-[4/5] w-[180px] flex-shrink-0 overflow-hidden rounded-2xl bg-muted shadow-card md:w-auto">
      <video
        ref={ref}
        data-src={clip.src}
        muted
        loop
        playsInline
        autoPlay
        preload={eager ? "auto" : "metadata"}
        className="h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
      <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-foreground backdrop-blur">
        {clip.tag}
      </span>
    </div>
  );
}

export default function CustomerProofStrip() {
  const [featured, setFeatured] = useState<Testimonial | null>(null);

  useEffect(() => {
    supabase
      .from("testimonials")
      .select("id, name, location, quote, rating, photo_url")
      .eq("is_published", true)
      .order("display_order", { ascending: true })
      .limit(1)
      .then(({ data }) => {
        setFeatured(data?.[0] ?? null);
      });
  }, []);

  return (
    <section className="bg-background py-12 md:py-16">
      <div className="container px-4">
        <div className="relative">
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:gap-4 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0">
            {TESTIMONIAL_CLIPS.map((c, i) => (
              <ClipTile key={c.id} clip={c} eager={i === 0} />
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
