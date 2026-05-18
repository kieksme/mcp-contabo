import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ContaboClient } from "../client.js";
import {
  bodyField,
  registerContaboTool,
} from "../utils/tool-registry.js";
import {
  mergeQuery,
  paginationFields,
  traceIdField,
} from "../utils/pagination.js";

export function registerSecretTools(
  server: McpServer,
  client: ContaboClient,
): void {
  registerContaboTool(server, client, {
    name: "contabo_secrets_list",
    description:
      "List stored secrets (passwords/SSH keys). Secret values may be masked in responses.",
    inputSchema: {
      ...paginationFields,
      ...traceIdField,
      name: z.string().optional(),
      type: z.enum(["password", "ssh"]).optional(),
    },
    annotations: { readOnlyHint: true },
    handler: async (args) =>
      client.request({
        method: "GET",
        path: "/v1/secrets",
        query: mergeQuery(args, { name: args.name, type: args.type }),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_secrets_get",
    description:
      "Get secret by ID. Values may be masked; never log or expose secret values.",
    inputSchema: {
      secretId: z.number().int(),
      ...traceIdField,
    },
    annotations: { readOnlyHint: true },
    handler: async (args) =>
      client.request({
        method: "GET",
        path: `/v1/secrets/${args.secretId}`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_secrets_create",
    description:
      "Create secret. Body: name, type (password|ssh), value (required).",
    inputSchema: { body: bodyField, ...traceIdField },
    handler: async (args) =>
      client.request({
        method: "POST",
        path: "/v1/secrets",
        body: args.body ?? {},
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_secrets_update",
    description: "Update secret name and/or value.",
    inputSchema: {
      secretId: z.number().int(),
      body: bodyField,
      ...traceIdField,
    },
    handler: async (args) =>
      client.request({
        method: "PATCH",
        path: `/v1/secrets/${args.secretId}`,
        body: args.body ?? {},
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_secrets_delete",
    description: "Delete a secret permanently.",
    inputSchema: {
      secretId: z.number().int(),
      ...traceIdField,
    },
    annotations: { destructiveHint: true, idempotentHint: true },
    handler: async (args) =>
      client.request({
        method: "DELETE",
        path: `/v1/secrets/${args.secretId}`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_secrets_audits_list",
    description: "List audit history for secret changes.",
    inputSchema: { ...paginationFields, ...traceIdField },
    annotations: { readOnlyHint: true },
    handler: async (args) =>
      client.request({
        method: "GET",
        path: "/v1/secrets/audits",
        query: mergeQuery(args),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });
}
