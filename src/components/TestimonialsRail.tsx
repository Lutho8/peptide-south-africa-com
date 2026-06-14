import { useState } from "react";
import { ChevronLeft, ChevronRight, Play, Star } from "lucide-react";

interface BeforeAfter {
  before: string;
  after: string;
}

export interface TestimonialCard {
  kind: "quote" | "video";
  title?: string;
  quote?: string;
  name: string;
  result: string;
  beforeAfter?: BeforeAfter;
  videoPoster?: string;
  videoUrl?: string;
  protocolLabel?: string;
}

interface Props {
  items: TestimonialCard[];
}

/**
 * Rivo-style 3-up testimonials rail.
 * Center card is video; flanking cards are quote + before/after.
 */
export default function TestimonialsRail({ items }: Props) {
  const [start, setStart] = useState(0);
  const visible = items.slice(start, start + 3);
  while (visible.length < 3 && items.length >= 3) visible.push(items[(start + visible.length) % items.length]);

  return (
    <div className="relative">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-accent">Real members · Real outcomes</p>
          <h2 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">
            What our members say.
          </h2>
        </div>
        {items.length > 3 && (
          <div className="flex gap-2">
            <button
              aria-label="Previous"
              onClick={() => setStart((s) => Math.max(0, s - 1))}
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted disabled:opacity-40"
              disabled={start === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              aria-label="Next"
              onClick={() => setStart((s) => Math.min(items.length - 3, s + 1))}
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted disabled:opacity-40"
              disabled={start >= items.length - 3}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {visible.map((card, i) => (
          card.kind === "video" ? <VideoCard key={i} card={card} /> : <QuoteCard key={i} card={card} />
        ))}
      </div>
    </div>
  );
}

function QuoteCard({ card }: { card: TestimonialCard }) {
  return (
    <figure className="flex flex-col rounded-3xl border border-border bg-card p-7">
      <div className="flex gap-0.5 text-foreground">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-current" />
        ))}
      </div>
      {card.title && (
        <h3 className="mt-5 font-display text-2xl leading-tight text-foreground">{card.title}</h3>
      )}
      <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-foreground/80">
        "{card.quote}"
      </blockquote>
      <figcaption className="mt-6">
        <p className="font-semibold text-foreground">{card.name}</p>
        <p className="text-sm text-muted-foreground">{card.result}</p>
      </figcaption>
      {card.beforeAfter && (
        <div className="mt-5 grid grid-cols-2 gap-2 overflow-hidden rounded-2xl">
          <img src={card.beforeAfter.before} alt={`${card.name} before`} className="aspect-[3/4] h-full w-full object-cover" loading="lazy" />
          <img src={card.beforeAfter.after} alt={`${card.name} after`} className="aspect-[3/4] h-full w-full object-cover" loading="lazy" />
        </div>
      )}
    </figure>
  );
}

function VideoCard({ card }: { card: TestimonialCard }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="relative isolate overflow-hidden rounded-3xl bg-primary aspect-[3/4] md:aspect-auto md:min-h-[520px]">
      {!playing ? (
        <>
          {card.videoPoster && (
            <img
              src={card.videoPoster}
              alt={card.name}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          )}
          <button
            type="button"
            aria-label={`Play ${card.name}'s story`}
            onClick={() => setPlaying(true)}
            className="absolute inset-0 grid place-items-center"
          >
            <span className="grid h-16 w-16 place-items-center rounded-full bg-background/95 text-primary shadow-card-hover transition group-hover:scale-105">
              <Play className="h-6 w-6 translate-x-0.5 fill-current" />
            </span>
          </button>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent p-6 text-center">
            <p className="font-display text-2xl text-primary-foreground">{card.name}</p>
            {card.protocolLabel && (
              <p className="eyebrow mt-1 text-primary-foreground/80">{card.protocolLabel}</p>
            )}
          </div>
        </>
      ) : card.videoUrl ? (
        <video src={card.videoUrl} controls autoPlay playsInline className="h-full w-full object-cover" />
      ) : null}
    </div>
  );
}
