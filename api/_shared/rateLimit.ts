// Underscore-prefixed per Vercel convention: not deployed as its own route,
// only imported by sibling functions in api/.
//
// Fixed-window rate limiter, in-memory per edge isolate. This is a
// best-effort mitigation, not a distributed guarantee: Vercel Edge Functions
// can run multiple isolates/regions concurrently, each with its own copy of
// `hits`, so a determined caller spread across regions sees a higher
// effective ceiling than `limit`. It still meaningfully raises the bar
// against a single-source script hammering a public endpoint. For a real
// distributed limit, swap this for Upstash Redis (@upstash/ratelimit) once
// UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are provisioned.
const hits = new Map<string, { count: number; windowStart: number }>();

const MAX_ENTRIES = 5000;

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now - entry.windowStart >= windowMs) {
    if (hits.size >= MAX_ENTRIES) hits.clear();
    hits.set(key, { count: 1, windowStart: now });
    return false;
  }

  entry.count += 1;
  return entry.count > limit;
}
