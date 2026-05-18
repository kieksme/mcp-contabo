import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ContaboClient } from "../client.js";
import {
  bodyField,
  registerContaboTool,
} from "../utils/tool-registry.js";
import {
  destructive,
  powerAction,
  readOnly,
  readOnlyOpenWorld,
  writeBilling,
  writeNonDestructive,
} from "../utils/annotations.js";
import {
  mergeQuery,
  paginationFields,
  traceIdField,
} from "../utils/pagination.js";

export function registerInstanceTools(
  server: McpServer,
  client: ContaboClient,
): void {
  const baseListQuery = {
    ...paginationFields,
    ...traceIdField,
    name: z.string().optional().describe("Filter by display name"),
    dataCenter: z.string().optional().describe("Filter by data center"),
    region: z.string().optional().describe("Filter by region"),
    instanceId: z
      .number()
      .int()
      .optional()
      .describe("Filter by instance ID"),
    displayName: z.string().optional(),
    status: z.string().optional().describe("e.g. provisioning, running"),
    ipAddress: z.string().optional(),
  };

  registerContaboTool(server, client, {
    name: "contabo_instances_list",
    description:
      "List VPS/VDS compute instances in your Contabo account. Supports pagination and filters.",
    inputSchema: baseListQuery,
    annotations: readOnlyOpenWorld,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: "/v1/compute/instances",
        query: mergeQuery(args, {
          name: args.name,
          dataCenter: args.dataCenter,
          region: args.region,
          instanceId: args.instanceId,
          displayName: args.displayName,
          status: args.status,
          ipAddress: args.ipAddress,
        }),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_instances_get",
    description: "Get a single compute instance by numeric instanceId.",
    inputSchema: {
      instanceId: z.number().int().describe("Instance ID"),
      ...traceIdField,
    },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: `/v1/compute/instances/${args.instanceId}`,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_instances_create",
    description:
      "Create/order a new VPS or VDS. Body must include imageId, productId, and region (e.g. EU). Optional: period, displayName, rootPassword, sshKeys, userData, defaultUser, addOns, applicationId.",
    inputSchema: { body: bodyField, ...traceIdField },
    annotations: writeBilling,
    handler: async (args) =>
      client.request({
        method: "POST",
        path: "/v1/compute/instances",
        body: args.body ?? {},
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_instances_update",
    description:
      "PATCH update instance metadata (e.g. displayName). Does not reinstall the OS.",
    inputSchema: {
      instanceId: z.number().int(),
      body: bodyField,
      ...traceIdField,
    },
    annotations: writeNonDestructive,
    handler: async (args) =>
      client.request({
        method: "PATCH",
        path: `/v1/compute/instances/${args.instanceId}`,
        body: args.body ?? {},
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_instances_reinstall",
    description:
      "PUT reinstall instance with a new image. Body typically includes imageId; optional rootPassword, sshKeys, userData, applicationId.",
    inputSchema: {
      instanceId: z.number().int(),
      body: bodyField,
      ...traceIdField,
    },
    annotations: destructive,
    handler: async (args) =>
      client.request({
        method: "PUT",
        path: `/v1/compute/instances/${args.instanceId}`,
        body: args.body ?? {},
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_instances_cancel",
    description:
      "Cancel instance at end of billing period. Optional body: cancelDate.",
    inputSchema: {
      instanceId: z.number().int(),
      body: bodyField,
      ...traceIdField,
    },
    annotations: destructive,
    handler: async (args) =>
      client.request({
        method: "POST",
        path: `/v1/compute/instances/${args.instanceId}/cancel`,
        body: args.body,
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_instances_upgrade",
    description:
      "Upgrade instance add-ons (e.g. privateNetwork, backup, additionalIps). For automated backups set body.backup to {}.",
    inputSchema: {
      instanceId: z.number().int(),
      body: bodyField,
      ...traceIdField,
    },
    annotations: writeBilling,
    handler: async (args) =>
      client.request({
        method: "POST",
        path: `/v1/compute/instances/${args.instanceId}/upgrade`,
        body: args.body ?? {},
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  const action = (
    name: string,
    actionPath: string,
    description: string,
    isDestructive: boolean,
    body = false,
  ) => {
    registerContaboTool(server, client, {
      name,
      description,
      inputSchema: {
        instanceId: z.number().int(),
        ...(body ? { body: bodyField } : {}),
        ...traceIdField,
      },
      annotations: isDestructive ? powerAction : writeNonDestructive,
      handler: async (args) =>
        client.request({
          method: "POST",
          path: `/v1/compute/instances/${args.instanceId}/actions/${actionPath}`,
          body: body ? args.body : undefined,
          xTraceId: args.xTraceId as string | undefined,
        }),
    });
  };

  action(
    "contabo_instances_start",
    "start",
    "Power on a stopped instance.",
    false,
  );
  action(
    "contabo_instances_stop",
    "stop",
    "Hard power off (may cause data loss). Prefer shutdown when possible.",
    true,
  );
  action(
    "contabo_instances_restart",
    "restart",
    "Reboot a running instance.",
    true,
  );
  action(
    "contabo_instances_shutdown",
    "shutdown",
    "Graceful ACPI shutdown.",
    true,
  );
  action(
    "contabo_instances_rescue",
    "rescue",
    "Boot into Linux rescue mode. Optional body: rootPassword, sshKeys, userData.",
    true,
    true,
  );
  action(
    "contabo_instances_reset_password",
    "resetPassword",
    "Reset instance root password. Body must include rootPassword.",
    true,
    true,
  );

  registerContaboTool(server, client, {
    name: "contabo_instances_audits_list",
    description: "List audit log entries for instance CRUD changes.",
    inputSchema: {
      ...paginationFields,
      ...traceIdField,
      instanceId: z.number().int().optional(),
      requestId: z.string().optional(),
      changedBy: z.string().optional(),
      startDate: z.string().optional().describe("ISO date"),
      endDate: z.string().optional(),
    },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: "/v1/compute/instances/audits",
        query: mergeQuery(args, {
          instanceId: args.instanceId,
          requestId: args.requestId,
          changedBy: args.changedBy,
          startDate: args.startDate,
          endDate: args.endDate,
        }),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });

  registerContaboTool(server, client, {
    name: "contabo_instances_actions_audits_list",
    description:
      "List audit log for instance actions (start, stop, rescue, etc.).",
    inputSchema: {
      ...paginationFields,
      ...traceIdField,
      instanceId: z.number().int().optional(),
      requestId: z.string().optional(),
    },
    annotations: readOnly,
    handler: async (args) =>
      client.request({
        method: "GET",
        path: "/v1/compute/instances/actions/audits",
        query: mergeQuery(args, {
          instanceId: args.instanceId,
          requestId: args.requestId,
        }),
        xTraceId: args.xTraceId as string | undefined,
      }),
  });
}
