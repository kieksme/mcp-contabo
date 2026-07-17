import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ContaboClient } from "../client.js";
import {
  bodyField,
  registerContaboTool,
} from "../utils/tool-registry.js";
import {
  destructive,
  destructiveIdempotent,
  readOnly,
  writeNonDestructive,
  writeSensitive,
} from "../utils/annotations.js";
import {
  mergeQuery,
  paginationFields,
  traceIdField,
} from "../utils/pagination.js";

export function registerFirewallTools(
  server: McpServer,
  client: ContaboClient,
): void {
  registerContaboTool(server, client, {
    name: "contabo_firewalls_list",
    description: "List firewall definitions in your Contabo account.",
    inputSchema: {
      ...paginationFields,
      ...traceIdField,
      name: z.string().optional(),
      instanceIds: z
        .string()
        .optional()
        .describe("Filter by instance ID(s)"),
    },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: "/v1/firewalls",
        query: mergeQuery(args, {
          name: args.name,
          instanceIds: args.instanceIds,
        }),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_firewalls_get",
    description: "Get a firewall by UUID firewallId.",
    inputSchema: {
      firewallId: z.string().uuid(),
      ...paginationFields,
      ...traceIdField,
      name: z.string().optional(),
      instanceIds: z.string().optional(),
    },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: `/v1/firewalls/${args.firewallId}`,
        query: mergeQuery(args, {
          name: args.name,
          instanceIds: args.instanceIds,
        }),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_firewalls_create",
    description:
      "Create a firewall. Body: name, status (required); optional description, rules.",
    inputSchema: { body: bodyField, ...traceIdField },
    annotations: writeSensitive,
    handler: async (args) =>
      client.request({
        method: "POST",
        path: "/v1/firewalls",
        body: args.body ?? {},
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_firewalls_update",
    description:
      "Update firewall metadata (PATCH). Body: optional name, status, description.",
    inputSchema: {
      firewallId: z.string().uuid(),
      body: bodyField,
      ...traceIdField,
    },
    annotations: writeNonDestructive,
    handler: async (args) =>
      client.request({
        method: "PATCH",
        path: `/v1/firewalls/${args.firewallId}`,
        body: args.body ?? {},
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_firewalls_update_rules",
    description:
      "Replace firewall rules (PUT). Body: rules object per Contabo API.",
    inputSchema: {
      firewallId: z.string().uuid(),
      body: bodyField,
      ...traceIdField,
    },
    annotations: destructive,
    handler: async (args) =>
      client.request({
        method: "PUT",
        path: `/v1/firewalls/${args.firewallId}`,
        body: args.body ?? {},
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_firewalls_delete",
    description: "Delete a firewall by UUID.",
    inputSchema: {
      firewallId: z.string().uuid(),
      ...traceIdField,
    },
    annotations: destructiveIdempotent,
    handler: async (args) =>
      client.request({
        method: "DELETE",
        path: `/v1/firewalls/${args.firewallId}`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_firewalls_attach_instance",
    description: "Attach a compute instance to a firewall.",
    inputSchema: {
      firewallId: z.string().uuid(),
      instanceId: z.number().int(),
      ...traceIdField,
    },
    annotations: writeSensitive,
    handler: async (args) =>
      client.request({
        method: "POST",
        path: `/v1/firewalls/${args.firewallId}/instances/${args.instanceId}`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_firewalls_detach_instance",
    description: "Detach a compute instance from a firewall.",
    inputSchema: {
      firewallId: z.string().uuid(),
      instanceId: z.number().int(),
      ...traceIdField,
    },
    annotations: destructiveIdempotent,
    handler: async (args) =>
      client.request({
        method: "DELETE",
        path: `/v1/firewalls/${args.firewallId}/instances/${args.instanceId}`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_firewalls_preset_rules_list",
    description: "List Contabo firewall preset rules templates.",
    inputSchema: {
      ...paginationFields,
      ...traceIdField,
      name: z.string().optional(),
    },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: "/v1/firewalls/preset-rules",
        query: mergeQuery(args, { name: args.name }),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_firewalls_audits_list",
    description: "List audit history for firewall changes.",
    inputSchema: { ...paginationFields, ...traceIdField },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: "/v1/firewalls/audits",
        query: mergeQuery(args),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });
}
