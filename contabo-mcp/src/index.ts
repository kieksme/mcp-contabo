#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ContaboAuth } from "./auth.js";
import { ContaboClient } from "./client.js";
import { loadConfig } from "./config.js";
import { registerAllTools } from "./tools/register-all.js";
import { loadPackageVersion } from "./version.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const auth = new ContaboAuth(config);
  const client = new ContaboClient(config, auth);

  const server = new McpServer({
    name: "contabo-mcp",
    version: loadPackageVersion(),
  });

  registerAllTools(server, client);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : String(error),
  );
  process.exit(1);
});
