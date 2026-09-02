import { Helmet } from "react-helmet-async";
import { Link, useParams, Navigate } from "react-router-dom";
import { Clock, Calendar } from "lucide-react";
import BlogBody from "@/components/blog/BlogBody";
import BlogFAQ from "@/components/blog/BlogFAQ";
import BlogCTA from "@/components/blog/BlogCTA";
import BlogCard from "@/components/blog/BlogCard";
import { getPost, getRelated } from "@/data/blog";
import { getBlogImage } from "@/lib/blogImages";
import PreferredSourcesButton from "@/components/PreferredSourcesButton";
import { toHeadingId } from "@/lib/blogHeadings";

const SITE = "https://www.peptide-south-africa.com";

export default function BlogPostPage() {
  const { slug = "" } = useParams();
  const post = getPost(slug);
  if (!post) return <Navigate to="/blog" replace />;

  const related = getRelated(post.related);
  const url = `${SITE}/blog/${post.slug}`;
  const imageUrl = new URL(getBlogImage(post.category, post.slug), SITE).href;
  const sections = post.body.filter((block) => block.type === "h2");

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    image: {
      "@type": "ImageObject",
      url: imageUrl,
      width: 1200,
      height: 675,
    },
    author: {
      "@type": "Organization",
      name: "Peptide South Africa Editorial",
      url: `${SITE}/editorial-policy`,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${SITE}/#organization`,
      name: "Peptide South Africa",
      url: SITE,
      logo: { "@type": "ImageObject", url: `${SITE}/logo-horizontal.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    isAccessibleForFree: true,
    inLanguage: "en-ZA",
    articleSection: post.category,
    keywords: post.keyword,
    citation: post.citations.map((citation) => citation.url),
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
        <link rel="alternate" hrefLang="en-ZA" href={url} />
        <link rel="alternate" hrefLang="en" href={url} />
        <link rel="alternate" hrefLang="x-default" href={url} />
        <meta property="og:title" content={post.metaTitle} />
        <meta property="og:description" content={post.metaDescription} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Peptide South Africa" />
        <meta property="og:locale" content="en_ZA" />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:alt" content={post.title} />
        <meta property="article:published_time" content={post.publishedAt} />
        <meta property="article:modified_time" content={post.updatedAt} />
        <meta property="article:section" content={post.category} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={imageUrl} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
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
                Published {new Date(post.publishedAt).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}
              </span>
              {post.updatedAt !== post.publishedAt && (
                <span>
                  Updated {new Date(post.updatedAt).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {post.readingMinutes} min read
              </span>
              <Link to="/editorial-policy" className="hover:text-foreground hover:underline">
                By Peptide South Africa Editorial
              </Link>
            </div>
            <PreferredSourcesButton compact className="mt-7" />
          </div>
        </header>

        <div className="container max-w-3xl px-4 py-12">
          <figure className="mb-8 overflow-hidden rounded-2xl border border-border bg-muted/30 shadow-card">
            <img
              src={getBlogImage(post.category, post.slug)}
              alt={`${post.title} — evidence-led guide from Peptide South Africa`}
              width={1200}
              height={675}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="aspect-video w-full object-cover"
            />
            <figcaption className="border-t border-border px-4 py-3 text-xs leading-relaxed text-muted-foreground">
              Evidence-led educational overview. This image is illustrative and does not represent an approved treatment combination.
            </figcaption>
          </figure>

          {sections.length > 2 && (
            <nav aria-label="Article contents" className="mb-10 rounded-xl border border-border bg-muted/30 p-5">
              <p className="mb-3 font-display text-sm font-bold text-foreground">On this page</p>
              <ol className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                {sections.map((section) => (
                  <li key={section.text}>
                    <a className="text-accent hover:underline" href={`#${toHeadingId(section.text)}`}>
                      {section.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

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
            does not constitute medical advice. Regulatory status and approved indications vary by
            product and country. In South Africa, confirm a product in SAHPRA's register and consult
            a registered medical practitioner before considering any treatment.
          </p>
        </div>
      </article>
    </>
  );
}
