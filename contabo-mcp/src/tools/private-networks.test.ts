import { describe, expect, it, vi } from "vitest";
import { ContaboAuth } from "../auth.js";
import { ContaboClient } from "../client.js";
import type { ContaboConfig } from "../config.js";
import { registerPrivateNetworkTools } from "./private-networks.js";
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
    data: [{ privateNetworkId: 9, name: "internal" }],
  });

  registerPrivateNetworkTools(server, client);

  return { handlers, requestSpy };
}

describe("contabo_private_networks_list", () => {
  it("calls GET /v1/private-networks with filters", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_private_networks_list")!({
      page: 1,
      name: "internal",
      region: "EU",
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/private-networks",
        query: expect.objectContaining({
          page: "1",
          name: "internal",
          region: "EU",
        }),
      }),
    );
  });
});

describe("contabo_private_networks_get", () => {
  it("calls GET /v1/private-networks/{privateNetworkId}", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_private_networks_get")!({
      privateNetworkId: 9,
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/private-networks/9",
      }),
    );
  });
});

describe("contabo_private_networks_create", () => {
  it("calls POST /v1/private-networks with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_private_networks_create")!({
      body: { name: "internal" },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: "/v1/private-networks",
        body: { name: "internal" },
      }),
    );
  });
});

describe("contabo_private_networks_create without body", () => {
  it("defaults body to {} when omitted", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_private_networks_create")!({});

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: "POST", body: {} }),
    );
  });
});

describe("contabo_private_networks_update", () => {
  it("calls PATCH /v1/private-networks/{privateNetworkId} with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_private_networks_update")!({
      privateNetworkId: 9,
      body: { name: "renamed" },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PATCH",
        path: "/v1/private-networks/9",
        body: { name: "renamed" },
      }),
    );
  });
});

describe("contabo_private_networks_update without body", () => {
  it("defaults body to {} when omitted", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_private_networks_update")!({
      privateNetworkId: 9,
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: "PATCH", body: {} }),
    );
  });
});

describe("contabo_private_networks_delete", () => {
  it("calls DELETE /v1/private-networks/{privateNetworkId}", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_private_networks_delete")!({
      privateNetworkId: 9,
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "DELETE",
        path: "/v1/private-networks/9",
      }),
    );
  });
});

describe("contabo_private_networks_attach_instance", () => {
  it("calls POST /v1/private-networks/{privateNetworkId}/instances/{instanceId}", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_private_networks_attach_instance")!({
      privateNetworkId: 9,
      instanceId: 101,
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: "/v1/private-networks/9/instances/101",
      }),
    );
  });
});

describe("contabo_private_networks_detach_instance", () => {
  it("calls DELETE /v1/private-networks/{privateNetworkId}/instances/{instanceId}", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_private_networks_detach_instance")!({
      privateNetworkId: 9,
      instanceId: 101,
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "DELETE",
        path: "/v1/private-networks/9/instances/101",
      }),
    );
  });
});

describe("contabo_private_networks_audits_list", () => {
  it("calls GET /v1/private-networks/audits with pagination", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_private_networks_audits_list")!({ page: 1 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/private-networks/audits",
        query: expect.objectContaining({ page: "1" }),
      }),
    );
  });
});
