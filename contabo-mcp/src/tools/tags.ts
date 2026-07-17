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

const tagResourceType = z
  .enum(["instance", "image", "object-storage"])
  .describe("Resource type: instance, image, or object-storage");

export function registerTagTools(
  server: McpServer,
  client: ContaboClient,
): void {
  registerContaboTool(server, client, {
    name: "contabo_tags_list",
    description: "List tags in your Contabo account.",
    inputSchema: {
      ...paginationFields,
      ...traceIdField,
      name: z.string().optional(),
    },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: "/v1/tags",
        query: mergeQuery(args, { name: args.name }),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_tags_get",
    description: "Get a tag by numeric tagId.",
    inputSchema: {
      tagId: z.number().int(),
      ...traceIdField,
    },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: `/v1/tags/${args.tagId}`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_tags_create",
    description:
      "Create a tag. Body: name, color (required); optional description.",
    inputSchema: { body: bodyField, ...traceIdField },
    annotations: writeSensitive,
    handler: async (args) =>
      client.request({
        method: "POST",
        path: "/v1/tags",
        body: args.body ?? {},
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_tags_update",
    description: "Update tag name, color, and/or description.",
    inputSchema: {
      tagId: z.number().int(),
      body: bodyField,
      ...traceIdField,
    },
    annotations: writeNonDestructive,
    handler: async (args) =>
      client.request({
        method: "PATCH",
        path: `/v1/tags/${args.tagId}`,
        body: args.body ?? {},
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_tags_delete",
    description: "Delete a tag by ID.",
    inputSchema: {
      tagId: z.number().int(),
      ...traceIdField,
    },
    annotations: destructiveIdempotent,
    handler: async (args) =>
      client.request({
        method: "DELETE",
        path: `/v1/tags/${args.tagId}`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_tag_assignments_list",
    description: "List resources assigned to a tag.",
    inputSchema: {
      tagId: z.number().int(),
      ...paginationFields,
      ...traceIdField,
      resourceType: tagResourceType.optional(),
    },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: `/v1/tags/${args.tagId}/assignments`,
        query: mergeQuery(args, { resourceType: args.resourceType }),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_tag_assignments_get",
    description:
      "Get a specific tag assignment. resourceType: instance|image|object-storage; resourceId is the resource UUID/ID string.",
    inputSchema: {
      tagId: z.number().int(),
      resourceType: tagResourceType,
      resourceId: z.string(),
      ...traceIdField,
    },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: `/v1/tags/${args.tagId}/assignments/${args.resourceType}/${encodeURIComponent(String(args.resourceId))}`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_tag_assignments_create",
    description:
      "Assign a tag to a resource. resourceType: instance|image|object-storage.",
    inputSchema: {
      tagId: z.number().int(),
      resourceType: tagResourceType,
      resourceId: z.string(),
      ...traceIdField,
    },
    annotations: writeSensitive,
    handler: async (args) =>
      client.request({
        method: "POST",
        path: `/v1/tags/${args.tagId}/assignments/${args.resourceType}/${encodeURIComponent(String(args.resourceId))}`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_tag_assignments_delete",
    description: "Remove a tag assignment from a resource.",
    inputSchema: {
      tagId: z.number().int(),
      resourceType: tagResourceType,
      resourceId: z.string(),
      ...traceIdField,
    },
    annotations: destructiveIdempotent,
    handler: async (args) =>
      client.request({
        method: "DELETE",
        path: `/v1/tags/${args.tagId}/assignments/${args.resourceType}/${encodeURIComponent(String(args.resourceId))}`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_tags_audits_list",
    description: "List audit history for tag changes.",
    inputSchema: { ...paginationFields, ...traceIdField },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: "/v1/tags/audits",
        query: mergeQuery(args),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_tag_assignments_audits_list",
    description: "List audit history for tag assignment changes.",
    inputSchema: { ...paginationFields, ...traceIdField },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: "/v1/tags/assignments/audits",
        query: mergeQuery(args),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });
}
