import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { CheckCircle2, ShieldCheck, Star } from "lucide-react";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";

interface PublishedReview {
  id: string;
  display_name: string;
  location: string | null;
  rating: number;
  review: string;
  product_type: string | null;
  verified_purchase: boolean;
  published_at: string | null;
  created_at: string;
}

const reviewsDb = supabase as unknown as SupabaseClient;

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<PublishedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    let active = true;
    reviewsDb
      .from("customer_reviews")
      .select(
        "id, display_name, location, rating, review, product_type, verified_purchase, published_at, created_at",
      )
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        if (active) {
          setReviews((data as PublishedReview[] | null) ?? []);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const average = useMemo(() => {
    if (reviews.length === 0) return null;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  }, [reviews]);

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const form = new FormData(event.currentTarget);
    const review = String(form.get("review") ?? "").trim();
    if (review.length < 20) {
      setError("Please write at least 20 characters so your feedback is useful.");
      return;
    }
    setSending(true);
    setError("");
    const { error: submitError } = await reviewsDb.from("customer_reviews").insert({
      display_name: String(form.get("display_name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim().toLowerCase(),
      location: String(form.get("location") ?? "").trim() || null,
      rating,
      review,
      product_type: String(form.get("product_type") ?? "").trim() || null,
      order_ref: String(form.get("order_ref") ?? "").trim() || null,
      consent_publish: form.get("consent_publish") === "on",
    });
    setSending(false);
    if (submitError) {
      setError("We couldn't save your review. Please check the fields and try again.");
      return;
    }
    setSent(true);
    event.currentTarget.reset();
    setRating(5);
  }

  return (
    <div className="bg-background">
      <SEO
        title="Peptide South Africa Reviews"
        description="Read moderated, first-party Peptide South Africa customer reviews or submit your own experience for verification and publication."
        path="/reviews"
        keywords="Peptide South Africa reviews, Peptide South Africa customer reviews, peptide-south-africa.com reviews"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Peptide South Africa Reviews",
            url: "https://www.peptide-south-africa.com/reviews",
            description:
              "Moderated, first-party Peptide South Africa customer reviews and review submissions.",
            isPartOf: {
              "@type": "WebSite",
              name: "Peptide South Africa",
              url: "https://www.peptide-south-africa.com",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Peptide South Africa",
                item: "https://www.peptide-south-africa.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Reviews",
                item: "https://www.peptide-south-africa.com/reviews",
              },
            ],
          },
        ]}
      />

      <section className="border-b border-border bg-gradient-to-br from-primary/10 via-background to-trust/5 py-16 md:py-24">
        <div className="container max-w-4xl px-4 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Official review hub</p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-6xl">
            Peptide South Africa Reviews
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            This is a first-party review page operated by Peptide South Africa — not an independent
            review platform. Submissions are moderated, and “verified purchase” appears only after an
            order-reference check.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-foreground">
              <ShieldCheck className="h-4 w-4 text-trust" /> No paid placements
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-foreground">
              <CheckCircle2 className="h-4 w-4 text-trust" /> Verification is labelled
            </span>
          </div>
        </div>
      </section>

      <section className="container max-w-5xl px-4 py-14 md:py-20">
        <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Published feedback</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-foreground">Customer experiences</h2>
          </div>
          {average !== null && (
            <p className="text-sm text-muted-foreground">
              <span className="font-display text-3xl font-bold text-foreground">{average.toFixed(1)}</span>{" "}
              from {reviews.length} published {reviews.length === 1 ? "review" : "reviews"}
            </p>
          )}
        </div>

        {loading ? (
          <p className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            Loading published reviews…
          </p>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <h3 className="font-display text-xl font-bold text-foreground">No moderated reviews published yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Be the first to submit genuine feedback. Nothing is published automatically.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {reviews.map((review) => (
              <article key={review.id} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground">{review.display_name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {[review.location, review.product_type].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  {review.verified_purchase && (
                    <span className="rounded-full bg-trust/10 px-2.5 py-1 text-[11px] font-semibold text-trust">
                      Verified purchase
                    </span>
                  )}
                </div>
                <div className="mt-4 flex gap-1" aria-label={`${review.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      className={`h-4 w-4 ${index < review.rating ? "fill-badge text-badge" : "text-muted"}`}
                    />
                  ))}
                </div>
                <p className="mt-4 leading-relaxed text-muted-foreground">“{review.review}”</p>
                <p className="mt-4 text-xs text-muted-foreground">
                  {new Date(review.published_at ?? review.created_at).toLocaleDateString("en-ZA", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-border bg-card py-14 md:py-20" id="leave-a-review">
        <div className="container grid max-w-5xl gap-10 px-4 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Your experience</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-foreground">Leave a review</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Reviews are checked before publication. Your email and order reference are used only for
              moderation and purchase verification; they are never shown publicly.
            </p>
          </div>

          {sent ? (
            <div className="rounded-2xl border border-trust/30 bg-trust/5 p-8">
              <CheckCircle2 className="h-9 w-9 text-trust" />
              <h3 className="mt-4 font-display text-2xl font-bold text-foreground">Thank you</h3>
              <p className="mt-2 text-muted-foreground">Your review is in the moderation queue.</p>
            </div>
          ) : (
            <form onSubmit={submitReview} className="space-y-4 rounded-2xl border border-border bg-background p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-foreground">
                  Display name
                  <input name="display_name" required minLength={2} maxLength={80} className="mt-2 w-full rounded-xl border border-input bg-card px-4 py-3" />
                </label>
                <label className="text-sm font-medium text-foreground">
                  Email (private)
                  <input name="email" type="email" required maxLength={320} className="mt-2 w-full rounded-xl border border-input bg-card px-4 py-3" />
                </label>
                <label className="text-sm font-medium text-foreground">
                  Location (optional)
                  <input name="location" maxLength={100} className="mt-2 w-full rounded-xl border border-input bg-card px-4 py-3" />
                </label>
                <label className="text-sm font-medium text-foreground">
                  Product or service (optional)
                  <input name="product_type" maxLength={120} className="mt-2 w-full rounded-xl border border-input bg-card px-4 py-3" />
                </label>
              </div>
              <fieldset>
                <legend className="text-sm font-medium text-foreground">Rating</legend>
                <div className="mt-2 flex gap-1">
                  {Array.from({ length: 5 }, (_, index) => index + 1).map((value) => (
                    <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} stars`}>
                      <Star className={`h-7 w-7 ${value <= rating ? "fill-badge text-badge" : "text-muted"}`} />
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="block text-sm font-medium text-foreground">
                Review
                <textarea name="review" required minLength={20} maxLength={2000} rows={5} className="mt-2 w-full resize-y rounded-xl border border-input bg-card px-4 py-3" />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Order reference (optional, private)
                <input name="order_ref" maxLength={80} className="mt-2 w-full rounded-xl border border-input bg-card px-4 py-3" />
              </label>
              <label className="flex items-start gap-3 text-sm text-muted-foreground">
                <input name="consent_publish" type="checkbox" required className="mt-1 h-4 w-4 accent-primary" />
                I consent to publication of my display name, location, rating and review after moderation.
              </label>
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
              <button disabled={sending} className="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-60">
                {sending ? "Submitting…" : "Submit for moderation"}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
