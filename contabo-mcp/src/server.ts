import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ContaboAuth } from "./auth.js";
import { ContaboClient } from "./client.js";
import { loadConfig } from "./config.js";
import { registerAllTools } from "./tools/register-all.js";
import { loadPackageVersion } from "./version.js";

/**
 * Builds a fully-wired, transport-agnostic MCP server instance
 * (config + auth + client + all tools registered).
 *
 * One `McpServer` binds to exactly one transport, so callers that serve
 * multiple concurrent sessions (e.g. the stateful HTTP transport) must call
 * this once per session. Construction is cheap: `ContaboAuth` fetches tokens
 * lazily on the first API call, so no network request fires here.
 */
export function createContaboServer(): McpServer {
  const config = loadConfig();
  const auth = new ContaboAuth(config);
  const client = new ContaboClient(config, auth);

  const server = new McpServer({
    name: "contabo-mcp",
    version: loadPackageVersion(),
  });

  registerAllTools(server, client);
  return server;
}
