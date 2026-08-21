#!/usr/bin/env node
/**
 * Reads qa/test-results/results.json (Playwright JSON reporter) and
 * qa/reports/inventory.json, then writes qa/reports/qa-report.md with sections:
 * Confirmed defects / Intermittent (flaky) / External-provider failures /
 * Missing requirements.
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const RESULTS = path.join(ROOT, 'test-results', 'results.json');
const INVENTORY = path.join(ROOT, 'reports', 'inventory.json');
const OUT = path.join(ROOT, 'reports', 'qa-report.md');

function loadJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return null; }
}

const EXTERNAL_PATTERNS = [
  /payfast|ozow|nowpayments|paypal|stripe/i,
  /supabase|edge function/i,
  /googletagmanager|google-analytics|facebook|hotjar|cloudflare/i,
  /net::ERR|ETIMEDOUT|ECONNREFUSED|ENOTFOUND/i,
];

function isExternal(test, errMsg) {
  const hay = `${test.title} ${errMsg}`;
  return EXTERNAL_PATTERNS.some((re) => re.test(hay));
}

function walkSuites(suite, file, out) {
  for (const spec of suite.suites || []) walkSuites(spec, file, out);
  for (const s of suite.specs || []) {
    for (const t of s.tests || []) {
      const results = t.results || [];
      const last = results[results.length - 1] || {};
      const statuses = results.map((r) => r.status);
      const errMsg = (last.error?.message || last.errors?.[0]?.message || '').slice(0, 600);
      out.push({
        file,
        title: s.title,
        project: t.projectName || t.projectId || '',
        finalStatus: t.status === 'expected' ? 'passed' : t.status === 'unexpected' ? 'failed' : t.status,
        statuses,
        flaky: t.status === 'flaky' || (statuses.length > 1 && last.status === 'passed' && statuses.slice(0, -1).some((st) => st !== 'passed' && st !== 'skipped')),
        annotations: (t.annotations || last.annotations || []).map((a) => a.description || a.type),
        errMsg,
      });
    }
  }
}

const results = loadJson(RESULTS);
const inventory = loadJson(INVENTORY);

const tests = [];
if (results?.suites) {
  for (const suite of results.suites) walkSuites(suite, suite.title || '', tests);
}

const confirmed = [];
const intermittent = [];
const external = [];
const missing = [];

for (const t of tests) {
  if (t.flaky) {
    intermittent.push(t);
    continue;
  }
  const failed = ['failed', 'timedOut', 'unexpected'].includes(t.finalStatus) || (t.statuses.includes('failed') && !t.flaky && t.finalStatus !== 'passed');
  if (failed) {
    (isExternal(t, t.errMsg) ? external : confirmed).push(t);
  }
  for (const a of t.annotations) {
    if (a && /missing|No B2B|no .* detected|no .* found/i.test(a)) missing.push(`${t.file} › ${t.title}: ${a}`);
  }
}

if (inventory?.missingRequirements?.length) {
  for (const m of inventory.missingRequirements) missing.push(`inventory: ${m}`);
}

// Inventory-derived defects
const invDefects = [];
if (inventory?.pages) {
  for (const p of inventory.pages) {
    if ((p.status ?? 0) >= 400) invDefects.push(`${p.path} returned HTTP ${p.status}`);
    for (const b of p.brokenLinks || []) invDefects.push(`Broken link on ${p.path}: ${b}`);
    for (const img of p.brokenImages || []) invDefects.push(`Broken image on ${p.path}: ${img}`);
    if (!p.title) invDefects.push(`${p.path} missing <title>`);
    if (!p.metaDescription) invDefects.push(`${p.path} missing meta description`);
  }
}

const passed = tests.filter((t) => t.finalStatus === 'passed' && !t.flaky).length;
const skipped = tests.filter((t) => t.statuses.every((s) => s === 'skipped')).length;

function section(title, items, render) {
  let md = `\n## ${title} (${items.length})\n\n`;
  if (!items.length) return md + '_None._\n';
  return md + items.map(render).join('\n') + '\n';
}

let md = `# QA Report — Peptide South Africa

Generated: ${new Date().toISOString()}
Base URL: ${inventory?.baseURL || process.env.BASE_URL || 'https://peptide-south-africa.com'}

**Summary:** ${passed} passed · ${confirmed.length + external.length} failed · ${intermittent.length} flaky · ${skipped} skipped · ${tests.length} total test executions
Pages crawled: ${inventory?.pageCount ?? 'n/a'} · Pets section found: ${inventory ? inventory.petsSectionFound : 'n/a'}
`;

md += section('Confirmed defects', [
  ...confirmed.map((t) => `- **${t.file} › ${t.title}** [${t.project}]\n  \`${t.errMsg.split('\n')[0]}\``),
  ...invDefects.map((d) => `- ${d}`),
], (x) => x);

md += section('Intermittent (flaky after retry)', intermittent, (t) => `- **${t.file} › ${t.title}** [${t.project}] — statuses: ${t.statuses.join(' → ')}`);

md += section('External-provider failures', external, (t) => `- **${t.file} › ${t.title}** [${t.project}]\n  \`${t.errMsg.split('\n')[0]}\``);

md += section('Missing requirements', missing, (x) => `- ${x}`);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, md);
console.log(`Wrote ${OUT}`);
console.log(`passed=${passed} confirmed=${confirmed.length + invDefects.length} flaky=${intermittent.length} external=${external.length} missing=${missing.length} skipped=${skipped}`);
