import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { ToolCatalog } from "../mcp/tool-catalog.js";
import { createInstancesRouter } from "./instances.js";

const ACTION_ANNOTATIONS: Record<string, { destructiveHint: boolean }> = {
  contabo_instances_start: { destructiveHint: false },
  contabo_instances_stop: { destructiveHint: true },
  contabo_instances_restart: { destructiveHint: true },
  contabo_instances_shutdown: { destructiveHint: true },
};

const RAW_INSTANCE = {
  instanceId: 12345,
  name: "vmd12345",
  displayName: "kube-1",
  status: "running",
  productType: "V22",
  vHostName: "21159",
  defaultUser: "admin",
  ipConfig: { v4: { ip: "5.189.128.234" } },
};

function buildApp(callTool: ReturnType<typeof vi.fn>) {
  const mcpClient = {
    listTools: async () => ({
      tools: Object.entries(ACTION_ANNOTATIONS).map(([name, annotations]) => ({
        name,
        description: name,
        inputSchema: { type: "object", properties: {} },
        annotations,
      })),
    }),
    callTool,
  } as unknown as Client;

  const app = express();
  app.use(express.json());
  return ToolCatalog.load(mcpClient).then((catalog) => {
    app.use("/api/instances", createInstancesRouter(mcpClient, catalog));
    return app;
  });
}

describe("instances routes", () => {
  let callTool: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    callTool = vi.fn();
  });

  it("GET /api/instances reshapes the Contabo list response into the table DTO", async () => {
    callTool.mockResolvedValue({
      isError: false,
      structuredContent: { data: [RAW_INSTANCE] },
    });
    const app = await buildApp(callTool);

    const res = await request(app).get("/api/instances");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      instances: [
        {
          id: 12345,
          name: "vmd12345",
          displayName: "kube-1",
          status: "running",
          ipv4: "5.189.128.234",
          hostSystem: "21159",
          defaultUser: "admin",
          productType: "V22",
        },
      ],
    });
    expect(callTool).toHaveBeenCalledWith({ name: "contabo_instances_list", arguments: {} });
  });

  it("GET /api/instances/:id 404s when the instance is missing", async () => {
    callTool.mockResolvedValue({ isError: false, structuredContent: { data: [] } });
    const app = await buildApp(callTool);

    const res = await request(app).get("/api/instances/12345");

    expect(res.status).toBe(404);
  });

  it("GET /api/instances propagates MCP tool errors as 502", async () => {
    callTool.mockResolvedValue({
      isError: true,
      content: [{ type: "text", text: "Contabo API unavailable" }],
    });
    const app = await buildApp(callTool);

    const res = await request(app).get("/api/instances");

    expect(res.status).toBe(502);
    expect(res.body.error).toBe("Contabo API unavailable");
  });

  it("POST .../actions/start (non-destructive) runs immediately without confirmation", async () => {
    callTool.mockResolvedValue({ isError: false, structuredContent: {} });
    const app = await buildApp(callTool);

    const res = await request(app).post("/api/instances/12345/actions/start").send({});

    expect(res.status).toBe(200);
    expect(callTool).toHaveBeenCalledWith({
      name: "contabo_instances_start",
      arguments: { instanceId: 12345 },
    });
  });

  it("POST .../actions/stop (destructive) requires confirmed:true", async () => {
    const app = await buildApp(callTool);

    const unconfirmed = await request(app).post("/api/instances/12345/actions/stop").send({});
    expect(unconfirmed.status).toBe(428);
    expect(callTool).not.toHaveBeenCalled();

    callTool.mockResolvedValue({ isError: false, structuredContent: {} });
    const confirmed = await request(app)
      .post("/api/instances/12345/actions/stop")
      .send({ confirmed: true });
    expect(confirmed.status).toBe(200);
    expect(callTool).toHaveBeenCalledWith({
      name: "contabo_instances_stop",
      arguments: { instanceId: 12345 },
    });
  });

  it("POST .../actions/:action rejects an action outside the fixed allowlist", async () => {
    const app = await buildApp(callTool);

    const res = await request(app)
      .post("/api/instances/12345/actions/reinstall")
      .send({ confirmed: true });

    expect(res.status).toBe(400);
    expect(callTool).not.toHaveBeenCalled();
  });
});
