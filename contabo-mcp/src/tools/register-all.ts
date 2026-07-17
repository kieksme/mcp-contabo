import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ContaboClient } from "../client.js";
import { registerDataCenterTools } from "./data-centers.js";
import { registerDnsTools } from "./dns.js";
import { registerDomainTools } from "./domains.js";
import { registerFirewallTools } from "./firewalls.js";
import { registerImageTools } from "./images.js";
import { registerInstanceTools } from "./instances.js";
import { registerObjectStorageTools } from "./object-storages.js";
import { registerPrivateNetworkTools } from "./private-networks.js";
import { registerSecretTools } from "./secrets.js";
import { registerSnapshotTools } from "./snapshots.js";
import { registerTagTools } from "./tags.js";
import { registerVipTools } from "./vips.js";

export function registerAllTools(
  server: McpServer,
  client: ContaboClient,
): void {
  registerInstanceTools(server, client);
  registerSnapshotTools(server, client);
  registerImageTools(server, client);
  registerDataCenterTools(server, client);
  registerObjectStorageTools(server, client);
  registerSecretTools(server, client);
  registerDomainTools(server, client);
  registerDnsTools(server, client);
  registerFirewallTools(server, client);
  registerPrivateNetworkTools(server, client);
  registerVipTools(server, client);
  registerTagTools(server, client);
}
