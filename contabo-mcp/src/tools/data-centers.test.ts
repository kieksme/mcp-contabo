import { describe, expect, it, vi } from "vitest";
import { ContaboAuth } from "../auth.js";
import { ContaboClient } from "../client.js";
import type { ContaboConfig } from "../config.js";
import { registerDataCenterTools } from "./data-centers.js";
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
    data: [{ slug: "EU", name: "European Union" }],
  });

  registerDataCenterTools(server, client);

  return { handlers, requestSpy };
}

describe("contabo_data_centers_list", () => {
  it("calls GET /v1/data-centers with pagination and filters", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_data_centers_list")!({
      page: 1,
      size: 25,
      slug: "EU",
      regionName: "Europe",
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/data-centers",
        query: expect.objectContaining({
          page: "1",
          size: "25",
          slug: "EU",
          regionName: "Europe",
        }),
      }),
    );
  });
});
