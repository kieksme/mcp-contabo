#!/usr/bin/env npx tsx
/**
 * Downloads the Contabo OpenAPI spec.
 * Falls back to extracting embedded spec from api.contabo.com Redoc HTML.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SPEC_URL =
  process.env.CONTABO_OPENAPI_URL ??
  "https://api.contabo.com/606a7736-19be-4653-9d55-1881ef18e909";
const DOCS_URL = "https://api.contabo.com/";
const OUT = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "openapi",
  "contabo.openapi.json",
);

async function fetchJson(url: string): Promise<object | null> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; contabo-mcp/1.0)",
    },
  });
  if (!response.ok) return null;
  const text = await response.text();
  if (!text.startsWith("{")) return null;
  return JSON.parse(text) as object;
}

function extractFromHtml(html: string): object {
  const idx = html.indexOf('"openapi":"3.0.3"');
  if (idx < 0) throw new Error("OpenAPI JSON not found in docs HTML");
  const start = html.lastIndexOf("{", idx);
  let depth = 0;
  let end = start;
  for (let i = start; i < html.length; i++) {
    if (html[i] === "{") depth++;
    else if (html[i] === "}") {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  return JSON.parse(html.slice(start, end)) as object;
}

async function main(): Promise<void> {
  mkdirSync(dirname(OUT), { recursive: true });

  let spec = await fetchJson(SPEC_URL);
  if (!spec) {
    console.warn(`Direct fetch failed for ${SPEC_URL}, trying docs HTML...`);
    const docs = await fetch(DOCS_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; contabo-mcp/1.0)" },
    });
    if (!docs.ok) {
      throw new Error(`Failed to fetch docs (${docs.status})`);
    }
    spec = extractFromHtml(await docs.text());
  }

  writeFileSync(OUT, JSON.stringify(spec, null, 2));
  const paths = (spec as { paths?: Record<string, unknown> }).paths ?? {};
  console.log(`Wrote ${OUT} (${Object.keys(paths).length} paths)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
