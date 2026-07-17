import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ContaboClient } from "../client.js";
import { registerContaboTool } from "../utils/tool-registry.js";
import { readOnly } from "../utils/annotations.js";
import {
  mergeQuery,
  paginationFields,
  traceIdField,
} from "../utils/pagination.js";

export function registerDataCenterTools(
  server: McpServer,
  client: ContaboClient,
): void {
  registerContaboTool(server, client, {
    name: "contabo_data_centers_list",
    description:
      "List Contabo data centers (slug, region). Useful when creating object storage or choosing instance regions.",
    inputSchema: {
      ...paginationFields,
      ...traceIdField,
      slug: z.string().optional(),
      name: z.string().optional(),
      regionName: z.string().optional(),
      regionSlug: z.string().optional(),
    },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: "/v1/data-centers",
        query: mergeQuery(args, {
          slug: args.slug,
          name: args.name,
          regionName: args.regionName,
          regionSlug: args.regionSlug,
        }),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });
}
