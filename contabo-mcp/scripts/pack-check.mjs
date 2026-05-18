#!/usr/bin/env node
/**
 * Verifies the npm tarball contains dist/ and excludes src/.
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const tarballBase = pkg.name.startsWith("@")
  ? pkg.name.slice(1).replace("/", "-")
  : pkg.name;
const tarballPath = join(root, `${tarballBase}-${pkg.version}.tgz`);

if (existsSync(tarballPath)) {
  unlinkSync(tarballPath);
}

execSync("npm pack", { cwd: root, stdio: "inherit" });

const listing = execSync(`tar -tzf "${tarballPath}"`, { encoding: "utf8" });
const files = listing.split("\n").filter(Boolean);

const hasDist = files.some((f) => f.includes("/dist/index.js"));
const hasSrc = files.some((f) => /\/src\//.test(f));

if (!hasDist) {
  console.error("pack:check failed: dist/index.js not in tarball");
  console.error(listing);
  process.exit(1);
}

if (hasSrc) {
  console.error("pack:check failed: src/ must not be published");
  process.exit(1);
}

console.log(`pack:check ok (${files.length} entries, dist present, no src)`);
unlinkSync(tarballPath);
