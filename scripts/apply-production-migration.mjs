import { readFile } from "node:fs/promises";
import postgres from "postgres";

if (process.env.VERCEL_ENV !== "production") {
  console.log("Production migration skipped outside Vercel production.");
  process.exit(0);
}

const databaseUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
if (!databaseUrl) throw new Error("Production database URL is not configured.");

const migration = await readFile(
  new URL("../supabase/migrations/20260827150000_pricing_analytics_events.sql", import.meta.url),
  "utf8",
);
const sql = postgres(databaseUrl, {
  ssl: "require",
  max: 1,
  prepare: false,
  connect_timeout: 15,
  idle_timeout: 2,
});

try {
  await sql.begin((transaction) => transaction.unsafe(migration));
  console.log("Applied pricing and analytics migration 20260827150000.");
} finally {
  await sql.end({ timeout: 5 });
}
