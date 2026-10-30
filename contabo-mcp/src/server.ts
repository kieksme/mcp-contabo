import { McpServer } from "@modelcontextprotocol/server";
import { ContaboAuth } from "./auth.js";
import { ContaboClient } from "./client.js";
import { loadConfig } from "./config.js";
import { registerAllTools } from "./tools/register-all.js";
import { loadPackageVersion } from "./version.js";

/**
 * Builds the Contabo API client (config + auth). `ContaboAuth` caches the OAuth
 * token per instance and fetches it lazily on the first API call, so no network
 * request fires here. Build it once and share it across requests.
 */
export function createContaboClient(): ContaboClient {
  const config = loadConfig();
  return new ContaboClient(config, new ContaboAuth(config));
}

/**
 * Builds a fully-wired, transport-agnostic MCP server instance (client + all
 * tools registered).
 *
 * The Streamable HTTP transport is stateless, so the kit calls this once per
 * request. Pass a shared `client` so the OAuth token cache survives across
 * requests instead of fetching a new token each time.
 */
export function createContaboServer(
  client: ContaboClient = createContaboClient(),
): McpServer {
  const server = new McpServer({
    name: "contabo-mcp",
    version: loadPackageVersion(),
  });

  registerAllTools(server, client);
  return server;
}
