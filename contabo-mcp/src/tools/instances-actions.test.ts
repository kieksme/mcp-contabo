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
    data: [{ instanceId: 101, displayName: "kube-1" }],
  });

  registerInstanceTools(server, client);

  return { handlers, requestSpy };
}

describe("contabo_instances_get", () => {
  it("calls GET /v1/compute/instances/{instanceId}", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_instances_get")!({ instanceId: 101 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/compute/instances/101",
      }),
    );
  });
});

describe("contabo_instances_create", () => {
  it("calls POST /v1/compute/instances with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_instances_create")!({
      body: { imageId: "img-1", productId: "V1", region: "EU" },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: "/v1/compute/instances",
        body: { imageId: "img-1", productId: "V1", region: "EU" },
      }),
    );
  });
});

describe("contabo_instances_create without body", () => {
  it("defaults body to {} when omitted", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_instances_create")!({});

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: "POST", body: {} }),
    );
  });
});

describe("contabo_instances_update", () => {
  it("calls PATCH /v1/compute/instances/{instanceId} with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_instances_update")!({
      instanceId: 101,
      body: { displayName: "renamed" },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PATCH",
        path: "/v1/compute/instances/101",
        body: { displayName: "renamed" },
      }),
    );
  });
});

describe("contabo_instances_update without body", () => {
  it("defaults body to {} when omitted", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_instances_update")!({ instanceId: 101 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: "PATCH", body: {} }),
    );
  });
});

describe("contabo_instances_reinstall", () => {
  it("calls PUT /v1/compute/instances/{instanceId} with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_instances_reinstall")!({
      instanceId: 101,
      body: { imageId: "img-2" },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PUT",
        path: "/v1/compute/instances/101",
        body: { imageId: "img-2" },
      }),
    );
  });
});

describe("contabo_instances_reinstall without body", () => {
  it("defaults body to {} when omitted", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_instances_reinstall")!({ instanceId: 101 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: "PUT", body: {} }),
    );
  });
});

describe("contabo_instances_cancel", () => {
  it("calls POST /v1/compute/instances/{instanceId}/cancel with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_instances_cancel")!({
      instanceId: 101,
      body: { cancelDate: "2026-12-31" },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: "/v1/compute/instances/101/cancel",
        body: { cancelDate: "2026-12-31" },
      }),
    );
  });
});

describe("contabo_instances_upgrade", () => {
  it("calls POST /v1/compute/instances/{instanceId}/upgrade with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_instances_upgrade")!({
      instanceId: 101,
      body: { backup: {} },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: "/v1/compute/instances/101/upgrade",
        body: { backup: {} },
      }),
    );
  });
});

describe("contabo_instances_upgrade without body", () => {
  it("defaults body to {} when omitted", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_instances_upgrade")!({ instanceId: 101 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: "POST", body: {} }),
    );
  });
});

describe("contabo_instances_start", () => {
  it("calls POST /v1/compute/instances/{instanceId}/actions/start with no body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_instances_start")!({ instanceId: 101 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: "/v1/compute/instances/101/actions/start",
        body: undefined,
      }),
    );
  });
});

describe("contabo_instances_stop", () => {
  it("calls POST /v1/compute/instances/{instanceId}/actions/stop with no body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_instances_stop")!({ instanceId: 101 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: "/v1/compute/instances/101/actions/stop",
        body: undefined,
      }),
    );
  });
});

describe("contabo_instances_restart", () => {
  it("calls POST /v1/compute/instances/{instanceId}/actions/restart with no body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_instances_restart")!({ instanceId: 101 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: "/v1/compute/instances/101/actions/restart",
        body: undefined,
      }),
    );
  });
});

describe("contabo_instances_shutdown", () => {
  it("calls POST /v1/compute/instances/{instanceId}/actions/shutdown with no body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_instances_shutdown")!({ instanceId: 101 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: "/v1/compute/instances/101/actions/shutdown",
        body: undefined,
      }),
    );
  });
});

describe("contabo_instances_rescue", () => {
  it("calls POST /v1/compute/instances/{instanceId}/actions/rescue with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_instances_rescue")!({
      instanceId: 101,
      body: { rootPassword: 42 },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: "/v1/compute/instances/101/actions/rescue",
        body: { rootPassword: 42 },
      }),
    );
  });
});

describe("contabo_instances_reset_password", () => {
  it("calls POST /v1/compute/instances/{instanceId}/actions/resetPassword with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_instances_reset_password")!({
      instanceId: 101,
      body: { rootPassword: 42 },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: "/v1/compute/instances/101/actions/resetPassword",
        body: { rootPassword: 42 },
      }),
    );
  });
});

describe("contabo_instances_audits_list", () => {
  it("calls GET /v1/compute/instances/audits with filters", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_instances_audits_list")!({
      page: 1,
      instanceId: 101,
      changedBy: "user@example.com",
      startDate: "2026-01-01",
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/compute/instances/audits",
        query: expect.objectContaining({
          page: "1",
          instanceId: "101",
          changedBy: "user@example.com",
          startDate: "2026-01-01",
        }),
      }),
    );
  });
});

describe("contabo_instances_actions_audits_list", () => {
  it("calls GET /v1/compute/instances/actions/audits with filters", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_instances_actions_audits_list")!({
      page: 1,
      instanceId: 101,
      requestId: "req-1",
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/compute/instances/actions/audits",
        query: expect.objectContaining({
          page: "1",
          instanceId: "101",
          requestId: "req-1",
        }),
      }),
    );
  });
});
