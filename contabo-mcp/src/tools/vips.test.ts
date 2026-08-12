import { describe, expect, it, vi } from "vitest";
import { ContaboAuth } from "../auth.js";
import { ContaboClient } from "../client.js";
import type { ContaboConfig } from "../config.js";
import { registerVipTools } from "./vips.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const config: ContaboConfig = {
  clientId: "",
  clientSecret: "",
  apiUser: "",
  apiPassword: "",
  apiBaseUrl: "https://api.contabo.com",
  authUrl: "https://auth.contabo.com/token",
  accessToken: "test",
};

type Handler = (args: Record<string, unknown>) => Promise<unknown>;

function setup() {
  const server = new McpServer({ name: "test", version: "0" });
  const handlers = new Map<string, Handler>();

  vi.spyOn(server, "registerTool").mockImplementation((name, _cfg, fn) => {
    handlers.set(name, fn as Handler);
    return {} as ReturnType<McpServer["registerTool"]>;
  });

  const client = new ContaboClient(config, new ContaboAuth(config));
  const requestSpy = vi.spyOn(client, "request").mockResolvedValue({
    data: [{ ip: "1.2.3.4", resourceType: "instance" }],
  });

  registerVipTools(server, client);

  return { handlers, requestSpy };
}

describe("contabo_vips_list", () => {
  it("calls GET /v1/vips with filters", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_vips_list")!({
      page: 1,
      region: "EU",
      resourceType: "instance",
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/vips",
        query: expect.objectContaining({
          page: "1",
          region: "EU",
          resourceType: "instance",
        }),
      }),
    );
  });
});

describe("contabo_vips_get", () => {
  it("calls GET /v1/vips/{ip}", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_vips_get")!({ ip: "1.2.3.4" });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/vips/1.2.3.4",
      }),
    );
  });
});

describe("contabo_vips_assign", () => {
  it("calls POST /v1/vips/{ip}/{resourceType}/{resourceId}", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_vips_assign")!({
      ip: "1.2.3.4",
      resourceType: "instances",
      resourceId: 101,
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: "/v1/vips/1.2.3.4/instances/101",
      }),
    );
  });
});

describe("contabo_vips_unassign", () => {
  it("calls DELETE /v1/vips/{ip}/{resourceType}/{resourceId}", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_vips_unassign")!({
      ip: "1.2.3.4",
      resourceType: "instances",
      resourceId: 101,
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "DELETE",
        path: "/v1/vips/1.2.3.4/instances/101",
      }),
    );
  });
});

describe("contabo_vips_audits_list", () => {
  it("calls GET /v1/vips/audits with pagination", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_vips_audits_list")!({ page: 1 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/vips/audits",
        query: expect.objectContaining({ page: "1" }),
      }),
    );
  });
});
