#!/usr/bin/env node
/**
 * Prints the Keep a Changelog section for a version (e.g. 1.0.1) to stdout.
 * Usage: node scripts/changelog-release-notes.mjs <version>
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const version = process.argv[2];
if (!version) {
  console.error("Usage: changelog-release-notes.mjs <version>");
  process.exit(1);
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const changelog = readFileSync(join(root, "CHANGELOG.md"), "utf8");
const header = `## [${version}]`;
const start = changelog.indexOf(header);
if (start === -1) {
  console.error(`No changelog section found for ${version}`);
  process.exit(1);
}

const afterHeader = changelog.indexOf("\n", start) + 1;
const rest = changelog.slice(afterHeader);
const nextHeading = rest.search(/\n## \[/);
const section = nextHeading === -1 ? rest : rest.slice(0, nextHeading);
const body = section
  .replace(/^\[[^\]]+\]:[^\n]*$/gm, "")
  .trim();

if (!body) {
  console.error(`Changelog section for ${version} is empty`);
  process.exit(1);
}

console.log(`# ${version}\n\n${body}`);
