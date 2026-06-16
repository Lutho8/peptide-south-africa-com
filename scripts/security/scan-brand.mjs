#!/usr/bin/env node
// Brand guard: fails if legacy "Ride The Tide" / "ridethetide" strings appear
// anywhere in source or built output.
//
// Allowlist:
//  - The external tracker URL "ridethetide.info" is intentional (it's a
//    separate product owned by us). The regex below uses a negative
//    lookahead to skip `.info` so the URL passes while UI strings fail.
//  - This file and the workflow itself are also skipped.
import { readdirSync, statSync, readFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOTS = process.argv.slice(2);
if (ROOTS.length === 0) ROOTS.push(".");

const IGNORED_DIRS = new Set([
  "node_modules", ".git", "dist", "build", ".next", ".turbo",
  ".cache", "coverage", "playwright-report", "test-results",
]);
const IGNORED_FILES = new Set([
  "scan-brand.mjs",
  "brand-guard.yml",
  "plan.md",
  "bun.lockb",
  "package-lock.json",
  "yarn.lock",
]);
const TEXT_EXT = /\.(?:tsx?|jsx?|mjs|cjs|json|html|css|md|txt|yml|yaml|webmanifest|svg|xml)$/i;

// Match "ridethetide" / "ride the tide" / "ride-the-tide" — but NOT
// "ridethetide.info" (the legitimate external tracker URL).
const PATTERN = /ride[\s-]?the[\s-]?tide(?!\.info)/i;

const hits = [];

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
    let content;
    try { content = readFileSync(full, "utf8"); } catch { continue; }
    const lines = content.split("\n");
    lines.forEach((line, i) => {
      if (PATTERN.test(line)) {
        hits.push(`${relative(".", full)}:${i + 1}: ${line.trim().slice(0, 200)}`);
      }
    });
  }
}

for (const root of ROOTS) {
  if (!existsSync(root)) continue;
  walk(root);
}

if (hits.length > 0) {
  console.error("❌ Brand guard failed — found legacy 'Ride The Tide' references:");
  for (const h of hits) console.error("  " + h);
  console.error(`\n${hits.length} occurrence(s). Rebrand to "Peptide South Africa" or "Peptide Tracker".`);
  process.exit(1);
}

console.log("✓ Brand guard passed — no legacy 'Ride The Tide' references found.");
