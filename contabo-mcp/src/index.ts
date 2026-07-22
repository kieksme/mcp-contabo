#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { loadServerConfig } from "./config/server-config.js";
import { createContaboServer } from "./server.js";
import { startHttpServer } from "./transports/http.js";

async function main(): Promise<void> {
  const serverConfig = loadServerConfig();

  if (serverConfig.transport === "http") {
    // Fail fast: validate Contabo credentials at startup rather than on the
    // first request, so a misconfigured deployment never starts listening.
    loadConfig();
    await startHttpServer(serverConfig);
    return;
  }

  // Default: stdio — unchanged behavior.
  const server = createContaboServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : String(error),
  );
  process.exit(1);
});
