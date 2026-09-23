import { Router } from "express";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { ToolCatalog } from "../mcp/tool-catalog.js";

/** Raw shape of one item in Contabo's ListInstancesResponse (openapi/contabo.openapi.json). */
interface ContaboInstance {
  instanceId: number;
  name: string;
  displayName: string;
  status: string;
  productType?: string;
  productName?: string;
  dataCenter?: string;
  region?: string;
  vHostId?: number;
  vHostName?: string;
  defaultUser?: string;
  ipConfig?: {
    v4?: { ip?: string };
    v6?: { ip?: string };
  };
}

/** Table DTO for the frontend — decoupled from Contabo's raw response shape. */
export interface InstanceDto {
  id: number;
  name: string;
  displayName: string;
  status: string;
  ipv4: string | null;
  hostSystem: string | null;
  defaultUser: string | null;
  productType: string | null;
}

function toDto(instance: ContaboInstance): InstanceDto {
  return {
    id: instance.instanceId,
    name: instance.name,
    displayName: instance.displayName,
    status: instance.status,
    ipv4: instance.ipConfig?.v4?.ip ?? null,
    hostSystem: instance.vHostName ?? null,
    defaultUser: instance.defaultUser ?? null,
    productType: instance.productType ?? instance.productName ?? null,
  };
}

/** Unwraps an MCP `callTool()` result's structuredContent, throwing on tool errors. */
async function callTool<T>(
  client: Client,
  name: string,
  args: Record<string, unknown> = {},
): Promise<T> {
  const result = await client.callTool({ name, arguments: args });
  if (result.isError) {
    const message =
      Array.isArray(result.content) && result.content[0]?.type === "text"
        ? result.content[0].text
        : `${name} failed`;
    throw new Error(message);
  }
  return result.structuredContent as T;
}

const ACTION_TOOL_NAMES: Record<string, string> = {
  start: "contabo_instances_start",
  stop: "contabo_instances_stop",
  restart: "contabo_instances_restart",
  shutdown: "contabo_instances_shutdown",
};

export function createInstancesRouter(client: Client, catalog: ToolCatalog): Router {
  const router = Router();

  router.get("/", async (_req, res) => {
    try {
      const data = await callTool<{ data: ContaboInstance[] }>(
        client,
        "contabo_instances_list",
      );
      res.json({ instances: (data.data ?? []).map(toDto) });
    } catch (error) {
      res.status(502).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });

  router.get("/:id", async (req, res) => {
    const instanceId = Number(req.params.id);
    if (!Number.isInteger(instanceId)) {
      res.status(400).json({ error: "invalid instance id" });
      return;
    }
    try {
      const data = await callTool<{ data: ContaboInstance[] }>(
        client,
        "contabo_instances_get",
        { instanceId },
      );
      const instance = data.data?.[0];
      if (!instance) {
        res.status(404).json({ error: "instance not found" });
        return;
      }
      res.json(toDto(instance));
    } catch (error) {
      res.status(502).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });

  router.post("/:id/actions/:action", async (req, res) => {
    const instanceId = Number(req.params.id);
    const action = req.params.action;
    const toolName = ACTION_TOOL_NAMES[action];

    if (!Number.isInteger(instanceId) || !toolName) {
      res.status(400).json({ error: "invalid instance id or action" });
      return;
    }

    if (catalog.isDestructive(toolName) && req.body?.confirmed !== true) {
      res.status(428).json({ error: "confirmation_required" });
      return;
    }

    try {
      await callTool(client, toolName, { instanceId });
      res.json({ ok: true });
    } catch (error) {
      res.status(502).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });

  return router;
}
