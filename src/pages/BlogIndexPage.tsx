import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import BlogCard from "@/components/blog/BlogCard";
import { posts } from "@/data/blog";

const SITE = "https://www.peptide-south-africa.com";

export default function BlogIndexPage() {
  const sorted = [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return (
    <>
      <Helmet>
        <title>Peptide research blog — Peptide South Africa</title>
        <meta
          name="description"
          content="Honest, research-cited peptide guides from Cape Town. Protocols, bloodwork, dosing math, community and sourcing — built for South African biohackers."
        />
        <link rel="canonical" href={`${SITE}/blog`} />
        <meta property="og:title" content="Peptide research blog — Peptide South Africa" />
        <meta property="og:url" content={`${SITE}/blog`} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Peptide South Africa Blog",
          url: `${SITE}/blog`,
          blogPost: sorted.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            url: `${SITE}/blog/${p.slug}`,
            datePublished: p.publishedAt,
            dateModified: p.updatedAt,
          })),
        })}</script>
      </Helmet>

      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background py-16">
        <div className="container px-4">
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link> <span className="px-1">/</span>
            <span className="text-foreground">Blog</span>
          </nav>
          <h1 className="mb-4 font-display text-4xl font-bold text-foreground md:text-5xl">
            Peptide research, decoded.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Educational deep-dives on protocols, bloodwork, dosing math and the Cape Town peptide
            community. Every post is research-cited and written for honest, GP-led practice.
          </p>
        </div>
      </section>

      <section className="container px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sorted.map((p) => (
            <BlogCard key={p.slug} post={p} />
          ))}
        </div>
      </section>
    </>
  );
}
