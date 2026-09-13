#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve("supabase/schemas");
const manifestPath = resolve(root, ".pgdelta-export.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const rolesSql = readFileSync(resolve("supabase/roles.sql"), "utf8");

const fail = (message) => {
  console.error(`Declarative baseline invalid: ${message}`);
  process.exitCode = 1;
};

if (manifest.formatVersion !== 1) fail(`unsupported manifest format ${manifest.formatVersion}`);
if (manifest.scope !== "database") fail(`unexpected export scope ${manifest.scope}`);
if (manifest.redactSecrets !== true) fail("export was not generated with secret redaction enabled");
if (!/CREATE ROLE crm_reader NOLOGIN/i.test(rolesSql)) fail("crm_reader is missing from roles.sql");

const loadOrder = manifest.loadOrder ?? [];
const files = manifest.files ?? [];
if (loadOrder.length === 0 || files.length === 0) fail("manifest contains no schema files");
if (new Set(loadOrder).size !== loadOrder.length) fail("load order contains duplicate paths");
if (new Set(files).size !== files.length) fail("file inventory contains duplicate paths");

const ordered = new Set(loadOrder);
for (const relativePath of files) {
  if (!ordered.has(relativePath)) fail(`${relativePath} is missing from load order`);
  try {
    readFileSync(resolve(root, relativePath), "utf8");
  } catch {
    fail(`${relativePath} is missing from the export tree`);
  }
}
for (const relativePath of loadOrder) {
  if (!files.includes(relativePath)) fail(`${relativePath} is missing from file inventory`);
}

const forbiddenFiles = ["_cluster/misc.sql"];
for (const relativePath of forbiddenFiles) {
  if (files.includes(relativePath) || ordered.has(relativePath)) {
    fail(`${relativePath} contains operational scheduler state and must not be versioned`);
  }
}

const forbiddenContent = [
  /x-cron-secret/i,
  /cron\.schedule(?:_in_database)?\s*\(/i,
  /https:\/\/eutszmrsukoqqeilzrbv\.supabase\.co\/functions/i,
];
for (const relativePath of files) {
  if (relativePath.startsWith("public/functions/") || relativePath.startsWith("tracker/functions/")) {
    continue;
  }
  const sql = readFileSync(resolve(root, relativePath), "utf8");
  for (const pattern of forbiddenContent) {
    if (pattern.test(sql)) fail(`${relativePath} contains operational or production-bound SQL`);
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log(`Declarative baseline verified: ${files.length} ordered schema files, no operational scheduler state.`);
