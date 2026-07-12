import type { BlogPost } from "./types";

// Eagerly import every blog post module in ./posts. Using import.meta.glob
// means adding or removing a post file never breaks the build — the registry
// auto-discovers whatever is present.
const modules = import.meta.glob<{ post: BlogPost }>("./posts/*.ts", { eager: true });

export const posts: BlogPost[] = Object.values(modules)
  .map((m) => m?.post)
  .filter((p): p is BlogPost => !!p && typeof p.slug === "string")
  .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getRelated(slugs: string[]): BlogPost[] {
  return slugs
    .map((s) => posts.find((p) => p.slug === s))
    .filter((p): p is BlogPost => !!p);
}
