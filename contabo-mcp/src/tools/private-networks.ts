import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ContaboClient } from "../client.js";
import {
  bodyField,
  registerContaboTool,
} from "../utils/tool-registry.js";
import {
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

export function registerPrivateNetworkTools(
  server: McpServer,
  client: ContaboClient,
): void {
  registerContaboTool(server, client, {
    name: "contabo_private_networks_list",
    description: "List private networks in your Contabo account.",
    inputSchema: {
      ...paginationFields,
      ...traceIdField,
      name: z.string().optional(),
      instanceIds: z.string().optional(),
      region: z.string().optional(),
      dataCenter: z.string().optional(),
    },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: "/v1/private-networks",
        query: mergeQuery(args, {
          name: args.name,
          instanceIds: args.instanceIds,
          region: args.region,
          dataCenter: args.dataCenter,
        }),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_private_networks_get",
    description: "Get a private network by numeric privateNetworkId.",
    inputSchema: {
      privateNetworkId: z.number().int(),
      ...traceIdField,
    },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: `/v1/private-networks/${args.privateNetworkId}`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_private_networks_create",
    description:
      "Create a private network. Body: name (required); optional region, description.",
    inputSchema: { body: bodyField, ...traceIdField },
    annotations: writeSensitive,
    handler: async (args) =>
      client.request({
        method: "POST",
        path: "/v1/private-networks",
        body: args.body ?? {},
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_private_networks_update",
    description: "Update private network name and/or description.",
    inputSchema: {
      privateNetworkId: z.number().int(),
      body: bodyField,
      ...traceIdField,
    },
    annotations: writeNonDestructive,
    handler: async (args) =>
      client.request({
        method: "PATCH",
        path: `/v1/private-networks/${args.privateNetworkId}`,
        body: args.body ?? {},
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_private_networks_delete",
    description: "Delete a private network by ID.",
    inputSchema: {
      privateNetworkId: z.number().int(),
      ...traceIdField,
    },
    annotations: destructiveIdempotent,
    handler: async (args) =>
      client.request({
        method: "DELETE",
        path: `/v1/private-networks/${args.privateNetworkId}`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_private_networks_attach_instance",
    description: "Attach a compute instance to a private network.",
    inputSchema: {
      privateNetworkId: z.number().int(),
      instanceId: z.number().int(),
      ...traceIdField,
    },
    annotations: writeSensitive,
    handler: async (args) =>
      client.request({
        method: "POST",
        path: `/v1/private-networks/${args.privateNetworkId}/instances/${args.instanceId}`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_private_networks_detach_instance",
    description: "Detach a compute instance from a private network.",
    inputSchema: {
      privateNetworkId: z.number().int(),
      instanceId: z.number().int(),
      ...traceIdField,
    },
    annotations: destructiveIdempotent,
    handler: async (args) =>
      client.request({
        method: "DELETE",
        path: `/v1/private-networks/${args.privateNetworkId}/instances/${args.instanceId}`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_private_networks_audits_list",
    description: "List audit history for private network changes.",
    inputSchema: { ...paginationFields, ...traceIdField },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: "/v1/private-networks/audits",
        query: mergeQuery(args),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });
}
