import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ContaboClient } from "../client.js";
import {
  bodyField,
  registerContaboTool,
} from "../utils/tool-registry.js";
import {
  destructive,
  readOnly,
  writeBilling,
  writeNonDestructive,
} from "../utils/annotations.js";
import {
  mergeQuery,
  paginationFields,
  traceIdField,
} from "../utils/pagination.js";

export function registerObjectStorageTools(
  server: McpServer,
  client: ContaboClient,
): void {
  registerContaboTool(server, client, {
    name: "contabo_object_storages_list",
    description: "List S3-compatible object storages in your account.",
    inputSchema: {
      ...paginationFields,
      ...traceIdField,
      displayName: z.string().optional(),
      region: z.string().optional(),
    },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: "/v1/object-storages",
        query: mergeQuery(args, {
          displayName: args.displayName,
          region: args.region,
        }),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_object_storages_get",
    description: "Get object storage by UUID objectStorageId.",
    inputSchema: {
      objectStorageId: z.string().uuid(),
      ...traceIdField,
    },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: `/v1/object-storages/${args.objectStorageId}`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_object_storages_create",
    description:
      "Purchase/create object storage. Body: region, totalPurchasedSpaceTb; optional displayName, autoScaling.",
    inputSchema: { body: bodyField, ...traceIdField },
    annotations: writeBilling,
    handler: async (args) =>
      client.request({
        method: "POST",
        path: "/v1/object-storages",
        body: args.body ?? {},
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_object_storages_update",
    description: "Update object storage display name.",
    inputSchema: {
      objectStorageId: z.string().uuid(),
      body: bodyField,
      ...traceIdField,
    },
    annotations: writeNonDestructive,
    handler: async (args) =>
      client.request({
        method: "PATCH",
        path: `/v1/object-storages/${args.objectStorageId}`,
        body: args.body ?? {},
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_object_storages_cancel",
    description: "Schedule object storage cancellation at next billing date.",
    inputSchema: {
      objectStorageId: z.string().uuid(),
      body: bodyField,
      ...traceIdField,
    },
    annotations: destructive,
    handler: async (args) =>
      client.request({
        method: "PATCH",
        path: `/v1/object-storages/${args.objectStorageId}/cancel`,
        body: args.body,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_object_storages_resize",
    description:
      "Resize object storage or update autoscaling. Body: totalPurchasedSpaceTb and/or autoScaling.",
    inputSchema: {
      objectStorageId: z.string().uuid(),
      body: bodyField,
      ...traceIdField,
    },
    annotations: writeBilling,
    handler: async (args) =>
      client.request({
        method: "POST",
        path: `/v1/object-storages/${args.objectStorageId}/resize`,
        body: args.body ?? {},
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_object_storages_stats",
    description: "Get usage statistics for an object storage.",
    inputSchema: {
      objectStorageId: z.string().uuid(),
      ...traceIdField,
    },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: `/v1/object-storages/${args.objectStorageId}/stats`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_object_storages_audits_list",
    description: "List audit history for object storage changes.",
    inputSchema: { ...paginationFields, ...traceIdField },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: "/v1/object-storages/audits",
        query: mergeQuery(args),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_object_storage_credentials_list",
    description:
      "List S3 credentials for a user. userId is the Contabo API user UUID from the control panel.",
    inputSchema: {
      userId: z.string().uuid(),
      ...paginationFields,
      ...traceIdField,
    },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: `/v1/users/${args.userId}/object-storages/credentials`,
        query: mergeQuery(args),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_object_storage_credentials_get",
    description: "Get S3 credentials for object storage (includes access keys).",
    inputSchema: {
      userId: z.string().uuid(),
      objectStorageId: z.string().uuid(),
      credentialId: z.number().int(),
      ...traceIdField,
    },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: `/v1/users/${args.userId}/object-storages/${args.objectStorageId}/credentials/${args.credentialId}`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_object_storage_credentials_regenerate",
    description: "Regenerate S3 secret key for a credential.",
    inputSchema: {
      userId: z.string().uuid(),
      objectStorageId: z.string().uuid(),
      credentialId: z.number().int(),
      ...traceIdField,
    },
    annotations: destructive,
    handler: async (args) =>
      client.request({
        method: "PATCH",
        path: `/v1/users/${args.userId}/object-storages/${args.objectStorageId}/credentials/${args.credentialId}`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });
}
