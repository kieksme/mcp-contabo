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

export function registerDnsTools(
  server: McpServer,
  client: ContaboClient,
): void {
  registerContaboTool(server, client, {
    name: "contabo_dns_zones_list",
    description: "List DNS zones in your Contabo account.",
    inputSchema: {
      ...paginationFields,
      ...traceIdField,
      zoneName: z.string().optional(),
    },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: "/v1/dns/zones",
        query: mergeQuery(args, { zoneName: args.zoneName }),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_dns_zones_get",
    description: "Get a DNS zone by zoneName (e.g. example.com).",
    inputSchema: {
      zoneName: z.string(),
      ...traceIdField,
    },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: `/v1/dns/zones/${encodeURIComponent(String(args.zoneName))}`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_dns_zones_create",
    description: "Create a DNS zone. Body: zoneName (required).",
    inputSchema: { body: bodyField, ...traceIdField },
    annotations: writeSensitive,
    handler: async (args) =>
      client.request({
        method: "POST",
        path: "/v1/dns/zones",
        body: args.body ?? {},
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_dns_zones_delete",
    description: "Delete a DNS zone and its records.",
    inputSchema: {
      zoneName: z.string(),
      ...traceIdField,
    },
    annotations: destructiveIdempotent,
    handler: async (args) =>
      client.request({
        method: "DELETE",
        path: `/v1/dns/zones/${encodeURIComponent(String(args.zoneName))}`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_dns_zone_records_list",
    description: "List DNS records for a zone.",
    inputSchema: {
      zoneName: z.string(),
      ...paginationFields,
      ...traceIdField,
      search: z.string().optional(),
    },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: `/v1/dns/zones/${encodeURIComponent(String(args.zoneName))}/records`,
        query: mergeQuery(args, { search: args.search }),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_dns_zone_records_create",
    description:
      "Create a DNS zone record. Body: type, ttl, prio, data (required); optional name, port, weight, flag, tag.",
    inputSchema: {
      zoneName: z.string(),
      body: bodyField,
      ...traceIdField,
    },
    annotations: writeSensitive,
    handler: async (args) =>
      client.request({
        method: "POST",
        path: `/v1/dns/zones/${encodeURIComponent(String(args.zoneName))}/records`,
        body: args.body ?? {},
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_dns_zone_records_update",
    description:
      "Update a DNS zone record. Body: type, ttl, prio, data (required); optional port, weight, flag, tag.",
    inputSchema: {
      zoneName: z.string(),
      recordId: z.number().int(),
      body: bodyField,
      ...traceIdField,
    },
    annotations: writeNonDestructive,
    handler: async (args) =>
      client.request({
        method: "PATCH",
        path: `/v1/dns/zones/${encodeURIComponent(String(args.zoneName))}/records/${args.recordId}`,
        body: args.body ?? {},
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_dns_zone_records_delete",
    description: "Delete a single DNS zone record by recordId.",
    inputSchema: {
      zoneName: z.string(),
      recordId: z.number().int(),
      ...traceIdField,
    },
    annotations: destructiveIdempotent,
    handler: async (args) =>
      client.request({
        method: "DELETE",
        path: `/v1/dns/zones/${encodeURIComponent(String(args.zoneName))}/records/${args.recordId}`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_dns_zone_records_bulk_delete",
    description:
      "Bulk-delete DNS zone records. Body: recordIds (array of integers, required).",
    inputSchema: {
      zoneName: z.string(),
      body: bodyField,
      ...traceIdField,
    },
    annotations: destructive,
    handler: async (args) =>
      client.request({
        method: "DELETE",
        path: `/v1/dns/zones/${encodeURIComponent(String(args.zoneName))}/records/bulk`,
        body: args.body ?? {},
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_dns_zones_audits_list",
    description: "List audit history for DNS zone changes.",
    inputSchema: { ...paginationFields, ...traceIdField },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: "/v1/dns/zones/audits",
        query: mergeQuery(args),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_dns_records_audits_list",
    description: "List audit history for DNS record changes.",
    inputSchema: { ...paginationFields, ...traceIdField },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: "/v1/dns/records/audits",
        query: mergeQuery(args),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_dns_ptrs_list",
    description: "List PTR (reverse DNS) records.",
    inputSchema: {
      ...paginationFields,
      ...traceIdField,
      ips: z
        .string()
        .optional()
        .describe("Filter by IP(s); API-specific format"),
      search: z.string().optional(),
    },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: "/v1/dns/ptrs",
        query: mergeQuery(args, { ips: args.ips, search: args.search }),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_dns_ptrs_get",
    description: "Get a PTR record by IP address.",
    inputSchema: {
      ipAddress: z.string(),
      ...traceIdField,
    },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: `/v1/dns/ptrs/${encodeURIComponent(String(args.ipAddress))}`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_dns_ptrs_create",
    description: "Create a PTR record. Body: ptr, ip, ttl (required).",
    inputSchema: { body: bodyField, ...traceIdField },
    annotations: writeSensitive,
    handler: async (args) =>
      client.request({
        method: "POST",
        path: "/v1/dns/ptrs",
        body: args.body ?? {},
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_dns_ptrs_update",
    description: "Update a PTR record by IP. Body: ptr (required).",
    inputSchema: {
      ipAddress: z.string(),
      body: bodyField,
      ...traceIdField,
    },
    annotations: writeNonDestructive,
    handler: async (args) =>
      client.request({
        method: "PUT",
        path: `/v1/dns/ptrs/${encodeURIComponent(String(args.ipAddress))}`,
        body: args.body ?? {},
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_dns_ptrs_delete",
    description: "Delete a PTR record by IP address.",
    inputSchema: {
      ipAddress: z.string(),
      ...traceIdField,
    },
    annotations: destructiveIdempotent,
    handler: async (args) =>
      client.request({
        method: "DELETE",
        path: `/v1/dns/ptrs/${encodeURIComponent(String(args.ipAddress))}`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });
}
