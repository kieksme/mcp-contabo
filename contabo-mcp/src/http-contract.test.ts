import { createMcpHttpApp, loadConfig } from "@kieksme/mcp-http-kit";
import {
  createAppTestClient,
  createKitContractAssertions,
  readMcpJsonResponse,
} from "@kieksme/mcp-http-kit/test";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContaboAuth } from "./auth.js";
import { ContaboClient } from "./client.js";
import type { ContaboConfig } from "./config.js";
import { createContaboServer } from "./server.js";

const TOKEN = "test-bearer-token-for-kit-contract";
/** Number of `contabo_*` tools registered by `registerAllTools`. */
const TOOL_COUNT = 115;

const contaboConfig: ContaboConfig = {
  clientId: "",
  clientSecret: "",
  apiUser: "",
  apiPassword: "",
  apiBaseUrl: "https://api.contabo.com/v1",
  authUrl: "https://auth.contabo.com/token",
  accessToken: "test-token",
};

const apps: Array<{ close: () => Promise<void> }> = [];

function build() {
  const config = loadConfig(
    {
      MCP_TRANSPORT: "http",
      MCP_AUTH_MODE: "bearer",
      MCP_AUTH_TOKEN: TOKEN,
      MCP_HTTP_HOST: "127.0.0.1",
      PORT: "3456",
    },
    { realm: "contabo-mcp" },
  );
  // One shared client, like src/index.ts: no network, `request` is mocked per test.
  const client = new ContaboClient(contaboConfig, new ContaboAuth(contaboConfig));
  const app = createMcpHttpApp({
    createServer: () => createContaboServer(client),
    config,
    getHealthInfo: () => ({ version: "test" }),
  });
  apps.push(app);
  return {
    contaboClient: client,
    app,
    client: createAppTestClient(app, config),
    assertions: createKitContractAssertions(createAppTestClient(app, config), config),
  };
}

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
  vi.restoreAllMocks();
});

describe("kit HTTP contract", () => {
  it("passes kit contract: health, 401, Host/Origin, initialize + tools/list", async () => {
    const { assertions, client } = build();
    await assertions.healthUnauthenticated();
    const health = await client.health();
    expect(await health.json()).toEqual({ version: "test", status: "ok" });
    await assertions.unauthorizedWithoutToken();
    await assertions.forbiddenOnBadHost();
    await assertions.forbiddenOnBadOrigin();
    const { tools } = await assertions.initializeAndListTools(TOKEN);
    expect(tools).toHaveLength(TOOL_COUNT);
  });

  it("serves the MCP endpoint on /mcp and 404s on the old root path", async () => {
    const { client } = build();
    const root = await client.fetch("/", {
      method: "POST",
      headers: { authorization: `Bearer ${TOKEN}` },
    });
    expect(root.status).toBe(404);
  });

  it("runs a tool call end to end (redaction + structuredContent via SDK v2)", async () => {
    const { client, contaboClient } = build();
    const request = vi
      .spyOn(contaboClient, "request")
      .mockResolvedValue({ data: [{ instanceId: 1, rootPassword: "hunter2" }] });

    const response = await client.mcp({
      token: TOKEN,
      headers: { "mcp-protocol-version": "2025-06-18" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: { name: "contabo_instances_list", arguments: {} },
      }),
    });
    expect(response.ok).toBe(true);
    const payload = (await readMcpJsonResponse(response)) as {
      result?: {
        isError?: boolean;
        structuredContent?: { data?: Array<Record<string, unknown>> };
        content?: Array<{ text: string }>;
      };
    };

    expect(request).toHaveBeenCalledOnce();
    expect(payload.result?.isError).toBeFalsy();
    expect(payload.result?.structuredContent?.data?.[0]).toEqual({
      instanceId: 1,
      rootPassword: "[REDACTED]",
    });
    expect(payload.result?.content?.[0]?.text).not.toContain("hunter2");
  });

  it("reuses one Contabo client across requests (no auth rebuild per request)", async () => {
    const { client, contaboClient } = build();
    const request = vi.spyOn(contaboClient, "request").mockResolvedValue({ data: [] });
    const call = (id: number) =>
      client.mcp({
        token: TOKEN,
        headers: { "mcp-protocol-version": "2025-06-18" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id,
          method: "tools/call",
          params: { name: "contabo_instances_list", arguments: {} },
        }),
      });

    await (await call(4)).text();
    await (await call(5)).text();
    expect(request).toHaveBeenCalledTimes(2);
  });
});
