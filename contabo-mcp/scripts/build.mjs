#!/usr/bin/env node
/**
 * Bundle the MCP server for publish. Avoids shipping a dependency tree that includes
 * ajv (JSON Schema compile via new Function). Uses CfWorkerJsonSchemaValidator at runtime.
 */
import * as esbuild from "esbuild";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const ajvStub = join(root, "scripts/ajv-provider-stub.mjs");

// Two entrypoints share one bundle config:
//   - src/index.ts -> dist/index.js : stdio CLI shipped to npm (keeps its shebang).
//   - src/http.ts  -> dist/http.js  : Streamable HTTP transport used by the Docker image only.
const entries = [
  { in: "src/index.ts", out: "dist/index.js" },
  { in: "src/http.ts", out: "dist/http.js" },
];

for (const entry of entries) {
  await esbuild.build({
    entryPoints: [join(root, entry.in)],
    outfile: join(root, entry.out),
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node20",
    sourcemap: true,
    // Shebang (if any) comes from the source entry; do not add a second banner line.
    // Bundle MCP SDK. Replace ajv-provider with a stub so ajv (eval/Function) is not in the tarball.
    external: ["zod", "@cfworker/json-schema"],
    plugins: [
      {
        name: "stub-ajv-provider",
        setup(build) {
          build.onResolve({ filter: /ajv-provider\.js$/ }, (args) => {
            if (args.path.includes("validation")) {
              return { path: ajvStub };
            }
          });
        },
      },
    ],
    logLevel: "info",
  });

  console.log(`build: bundled ${pkg.name} -> ${entry.out}`);
}
