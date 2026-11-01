import { createContaboServer } from "@kieksme/contabo-mcp/server";
import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import { loadPackageVersion } from "./version.js";

/**
 * Connects an in-process MCP `Client` to a fresh `createContaboServer()`
 * instance over a linked in-memory transport pair. No subprocess, no network
 * hop — the dashboard and the MCP server share one Node process, which is
 * all that's needed for a single self-hosted deployment.
 */
export async function createDashboardMcpClient(): Promise<Client> {
  const server = createContaboServer();
  const [serverTransport, clientTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);

  const client = new Client({
    name: "contabo-dashboard",
    version: loadPackageVersion(),
  });
  await client.connect(clientTransport);
  return client;
}
