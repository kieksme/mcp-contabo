import { describe, expect, it, vi } from "vitest";
import { ContaboAuth } from "../auth.js";
import { ContaboClient } from "../client.js";
import type { ContaboConfig } from "../config.js";
import { registerFirewallTools } from "./firewalls.js";
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

const firewallId = "11111111-1111-1111-1111-111111111111";

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
    data: [{ firewallId, name: "web" }],
  });

  registerFirewallTools(server, client);

  return { handlers, requestSpy };
}

describe("contabo_firewalls_list", () => {
  it("calls GET /v1/firewalls with name and instanceIds filters", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_firewalls_list")!({
      page: 1,
      name: "web",
      instanceIds: "1,2",
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/firewalls",
        query: expect.objectContaining({
          page: "1",
          name: "web",
          instanceIds: "1,2",
        }),
      }),
    );
  });
});

describe("contabo_firewalls_get", () => {
  it("calls GET /v1/firewalls/{firewallId} with filters", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_firewalls_get")!({
      firewallId,
      name: "web",
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: `/v1/firewalls/${firewallId}`,
        query: expect.objectContaining({ name: "web" }),
      }),
    );
  });
});

describe("contabo_firewalls_create", () => {
  it("calls POST /v1/firewalls with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_firewalls_create")!({
      body: { name: "web", status: "active" },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: "/v1/firewalls",
        body: { name: "web", status: "active" },
      }),
    );
  });
});

describe("contabo_firewalls_create without body", () => {
  it("defaults body to {} when omitted", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_firewalls_create")!({});

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: "POST", body: {} }),
    );
  });
});

describe("contabo_firewalls_update", () => {
  it("calls PATCH /v1/firewalls/{firewallId} with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_firewalls_update")!({
      firewallId,
      body: { name: "web-updated" },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PATCH",
        path: `/v1/firewalls/${firewallId}`,
        body: { name: "web-updated" },
      }),
    );
  });
});

describe("contabo_firewalls_update without body", () => {
  it("defaults body to {} when omitted", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_firewalls_update")!({ firewallId });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: "PATCH", body: {} }),
    );
  });
});

describe("contabo_firewalls_update_rules", () => {
  it("calls PUT /v1/firewalls/{firewallId} with rules body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_firewalls_update_rules")!({
      firewallId,
      body: { rules: [{ port: "22" }] },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PUT",
        path: `/v1/firewalls/${firewallId}`,
        body: { rules: [{ port: "22" }] },
      }),
    );
  });
});

describe("contabo_firewalls_update_rules without body", () => {
  it("defaults body to {} when omitted", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_firewalls_update_rules")!({ firewallId });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: "PUT", body: {} }),
    );
  });
});

describe("contabo_firewalls_delete", () => {
  it("calls DELETE /v1/firewalls/{firewallId}", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_firewalls_delete")!({ firewallId });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "DELETE",
        path: `/v1/firewalls/${firewallId}`,
      }),
    );
  });
});

describe("contabo_firewalls_attach_instance", () => {
  it("calls POST /v1/firewalls/{firewallId}/instances/{instanceId}", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_firewalls_attach_instance")!({
      firewallId,
      instanceId: 101,
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: `/v1/firewalls/${firewallId}/instances/101`,
      }),
    );
  });
});

describe("contabo_firewalls_detach_instance", () => {
  it("calls DELETE /v1/firewalls/{firewallId}/instances/{instanceId}", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_firewalls_detach_instance")!({
      firewallId,
      instanceId: 101,
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "DELETE",
        path: `/v1/firewalls/${firewallId}/instances/101`,
      }),
    );
  });
});

describe("contabo_firewalls_preset_rules_list", () => {
  it("calls GET /v1/firewalls/preset-rules with name filter", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_firewalls_preset_rules_list")!({
      name: "ssh",
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/firewalls/preset-rules",
        query: expect.objectContaining({ name: "ssh" }),
      }),
    );
  });
});

describe("contabo_firewalls_audits_list", () => {
  it("calls GET /v1/firewalls/audits with pagination", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_firewalls_audits_list")!({ page: 1 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/firewalls/audits",
        query: expect.objectContaining({ page: "1" }),
      }),
    );
  });
});
