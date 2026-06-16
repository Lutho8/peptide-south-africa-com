#!/usr/bin/env node
// Brand guard: fails if legacy "Ride The Tide" / "ridethetide" strings appear
// anywhere in source, public assets, build output, generated manifests,
// JSON/config, or VITE_* runtime env that gets bundled into the SPA.
//
// Allowlist:
//  - The external tracker URL "ridethetide.info" is intentional (separate,
//    related product). The regex uses a negative lookahead to skip `.info`.
//  - This file and the workflow itself are skipped.
import { readdirSync, statSync, readFileSync, existsSync } from "node:fs";
import { join, relative, basename } from "node:path";

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

const hits = [];

function scanFile(full, { strictEnv = false } = {}) {
  let content;
  try { content = readFileSync(full, "utf8"); } catch { return; }
  const lines = content.split("\n");
  lines.forEach((line, i) => {
    if (PATTERN.test(line)) {
      hits.push(`${relative(".", full)}:${i + 1}: ${line.trim().slice(0, 200)}`);
    }
    if (strictEnv && BUNDLED_ENV_PATTERN.test(line)) {
      hits.push(`${relative(".", full)}:${i + 1} [bundled-env]: ${line.trim().slice(0, 200)}`);
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
    // Dotfiles (.env, etc.) handled by ALWAYS_SCAN pass.
    if (!TEXT_EXT.test(name)) continue;
    const strictEnv = /\.js$/i.test(name) && full.includes(`${"dist"}/`);
    scanFile(full, { strictEnv });
  }
}

for (const root of ROOTS) {
  if (!existsSync(root)) continue;
  walk(root);
}

// Guarantee-coverage pass for files that may slip past the walker
// (dotfiles, unusual extensions, or roots not passed in).
for (const f of ALWAYS_SCAN) {
  if (existsSync(f)) scanFile(f);
}

// Runtime VITE_* env: catches CI-injected values that would otherwise bake
// the legacy brand into the bundle.
for (const [key, val] of Object.entries(process.env)) {
  if (!key.startsWith("VITE_")) continue;
  if (typeof val !== "string") continue;
  if (PATTERN.test(val)) {
    hits.push(`process.env.${key}: ${val.slice(0, 200)}`);
  }
}

if (hits.length > 0) {
  console.error("❌ Brand guard failed — found legacy 'Ride The Tide' references:");
  for (const h of hits) console.error("  " + h);
  console.error(`\n${hits.length} occurrence(s). Rebrand to "Peptide South Africa" or "Peptide Tracker".`);
  process.exit(1);
}

console.log("✓ Brand guard passed — no legacy 'Ride The Tide' references found.");
