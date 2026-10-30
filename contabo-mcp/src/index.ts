#!/usr/bin/env node
import { loadConfig, startMcpServer } from "@kieksme/mcp-http-kit";
import { createContaboClient, createContaboServer } from "./server.js";
import { loadPackageVersion } from "./version.js";

async function main(): Promise<void> {
  // Transport, HTTP binding and auth come from `@kieksme/mcp-http-kit`
  // (`MCP_TRANSPORT`, `MCP_AUTH_TOKEN`, `MCP_ALLOWED_HOSTS`, ...).
  const config = loadConfig(process.env, { realm: "contabo-mcp" });

  // Fail fast: validate Contabo credentials at startup rather than on the
  // first request, so a misconfigured deployment never starts serving.
  // The client (and its OAuth token cache) is shared across requests.
  const client = createContaboClient();
  const version = loadPackageVersion();

  await startMcpServer({
    config,
    createServer: () => createContaboServer(client),
    getHealthInfo: () => ({ version }),
    onListening: ({ host, port, url }) => {
      console.error(
        `contabo-mcp v${version} listening on ${host}:${port} ` +
          `(POST ${config.http.path}, GET ${config.http.healthPath}; auth=${config.auth.mode})`,
      );
      console.error(`MCP URL: ${url}`);
    },
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
