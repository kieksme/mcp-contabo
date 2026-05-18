import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { ContaboAuth } from "../auth.js";
import { ContaboClient } from "../client.js";
import type { ContaboConfig } from "../config.js";
import { registerContaboTool } from "./tool-registry.js";

const config: ContaboConfig = {
  clientId: "",
  clientSecret: "",
  apiUser: "",
  apiPassword: "",
  apiBaseUrl: "https://api.contabo.com/v1",
  authUrl: "https://auth.contabo.com/token",
  accessToken: "test",
};

describe("registerContaboTool", () => {
  it("returns formatted success results", async () => {
    const server = new McpServer({ name: "test", version: "0" });
    const client = new ContaboClient(config, new ContaboAuth(config));
    vi.spyOn(client, "request").mockResolvedValue({ data: { id: 1 } });

    let handler: ((args: { id: number }) => Promise<unknown>) | undefined;

    const original = server.registerTool.bind(server);
    vi.spyOn(server, "registerTool").mockImplementation(
      (name, _cfg, cb) => {
        handler = cb as typeof handler;
        return original(name, _cfg, cb);
      },
    );

    registerContaboTool(server, client, {
      name: "contabo_test_tool",
      description: "test",
      inputSchema: { id: z.number() },
      handler: async (args) =>
        client.request({
          method: "GET",
          path: `/v1/secrets/${args.id}`,
        }),
    });

    const result = await handler!({ id: 42 });

    expect(result).toMatchObject({
      content: [{ type: "text", text: expect.stringContaining('"id": 1') }],
      structuredContent: { data: { id: 1 } },
    });
  });

  it("returns isError content when handler throws", async () => {
    const server = new McpServer({ name: "test", version: "0" });
    const client = new ContaboClient(config, new ContaboAuth(config));

    let handler: (() => Promise<unknown>) | undefined;

    const original = server.registerTool.bind(server);
    vi.spyOn(server, "registerTool").mockImplementation(
      (name, _cfg, cb) => {
        handler = cb as typeof handler;
        return original(name, _cfg, cb);
      },
    );

    registerContaboTool(server, client, {
      name: "contabo_failing_tool",
      description: "test",
      inputSchema: {},
      handler: async () => {
        throw new Error("boom");
      },
    });

    const result = (await handler!()) as {
      isError?: boolean;
      content: Array<{ text: string }>;
      structuredContent?: { error: { code: string; message: string } };
    };

    expect(result.isError).toBe(true);
    expect(result.content[0]?.text).toContain("boom");
    expect(result.structuredContent?.error.code).toBe("TOOL_ERROR");
    expect(result.structuredContent?.error.message).toBe("boom");
  });
});
