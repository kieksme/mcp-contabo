import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ContaboClient } from "../client.js";
import { registerDomainTools } from "./domains.js";
import { registerInstanceTools } from "./instances.js";
import { registerObjectStorageTools } from "./object-storages.js";
import { registerSecretTools } from "./secrets.js";
import { registerSnapshotTools } from "./snapshots.js";

export function registerAllTools(
  server: McpServer,
  client: ContaboClient,
): void {
  registerInstanceTools(server, client);
  registerSnapshotTools(server, client);
  registerObjectStorageTools(server, client);
  registerSecretTools(server, client);
  registerDomainTools(server, client);
}
