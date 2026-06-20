#!/usr/bin/env node
// Brand guard: fails if legacy "Ride The Tide" / "ridethetide" strings appear
// anywhere in source, public assets, build output, generated manifests,
// JSON/config, or VITE_* runtime env that gets bundled into the SPA.
//
// Allowlist:
//  - The external tracker URL "ridethetide.info" is intentional (separate,
//    related product). The regex uses a negative lookahead to skip `.info`.
//  - This file and the workflow itself are skipped.
import { readdirSync, statSync, readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, relative, basename, dirname } from "node:path";

// Report directory is configurable so CI can upload it as an artifact.
const REPORT_DIR = process.env.BRAND_GUARD_REPORT_DIR || "brand-guard-report";

const ROOTS = process.argv.slice(2);
if (ROOTS.length === 0) ROOTS.push(".");

const IGNORED_DIRS = new Set([
  "node_modules", ".git", "build", ".next", ".turbo",
  ".cache", "coverage", "playwright-report", "test-results",
]);
// Note: "dist" intentionally NOT ignored — we WANT to scan built output when it's a root.
const IGNORED_FILES = new Set([
  "scan-brand.mjs",
  "brand-guard.yml",
  "plan.md",
  "bun.lockb",
  "package-lock.json",
  "yarn.lock",
]);

// Broadened extension set: includes build artifacts (.map), manifests,
// configs, env files, and bundled JS chunks under dist/.
const TEXT_EXT = /\.(?:tsx?|jsx?|mjs|cjs|json|jsonc|html|css|md|mdx|txt|yml|yaml|webmanifest|svg|xml|map|toml|ini|conf|properties|plist|env|env\.[\w.-]+|sh|lock)$/i;

// Always-scanned files (even if extension is unusual or it's a dotfile).
const ALWAYS_SCAN = [
  ".env",
  ".env.local",
  ".env.production",
  ".env.production.local",
  ".env.development",
  ".env.development.local",
  "public/site.webmanifest",
  "public/manifest.json",
  "public/sitemap.xml",
  "public/sitemap-meta.json",
  "public/llms.txt",
  "public/robots.txt",
  "public/_headers",
  "public/_redirects",
];

// Match "ridethetide" / "ride the tide" / "ride-the-tide" — but NOT
// "ridethetide.info" (the legitimate external tracker URL).
const PATTERN = /ride[\s-]?the[\s-]?tide(?!\.info)/i;
// Stricter pattern for bundled VITE_* env values inside dist/*.js.
const BUNDLED_ENV_PATTERN = /VITE_[A-Z0-9_]+\s*[:=]\s*["'`][^"'`]*ride[\s-]?the[\s-]?tide[^"'`]*["'`]/i;

/** Structured matches: { file, line, snippet, kind: "text" | "bundled-env" | "process-env" }. */
const matches = [];
let scannedFiles = 0;

function recordMatch(m) {
  matches.push(m);
}

function scanFile(full, { strictEnv = false } = {}) {
  let content;
  try { content = readFileSync(full, "utf8"); } catch { return; }
  scannedFiles++;
  const rel = relative(".", full);
  const lines = content.split("\n");
  lines.forEach((line, i) => {
    if (PATTERN.test(line)) {
      recordMatch({ file: rel, line: i + 1, snippet: line.trim().slice(0, 200), kind: "text" });
    }
    if (strictEnv && BUNDLED_ENV_PATTERN.test(line)) {
      recordMatch({ file: rel, line: i + 1, snippet: line.trim().slice(0, 200), kind: "bundled-env" });
    }
  });
}

function walk(dir) {
  let entries;
  try { entries = readdirSync(dir); } catch { return; }
  for (const name of entries) {
    if (IGNORED_DIRS.has(name)) continue;
    const full = join(dir, name);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) { walk(full); continue; }
    if (IGNORED_FILES.has(name)) continue;
    if (!TEXT_EXT.test(name)) continue;
    const strictEnv = /\.js$/i.test(name) && full.includes(`${"dist"}/`);
    scanFile(full, { strictEnv });
  }
}

for (const root of ROOTS) {
  if (!existsSync(root)) continue;
  walk(root);
}

for (const f of ALWAYS_SCAN) {
  if (existsSync(f)) scanFile(f);
}

for (const [key, val] of Object.entries(process.env)) {
  if (!key.startsWith("VITE_")) continue;
  if (typeof val !== "string") continue;
  if (PATTERN.test(val)) {
    recordMatch({ file: `process.env.${key}`, line: 0, snippet: val.slice(0, 200), kind: "process-env" });
  }
}

// ---------------------------------------------------------------------------
// Write the artifact report (always, pass or fail) so CI can upload it.
// ---------------------------------------------------------------------------
const status = matches.length === 0 ? "pass" : "fail";
const report = {
  status,
  generatedAt: new Date().toISOString(),
  scannedRoots: ROOTS,
  scannedFiles,
  matchCount: matches.length,
  matches,
};

try {
  mkdirSync(REPORT_DIR, { recursive: true });
  writeFileSync(join(REPORT_DIR, "report.json"), JSON.stringify(report, null, 2));

  const md = [];
  md.push(`# Brand guard report`);
  md.push(``);
  md.push(`- **Status:** \`${status}\``);
  md.push(`- **Generated:** ${report.generatedAt}`);
  md.push(`- **Roots:** ${ROOTS.map((r) => `\`${r}\``).join(", ")}`);
  md.push(`- **Files scanned:** ${scannedFiles}`);
  md.push(`- **Matches:** ${matches.length}`);
  md.push(``);
  if (matches.length === 0) {
    md.push(`No legacy "Ride The Tide" references found. ✅`);
  } else {
    md.push(`## Offending locations`);
    md.push(``);
    md.push(`| File | Line | Kind | Snippet |`);
    md.push(`| --- | ---: | --- | --- |`);
    for (const m of matches) {
      const safe = m.snippet.replace(/\|/g, "\\|").replace(/`/g, "\\`");
      md.push(`| \`${m.file}\` | ${m.line || ""} | ${m.kind} | \`${safe}\` |`);
    }
  }
  writeFileSync(join(REPORT_DIR, "report.md"), md.join("\n") + "\n");
} catch (e) {
  console.error(`(warn) failed to write brand-guard report: ${e?.message ?? e}`);
}

// GitHub Actions inline annotations so failures surface in the PR Files tab.
if (process.env.GITHUB_ACTIONS === "true") {
  for (const m of matches) {
    if (m.kind === "process-env") {
      console.log(`::error::Brand guard: legacy reference in ${m.file} — ${m.snippet}`);
    } else {
      console.log(`::error file=${m.file},line=${m.line}::Brand guard: legacy "Ride The Tide" reference (${m.kind})`);
    }
  }
}

if (matches.length > 0) {
  console.error("❌ Brand guard failed — found legacy 'Ride The Tide' references:");
  for (const m of matches) console.error(`  ${m.file}:${m.line} [${m.kind}] ${m.snippet}`);
  console.error(`\n${matches.length} occurrence(s). Report written to ${REPORT_DIR}/.`);
  console.error(`Rebrand to "Peptide South Africa" or "Peptide Tracker".`);
  process.exit(1);
}

console.log(`✓ Brand guard passed — scanned ${scannedFiles} file(s). Report: ${REPORT_DIR}/report.json`);
