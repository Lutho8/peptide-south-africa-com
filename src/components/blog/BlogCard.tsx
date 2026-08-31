import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import type { BlogPost } from "@/data/blog/types";
import { getBlogImage } from "@/lib/blogImages";

export default function BlogCard({ post }: { post: Pick<BlogPost, "slug" | "title" | "hero" | "category" | "readingMinutes" | "publishedAt"> }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-accent hover:shadow-card"
    >
      <img
        src={getBlogImage(post.category, post.slug)}
        alt={`${post.title} — ${post.category}`}
        loading="lazy"
        className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <div className="flex flex-1 flex-col p-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">{post.category}</p>
        <h3 className="mb-3 font-display text-xl font-bold leading-snug text-foreground transition-colors group-hover:text-accent">
          {post.title}
        </h3>
        <p className="mb-5 flex-1 text-sm text-muted-foreground">{post.hero.summary}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {post.readingMinutes} min read
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-accent">
            Read <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
