import { describe, expect, it, vi } from "vitest";
import { ContaboAuth } from "../auth.js";
import { ContaboClient } from "../client.js";
import type { ContaboConfig } from "../config.js";
import { registerInstanceTools } from "./instances.js";
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

describe("contabo_instances_list", () => {
  it("calls GET /v1/compute/instances with pagination query", async () => {
    const server = new McpServer({ name: "test", version: "0" });
    let handler: ((args: Record<string, unknown>) => Promise<unknown>) | undefined;

    vi.spyOn(server, "registerTool").mockImplementation((_name, _config, fn) => {
      if (_name === "contabo_instances_list") {
        handler = fn as typeof handler;
      }
      return {} as ReturnType<McpServer["registerTool"]>;
    });

    const client = new ContaboClient(config, new ContaboAuth(config));
    const requestSpy = vi.spyOn(client, "request").mockResolvedValue({
      data: [{ instanceId: 1, displayName: "kube-1" }],
    });

    registerInstanceTools(server, client);

    await handler!({ page: 1, size: 25 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/compute/instances",
        query: expect.objectContaining({ page: 1, size: 25 }),
      }),
    );
  });
});
