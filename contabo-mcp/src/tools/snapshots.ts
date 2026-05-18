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
} from "../utils/annotations.js";
import {
  mergeQuery,
  paginationFields,
  traceIdField,
} from "../utils/pagination.js";

export function registerSnapshotTools(
  server: McpServer,
  client: ContaboClient,
): void {
  registerContaboTool(server, client, {
    name: "contabo_snapshots_list",
    description:
      "List snapshots (backups) for a compute instance. Use contabo_instances_upgrade with backup:{} for automated backup addon.",
    inputSchema: {
      instanceId: z.number().int(),
      ...paginationFields,
      ...traceIdField,
      name: z.string().optional(),
    },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: `/v1/compute/instances/${args.instanceId}/snapshots`,
        query: mergeQuery(args, { name: args.name }),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_snapshots_get",
    description: "Get a specific instance snapshot by snapshotId.",
    inputSchema: {
      instanceId: z.number().int(),
      snapshotId: z.string(),
      ...traceIdField,
    },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: `/v1/compute/instances/${args.instanceId}/snapshots/${args.snapshotId}`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_snapshots_create",
    description:
      "Create a new instance snapshot. Body: name (required), optional description.",
    inputSchema: {
      instanceId: z.number().int(),
      body: bodyField,
      ...traceIdField,
    },
    annotations: writeNonDestructive,
    handler: async (args) =>
      client.request({
        method: "POST",
        path: `/v1/compute/instances/${args.instanceId}/snapshots`,
        body: args.body ?? {},
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_snapshots_update",
    description: "Update snapshot name or description.",
    inputSchema: {
      instanceId: z.number().int(),
      snapshotId: z.string(),
      body: bodyField,
      ...traceIdField,
    },
    annotations: writeNonDestructive,
    handler: async (args) =>
      client.request({
        method: "PATCH",
        path: `/v1/compute/instances/${args.instanceId}/snapshots/${args.snapshotId}`,
        body: args.body ?? {},
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_snapshots_delete",
    description: "Delete a snapshot permanently.",
    inputSchema: {
      instanceId: z.number().int(),
      snapshotId: z.string(),
      ...traceIdField,
    },
    annotations: destructiveIdempotent,
    handler: async (args) =>
      client.request({
        method: "DELETE",
        path: `/v1/compute/instances/${args.instanceId}/snapshots/${args.snapshotId}`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_snapshots_rollback",
    description:
      "Rollback instance to snapshot. Deletes newer snapshots automatically.",
    inputSchema: {
      instanceId: z.number().int(),
      snapshotId: z.string(),
      ...traceIdField,
    },
    annotations: destructive,
    handler: async (args) =>
      client.request({
        method: "POST",
        path: `/v1/compute/instances/${args.instanceId}/snapshots/${args.snapshotId}/rollback`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_snapshots_audits_list",
    description: "List audit history for snapshot API operations.",
    inputSchema: {
      ...paginationFields,
      ...traceIdField,
      instanceId: z.number().int().optional(),
      snapshotId: z.string().optional(),
    },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: "/v1/compute/snapshots/audits",
        query: mergeQuery(args, {
          instanceId: args.instanceId,
          snapshotId: args.snapshotId,
        }),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });
}
