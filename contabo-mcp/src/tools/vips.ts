import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ContaboClient } from "../client.js";
import { registerContaboTool } from "../utils/tool-registry.js";
import {
  destructiveIdempotent,
  readOnly,
  writeSensitive,
} from "../utils/annotations.js";
import {
  mergeQuery,
  paginationFields,
  traceIdField,
} from "../utils/pagination.js";

export function registerVipTools(
  server: McpServer,
  client: ContaboClient,
): void {
  registerContaboTool(server, client, {
    name: "contabo_vips_list",
    description: "List VIPs (extra IPs) in your Contabo account.",
    inputSchema: {
      ...paginationFields,
      ...traceIdField,
      resourceId: z.string().optional(),
      resourceType: z.string().optional(),
      resourceName: z.string().optional(),
      resourceDisplayName: z.string().optional(),
      ipVersion: z.string().optional(),
      ips: z.string().optional(),
      ip: z.string().optional(),
      type: z.string().optional(),
      dataCenter: z.string().optional(),
      region: z.string().optional(),
    },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: "/v1/vips",
        query: mergeQuery(args, {
          resourceId: args.resourceId,
          resourceType: args.resourceType,
          resourceName: args.resourceName,
          resourceDisplayName: args.resourceDisplayName,
          ipVersion: args.ipVersion,
          ips: args.ips,
          ip: args.ip,
          type: args.type,
          dataCenter: args.dataCenter,
          region: args.region,
        }),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_vips_get",
    description: "Get a VIP by IP address.",
    inputSchema: {
      ip: z.string(),
      ...traceIdField,
    },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: `/v1/vips/${encodeURIComponent(String(args.ip))}`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_vips_assign",
    description:
      "Assign a VIP to a resource. resourceType is instances or bare-metal.",
    inputSchema: {
      ip: z.string(),
      resourceType: z.enum(["instances", "bare-metal"]),
      resourceId: z.number().int(),
      ...traceIdField,
    },
    annotations: writeSensitive,
    handler: async (args) =>
      client.request({
        method: "POST",
        path: `/v1/vips/${encodeURIComponent(String(args.ip))}/${args.resourceType}/${args.resourceId}`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_vips_unassign",
    description:
      "Unassign a VIP from a resource. resourceType is instances or bare-metal.",
    inputSchema: {
      ip: z.string(),
      resourceType: z.enum(["instances", "bare-metal"]),
      resourceId: z.number().int(),
      ...traceIdField,
    },
    annotations: destructiveIdempotent,
    handler: async (args) =>
      client.request({
        method: "DELETE",
        path: `/v1/vips/${encodeURIComponent(String(args.ip))}/${args.resourceType}/${args.resourceId}`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_vips_audits_list",
    description: "List audit history for VIP changes.",
    inputSchema: { ...paginationFields, ...traceIdField },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: "/v1/vips/audits",
        query: mergeQuery(args),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });
}
