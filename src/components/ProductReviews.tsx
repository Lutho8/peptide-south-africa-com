import { Star } from "lucide-react";

interface Review {
  name: string;
  date: string;
  rating: number;
  text: string;
  verified: boolean;
}

// Seeded reviews per product slug for consistency
const reviewsData: Record<string, Review[]> = {
  "rt3-reta": [
    { name: "Jenn P.", date: "March 20, 2026", rating: 5, text: "Great Customer Service. Fast shipping. Responded within minutes when I contacted them with a question. Highly Recommend!", verified: true },
    { name: "Delinah W.", date: "March 20, 2026", rating: 5, text: "Always great customer service with speedy replies and lightning fast processing and shipping. I started RT-3 several weeks ago, it's amazing and definitely living up to all the hype!", verified: true },
    { name: "Jessie G.", date: "March 20, 2026", rating: 5, text: "Fast shipping and amazing customer service. Reached out and within minutes I had a response from them.", verified: true },
    { name: "Chris N.", date: "March 18, 2026", rating: 5, text: "Quality product, well packaged. COA included as promised. Will definitely be ordering again.", verified: true },
    { name: "Michael R.", date: "March 15, 2026", rating: 5, text: "Excellent purity confirmed by our lab. The research results have been consistently reproducible.", verified: true },
  ],
  "ghk-cu-50mg": [
    { name: "Dr. Patel", date: "March 19, 2026", rating: 5, text: "Exceptional purity for our dermatological research. COA matched our independent analysis perfectly.", verified: true },
    { name: "Lisa M.", date: "March 17, 2026", rating: 5, text: "Fast delivery to Cape Town. Product was well-packaged and included all documentation.", verified: true },
    { name: "Robert K.", date: "March 14, 2026", rating: 5, text: "Third time ordering. Consistent quality every time. Great value at 50mg.", verified: true },
  ],
  "tesamorelin": [
    { name: "Dr. Nkosi", date: "March 18, 2026", rating: 5, text: "Premium quality Tesamorelin. Lab results confirmed ≥99% purity. Excellent for our GH research.", verified: true },
    { name: "Amanda S.", date: "March 16, 2026", rating: 5, text: "Smooth ordering process, fast domestic shipping. Arrived in 2 days to Johannesburg.", verified: true },
    { name: "Johan V.", date: "March 12, 2026", rating: 5, text: "Reliable supplier. COA transparency gives confidence in the product quality.", verified: true },
    { name: "Sarah B.", date: "March 10, 2026", rating: 5, text: "Best price I've found for research-grade Tesamorelin in SA. No customs hassle.", verified: true },
  ],
  "tz2-tirz": [
    { name: "Mark D.", date: "March 19, 2026", rating: 5, text: "Pre-ordered and received notification promptly when batch was ready. Quality is outstanding.", verified: true },
    { name: "Dr. Williams", date: "March 15, 2026", rating: 5, text: "Dual agonist research has been promising. Product purity is exactly as stated on the COA.", verified: true },
    { name: "Thandi M.", date: "March 11, 2026", rating: 5, text: "Worth the pre-order wait. Domestic shipping was quick once available.", verified: true },
  ],
};

const defaultReviews: Review[] = [
  { name: "Alex T.", date: "March 18, 2026", rating: 5, text: "Excellent quality and fast SA shipping. COA included with every order. Highly recommend.", verified: true },
  { name: "Dr. Moosa", date: "March 15, 2026", rating: 5, text: "Consistent purity across multiple orders. This is our go-to supplier for peptide research.", verified: true },
  { name: "Karen L.", date: "March 12, 2026", rating: 5, text: "Great customer service and transparent pricing. No hidden fees or markup games.", verified: true },
];

function getReviewsForProduct(slug: string): Review[] {
  return reviewsData[slug] || defaultReviews;
}

function getRatingBreakdown(reviews: Review[]) {
  const breakdown = [0, 0, 0, 0, 0];
  reviews.forEach((r) => breakdown[r.rating - 1]++);
  return breakdown.reverse(); // 5 star first
}

export default function ProductReviews({ slug }: { slug: string }) {
  const reviews = getReviewsForProduct(slug);
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const breakdown = getRatingBreakdown(reviews);
  const totalReviews = reviews.length;

  return (
    <section className="container py-16">
      <h3 className="mb-8 font-display text-2xl font-bold text-foreground">
        {totalReviews} {totalReviews === 1 ? "Review" : "Reviews"}
      </h3>

      <div className="grid gap-10 md:grid-cols-[280px_1fr]">
        {/* Rating Summary */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="text-center">
            <p className="font-display text-4xl font-bold text-foreground">{avgRating.toFixed(1)}</p>
            <div className="mt-2 flex justify-center gap-0.5">
              {Array(5).fill(null).map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${i < Math.round(avgRating) ? "fill-badge text-badge" : "text-muted"}`} />
              ))}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Based on {totalReviews} reviews</p>
          </div>

          <div className="mt-6 space-y-2">
            {breakdown.map((count, i) => {
              const starNum = 5 - i;
              const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={starNum} className="flex items-center gap-2 text-sm">
                  <span className="w-3 text-muted-foreground">{starNum}</span>
                  <Star className="h-3.5 w-3.5 fill-badge text-badge" />
                  <div className="flex-1 overflow-hidden rounded-full bg-muted h-2">
                    <div className="h-full rounded-full bg-badge transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-right text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Individual Reviews */}
        <div className="flex flex-col gap-6">
          {reviews.map((review, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{review.name}</p>
                    {review.verified && (
                      <span className="rounded-full bg-trust/10 px-2 py-0.5 text-xs font-medium text-trust">Verified</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{review.date}</p>
                </div>
                <div className="flex gap-0.5">
                  {Array(5).fill(null).map((_, j) => (
                    <Star key={j} className={`h-4 w-4 ${j < review.rating ? "fill-badge text-badge" : "text-muted"}`} />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{review.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
