import { Helmet } from "react-helmet-async";
import { Link, useParams, Navigate } from "react-router-dom";
import { Clock, Calendar } from "lucide-react";
import BlogBody from "@/components/blog/BlogBody";
import BlogFAQ from "@/components/blog/BlogFAQ";
import BlogCTA from "@/components/blog/BlogCTA";
import BlogCard from "@/components/blog/BlogCard";
import { getPost, getRelated } from "@/data/blog";

const SITE = "https://www.peptide-south-africa.com";

export default function BlogPostPage() {
  const { slug = "" } = useParams();
  const post = getPost(slug);
  if (!post) return <Navigate to="/blog" replace />;

  const related = getRelated(post.related);
  const url = `${SITE}/blog/${post.slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Organization", name: "Peptide South Africa Editorial" },
    publisher: { "@type": "Organization", name: "Peptide South Africa" },
    mainEntityOfPage: url,
    keywords: post.keyword,
  };

  const faqSchema = post.faqs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: post.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  return (
    <>
      <Helmet>
        <title>{post.metaTitle}</title>
        <meta name="description" content={post.metaDescription} />
        <meta name="keywords" content={post.keyword} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={post.metaTitle} />
        <meta property="og:description" content={post.metaDescription} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={post.publishedAt} />
        <meta property="article:modified_time" content={post.updatedAt} />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
      </Helmet>

      <article className="bg-background">
        <header className="border-b border-border bg-gradient-to-b from-primary/5 to-background py-14">
          <div className="container max-w-3xl px-4">
            <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground">Home</Link> <span className="px-1">/</span>
              <Link to="/blog" className="hover:text-foreground">Blog</Link> <span className="px-1">/</span>
              <span className="text-foreground">{post.category}</span>
            </nav>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent">
              {post.hero.eyebrow}
            </p>
            <h1 className="mb-4 font-display text-3xl font-bold leading-tight text-foreground md:text-5xl">
              {post.title}
            </h1>
            <p className="mb-6 text-lg text-muted-foreground">{post.hero.summary}</p>
            <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Updated {new Date(post.updatedAt).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {post.readingMinutes} min read
              </span>
              <span>By Peptide South Africa Editorial</span>
            </div>
          </div>
        </header>

        <div className="container max-w-3xl px-4 py-12">
          <BlogBody blocks={post.body} />

          {post.citations.length > 0 && (
            <section className="mt-12 rounded-xl border border-border bg-muted/30 p-6">
              <h2 className="mb-3 font-display text-lg font-bold text-foreground">References</h2>
              <ol className="ml-5 list-decimal space-y-1.5 text-sm text-muted-foreground">
                {post.citations.map((c) => (
                  <li key={c.id}>
                    <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                      {c.label}
                    </a>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <BlogFAQ faqs={post.faqs} />
          <BlogCTA variant={post.cta} />

          <aside className="mt-12 border-t border-border pt-10">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Keep reading
            </p>
            <div className="grid gap-5 md:grid-cols-3">
              {related.map((r) => (
                <BlogCard key={r.slug} post={r} />
              ))}
            </div>
          </aside>

          <p className="mt-10 rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
            <strong>Disclaimer:</strong> Content is for educational and research purposes only and
            does not constitute medical advice. Peptides discussed are not registered medicines in
            South Africa for the indications mentioned; consult a registered medical practitioner
            before starting any protocol.
          </p>
        </div>
      </article>
    </>
  );
}
