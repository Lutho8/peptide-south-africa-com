import type { BlogPost } from "./types";

// Slugs we expect to always be present. If any are missing at build/runtime,
// we log a clear console warning so the gap is obvious.
const EXPECTED_SLUGS = [
  "peptide-protocol-tracker",
] as const;

// Eagerly import every blog post module in ./posts. Using import.meta.glob
// means adding or removing a post file never breaks the build — the registry
// auto-discovers whatever is present.
const modules = import.meta.glob<{ post: BlogPost }>("./posts/*.ts", { eager: true });

const collected: BlogPost[] = [];

for (const [key, mod] of Object.entries(modules)) {
  if (!mod || typeof mod !== "object") {
    console.warn(`[blog] Skipping ${key}: module did not load.`);
    continue;
  }
  const post = (mod as { post?: BlogPost }).post;
  if (!post) {
    console.warn(`[blog] Skipping ${key}: missing named export "post".`);
    continue;
  }
  if (typeof post.slug !== "string" || !post.slug) {
    console.warn(`[blog] Skipping ${key}: post is malformed (missing "slug").`);
    continue;
  }
  collected.push(post);
}

export const posts: BlogPost[] = collected.sort((a, b) =>
  a.publishedAt < b.publishedAt ? 1 : -1,
);

// Surface any expected posts that failed to resolve.
const presentSlugs = new Set(posts.map((p) => p.slug));
for (const slug of EXPECTED_SLUGS) {
  if (!presentSlugs.has(slug)) {
    console.warn(
      `[blog] Expected post "${slug}" is missing. Add src/data/blog/posts/${slug}.ts to restore it.`,
    );
  }
}

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getRelated(slugs: string[]): BlogPost[] {
  return slugs
    .map((s) => {
      const found = posts.find((p) => p.slug === s);
      if (!found) console.warn(`[blog] Related post "${s}" not found in registry.`);
      return found;
    })
    .filter((p): p is BlogPost => !!p);
}
