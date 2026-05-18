import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it, vi } from "vitest";
import { ContaboAuth } from "../auth.js";
import { ContaboClient } from "../client.js";
import type { ContaboConfig } from "../config.js";
import { registerAllTools } from "./register-all.js";

const config: ContaboConfig = {
  clientId: "",
  clientSecret: "",
  apiUser: "",
  apiPassword: "",
  apiBaseUrl: "https://api.contabo.com/v1",
  authUrl: "https://auth.contabo.com/token",
  accessToken: "test",
};

const EXPECTED_TOOLS = [
  "contabo_instances_list",
  "contabo_instances_get",
  "contabo_instances_create",
  "contabo_instances_update",
  "contabo_instances_reinstall",
  "contabo_instances_cancel",
  "contabo_instances_upgrade",
  "contabo_instances_start",
  "contabo_instances_stop",
  "contabo_instances_restart",
  "contabo_instances_shutdown",
  "contabo_instances_rescue",
  "contabo_instances_reset_password",
  "contabo_instances_audits_list",
  "contabo_instances_actions_audits_list",
  "contabo_snapshots_list",
  "contabo_snapshots_get",
  "contabo_snapshots_create",
  "contabo_snapshots_update",
  "contabo_snapshots_delete",
  "contabo_snapshots_rollback",
  "contabo_snapshots_audits_list",
  "contabo_object_storages_list",
  "contabo_object_storages_get",
  "contabo_object_storages_create",
  "contabo_object_storages_update",
  "contabo_object_storages_cancel",
  "contabo_object_storages_resize",
  "contabo_object_storages_stats",
  "contabo_object_storages_audits_list",
  "contabo_object_storage_credentials_list",
  "contabo_object_storage_credentials_get",
  "contabo_object_storage_credentials_regenerate",
  "contabo_secrets_list",
  "contabo_secrets_get",
  "contabo_secrets_create",
  "contabo_secrets_update",
  "contabo_secrets_delete",
  "contabo_secrets_audits_list",
  "contabo_domains_list",
  "contabo_domains_get",
  "contabo_domains_create",
  "contabo_domains_update",
  "contabo_domains_cancel",
  "contabo_domains_revoke_cancellation",
  "contabo_domains_auth_code",
  "contabo_domains_transfer_out_confirm",
  "contabo_domains_transfer_out_revoke",
  "contabo_domains_check_availability",
  "contabo_domains_audits_list",
  "contabo_domain_handles_list",
  "contabo_domain_handles_get",
  "contabo_domain_handles_create",
  "contabo_domain_handles_update",
  "contabo_domain_handles_delete",
  "contabo_domain_handles_set_default",
  "contabo_domain_handles_audits_list",
];

describe("registerAllTools", () => {
  it("registers all planned contabo_* tools", () => {
    const server = new McpServer({ name: "test", version: "0" });
    const registered: string[] = [];

    const original = server.registerTool.bind(server);
    vi.spyOn(server, "registerTool").mockImplementation((name, ...rest) => {
      registered.push(name);
      return original(name, ...rest);
    });

    const client = new ContaboClient(config, new ContaboAuth(config));
    registerAllTools(server, client);

    expect(registered).toHaveLength(EXPECTED_TOOLS.length);
    expect(registered.sort()).toEqual([...EXPECTED_TOOLS].sort());
  });
});
