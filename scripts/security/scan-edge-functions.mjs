#!/usr/bin/env node
/**
 * Static check: every Supabase edge function that forwards request-body fields
 * into an AI prompt must first validate those fields via Zod or an explicit
 * allowlist. Catches prompt-injection / token-cost-abuse regressions.
 *
 * Skip a file by adding the comment `// security-ok: <reason>` at the top.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "supabase/functions";
const AI_HOSTS = [/ai\.gateway\.lovable\.dev/, /api\.openai\.com/, /api\.anthropic\.com/];
const VALIDATORS = [/from\s+["']npm:zod/, /\.safeParse\(/, /\.parse\(/, /ALLOWED\s*[:=]/, /allowlist/i];

let failed = 0;

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (entry === "index.ts") check(p);
  }
}

function check(file) {
  const src = readFileSync(file, "utf8");
  if (/\/\/\s*security-ok:/.test(src)) return;
  const callsAi = AI_HOSTS.some((re) => re.test(src));
  if (!callsAi) return;
  const usesBody = /req\.json\(\)/.test(src);
  if (!usesBody) return;
  const validated = VALIDATORS.some((re) => re.test(src));
  if (!validated) {
    console.error(`✗ ${file}: forwards request body to an AI provider without Zod/allowlist validation`);
    failed++;
  } else {
    console.log(`✓ ${file}`);
  }
}

try {
  walk(ROOT);
} catch (e) {
  console.error("scan failed:", e);
  process.exit(2);
}

if (failed > 0) {
  console.error(`\n${failed} edge function(s) need server-side input validation. Add a Zod schema or an allowlist before sending fields to the AI gateway.`);
  process.exit(1);
}
console.log("\nAll AI-calling edge functions validate request bodies.");
