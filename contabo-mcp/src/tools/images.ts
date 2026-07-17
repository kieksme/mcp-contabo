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

export function registerImageTools(
  server: McpServer,
  client: ContaboClient,
): void {
  registerContaboTool(server, client, {
    name: "contabo_images_list",
    description:
      "List standard and custom compute images. Use image IDs when creating or reinstalling instances.",
    inputSchema: {
      ...paginationFields,
      ...traceIdField,
      name: z.string().optional(),
      standardImage: z
        .boolean()
        .optional()
        .describe("Filter standard (true) vs custom (false) images"),
      search: z.string().optional(),
    },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: "/v1/compute/images",
        query: mergeQuery(args, {
          name: args.name,
          standardImage: args.standardImage,
          search: args.search,
        }),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_images_get",
    description: "Get a compute image by UUID imageId.",
    inputSchema: {
      imageId: z.string().uuid(),
      ...traceIdField,
    },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: `/v1/compute/images/${args.imageId}`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_images_create",
    description:
      "Upload/register a custom image. Body: name, url, osType, version (required); optional description.",
    inputSchema: { body: bodyField, ...traceIdField },
    annotations: writeSensitive,
    handler: async (args) =>
      client.request({
        method: "POST",
        path: "/v1/compute/images",
        body: args.body ?? {},
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_images_update",
    description: "Update custom image name and/or description.",
    inputSchema: {
      imageId: z.string().uuid(),
      body: bodyField,
      ...traceIdField,
    },
    annotations: writeNonDestructive,
    handler: async (args) =>
      client.request({
        method: "PATCH",
        path: `/v1/compute/images/${args.imageId}`,
        body: args.body ?? {},
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_images_delete",
    description: "Delete an uploaded custom image by UUID.",
    inputSchema: {
      imageId: z.string().uuid(),
      ...traceIdField,
    },
    annotations: destructiveIdempotent,
    handler: async (args) =>
      client.request({
        method: "DELETE",
        path: `/v1/compute/images/${args.imageId}`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_images_stats",
    description: "Get statistics for your custom images (quota/usage).",
    inputSchema: { ...traceIdField },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: "/v1/compute/images/stats",
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_images_audits_list",
    description: "List audit history for custom image changes.",
    inputSchema: { ...paginationFields, ...traceIdField },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: "/v1/compute/images/audits",
        query: mergeQuery(args),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });
}
