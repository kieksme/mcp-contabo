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

export function registerDomainTools(
  server: McpServer,
  client: ContaboClient,
): void {
  registerContaboTool(server, client, {
    name: "contabo_domains_list",
    description: "List domains registered in your Contabo account.",
    inputSchema: {
      ...paginationFields,
      ...traceIdField,
      domainName: z.string().optional(),
    },
    annotations: { readOnlyHint: true },
    handler: async (args) =>
      client.request({
        method: "GET",
        path: "/v1/domains",
        query: mergeQuery(args, { domainName: args.domainName }),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_domains_get",
    description: "Get details for a specific domain name.",
    inputSchema: {
      domain: z.string().describe("Domain name, e.g. example.com"),
      ...traceIdField,
    },
    annotations: { readOnlyHint: true },
    handler: async (args) =>
      client.request({
        method: "GET",
        path: `/v1/domains/${encodeURIComponent(String(args.domain))}`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_domains_create",
    description:
      "Register or transfer a domain. Body fields depend on operation (register vs transfer).",
    inputSchema: { body: bodyField, ...traceIdField },
    handler: async (args) =>
      client.request({
        method: "POST",
        path: "/v1/domains",
        body: args.body ?? {},
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_domains_update",
    description: "Update domain settings (PATCH).",
    inputSchema: {
      domain: z.string(),
      body: bodyField,
      ...traceIdField,
    },
    handler: async (args) =>
      client.request({
        method: "PATCH",
        path: `/v1/domains/${encodeURIComponent(String(args.domain))}`,
        body: args.body ?? {},
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_domains_cancel",
    description: "Cancel domain at end of billing period.",
    inputSchema: {
      domain: z.string(),
      body: bodyField,
      ...traceIdField,
    },
    annotations: { destructiveHint: true },
    handler: async (args) =>
      client.request({
        method: "POST",
        path: `/v1/domains/${encodeURIComponent(String(args.domain))}/cancel`,
        body: args.body,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_domains_revoke_cancellation",
    description: "Revoke a pending domain cancellation.",
    inputSchema: { domain: z.string(), ...traceIdField },
    handler: async (args) =>
      client.request({
        method: "POST",
        path: `/v1/domains/${encodeURIComponent(String(args.domain))}/revoke-cancellation`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_domains_auth_code",
    description: "Generate auth/EPP code for domain transfer out.",
    inputSchema: { domain: z.string(), ...traceIdField },
    handler: async (args) =>
      client.request({
        method: "POST",
        path: `/v1/domains/${encodeURIComponent(String(args.domain))}/generate-auth-code`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_domains_transfer_out_confirm",
    description: "Confirm domain transfer out to another registrar.",
    inputSchema: {
      domain: z.string(),
      body: bodyField,
      ...traceIdField,
    },
    annotations: { destructiveHint: true },
    handler: async (args) =>
      client.request({
        method: "POST",
        path: `/v1/domains/${encodeURIComponent(String(args.domain))}/transfer-out`,
        body: args.body,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_domains_transfer_out_revoke",
    description: "Revoke an in-progress domain transfer out.",
    inputSchema: { domain: z.string(), ...traceIdField },
    handler: async (args) =>
      client.request({
        method: "DELETE",
        path: `/v1/domains/${encodeURIComponent(String(args.domain))}/transfer-out`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_domains_check_availability",
    description: "Check if a domain name is available for registration.",
    inputSchema: {
      domain: z.string().describe("Domain to check, e.g. example.com"),
      body: bodyField,
      ...traceIdField,
    },
    annotations: { readOnlyHint: true },
    handler: async (args) =>
      client.request({
        method: "POST",
        path: `/v1/registries-domains/${encodeURIComponent(String(args.domain))}/check-availability`,
        body: args.body,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_domains_audits_list",
    description: "List audit history for domain changes.",
    inputSchema: { ...paginationFields, ...traceIdField },
    annotations: { readOnlyHint: true },
    handler: async (args) =>
      client.request({
        method: "GET",
        path: "/v1/domains/audits",
        query: mergeQuery(args),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_domain_handles_list",
    description: "List domain contact handles.",
    inputSchema: { ...paginationFields, ...traceIdField },
    annotations: { readOnlyHint: true },
    handler: async (args) =>
      client.request({
        method: "GET",
        path: "/v1/domains/handles",
        query: mergeQuery(args),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_domain_handles_get",
    description: "Get a domain handle by handleId.",
    inputSchema: {
      handleId: z.number().int(),
      ...traceIdField,
    },
    annotations: { readOnlyHint: true },
    handler: async (args) =>
      client.request({
        method: "GET",
        path: `/v1/domains/handles/${args.handleId}`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_domain_handles_create",
    description: "Create a domain contact handle.",
    inputSchema: { body: bodyField, ...traceIdField },
    handler: async (args) =>
      client.request({
        method: "POST",
        path: "/v1/domains/handles",
        body: args.body ?? {},
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_domain_handles_update",
    description: "Update a domain handle (PUT).",
    inputSchema: {
      handleId: z.number().int(),
      body: bodyField,
      ...traceIdField,
    },
    handler: async (args) =>
      client.request({
        method: "PUT",
        path: `/v1/domains/handles/${args.handleId}`,
        body: args.body ?? {},
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_domain_handles_delete",
    description: "Delete a domain handle.",
    inputSchema: {
      handleId: z.number().int(),
      ...traceIdField,
    },
    annotations: { destructiveHint: true, idempotentHint: true },
    handler: async (args) =>
      client.request({
        method: "DELETE",
        path: `/v1/domains/handles/${args.handleId}`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_domain_handles_set_default",
    description: "Set a handle as the default contact handle.",
    inputSchema: {
      handleId: z.number().int(),
      body: bodyField,
      ...traceIdField,
    },
    handler: async (args) =>
      client.request({
        method: "PATCH",
        path: `/v1/domains/handles/${args.handleId}/default`,
        body: args.body,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_domain_handles_audits_list",
    description: "List audit history for domain handle changes.",
    inputSchema: { ...paginationFields, ...traceIdField },
    annotations: { readOnlyHint: true },
    handler: async (args) =>
      client.request({
        method: "GET",
        path: "/v1/domains/handles/audits",
        query: mergeQuery(args),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });
}
