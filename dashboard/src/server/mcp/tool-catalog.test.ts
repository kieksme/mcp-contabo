import { describe, expect, it } from "vitest";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { ToolCatalog, toClaudeTools } from "./tool-catalog.js";

const FIXTURE_TOOLS = [
  {
    name: "contabo_instances_list",
    description: "List instances",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true },
  },
  {
    name: "contabo_instances_stop",
    description: "Stop an instance",
    inputSchema: { type: "object", properties: { instanceId: { type: "number" } } },
    annotations: { destructiveHint: true },
  },
  {
    name: "contabo_snapshots_list",
    description: "List snapshots",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true },
  },
  {
    name: "contabo_firewalls_list",
    description: "List firewalls",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true },
  },
];

function fakeClient(): Client {
  return {
    listTools: async () => ({ tools: FIXTURE_TOOLS }),
  } as unknown as Client;
}

describe("ToolCatalog", () => {
  it("loads and exposes every tool from the MCP client", async () => {
    const catalog = await ToolCatalog.load(fakeClient());
    expect(catalog.all()).toHaveLength(4);
    expect(catalog.get("contabo_instances_list")?.name).toBe("contabo_instances_list");
    expect(catalog.get("does_not_exist")).toBeUndefined();
  });

  it("flags destructiveHint tools as destructive, everything else as not", async () => {
    const catalog = await ToolCatalog.load(fakeClient());
    expect(catalog.isDestructive("contabo_instances_stop")).toBe(true);
    expect(catalog.isDestructive("contabo_instances_list")).toBe(false);
    expect(catalog.isDestructive("unknown_tool")).toBe(false);
  });

  it("filters by prefix, matching the dashboard's curated tool-scope default", async () => {
    const catalog = await ToolCatalog.load(fakeClient());
    const filtered = catalog.filterByPrefixes(["contabo_instances_", "contabo_snapshots_"]);
    expect(filtered.map((t) => t.name).sort()).toEqual([
      "contabo_instances_list",
      "contabo_instances_stop",
      "contabo_snapshots_list",
    ]);
    expect(filtered.some((t) => t.name === "contabo_firewalls_list")).toBe(false);
  });
});

describe("toClaudeTools", () => {
  it("converts MCP tool schemas into Claude's {name, description, input_schema} shape", async () => {
    const catalog = await ToolCatalog.load(fakeClient());
    const claudeTools = toClaudeTools(catalog.filterByPrefixes(["contabo_instances_"]));
    expect(claudeTools).toEqual([
      {
        name: "contabo_instances_list",
        description: "List instances",
        input_schema: { type: "object", properties: {} },
      },
      {
        name: "contabo_instances_stop",
        description: "Stop an instance",
        input_schema: { type: "object", properties: { instanceId: { type: "number" } } },
      },
    ]);
  });
});
