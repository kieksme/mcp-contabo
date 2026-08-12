import { describe, expect, it, vi } from "vitest";
import { ContaboAuth } from "../auth.js";
import { ContaboClient } from "../client.js";
import type { ContaboConfig } from "../config.js";
import { registerSnapshotTools } from "./snapshots.js";
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
    data: [{ snapshotId: "snap-1", name: "before-upgrade" }],
  });

  registerSnapshotTools(server, client);

  return { handlers, requestSpy };
}

describe("contabo_snapshots_list", () => {
  it("calls GET /v1/compute/instances/{instanceId}/snapshots with name filter", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_snapshots_list")!({
      instanceId: 101,
      page: 1,
      name: "before-upgrade",
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/compute/instances/101/snapshots",
        query: expect.objectContaining({ page: "1", name: "before-upgrade" }),
      }),
    );
  });
});

describe("contabo_snapshots_get", () => {
  it("calls GET /v1/compute/instances/{instanceId}/snapshots/{snapshotId}", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_snapshots_get")!({
      instanceId: 101,
      snapshotId: "snap-1",
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/compute/instances/101/snapshots/snap-1",
      }),
    );
  });
});

describe("contabo_snapshots_create", () => {
  it("calls POST /v1/compute/instances/{instanceId}/snapshots with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_snapshots_create")!({
      instanceId: 101,
      body: { name: "before-upgrade" },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: "/v1/compute/instances/101/snapshots",
        body: { name: "before-upgrade" },
      }),
    );
  });
});

describe("contabo_snapshots_create without body", () => {
  it("defaults body to {} when omitted", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_snapshots_create")!({ instanceId: 101 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: "POST", body: {} }),
    );
  });
});

describe("contabo_snapshots_update", () => {
  it("calls PATCH /v1/compute/instances/{instanceId}/snapshots/{snapshotId} with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_snapshots_update")!({
      instanceId: 101,
      snapshotId: "snap-1",
      body: { name: "renamed" },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PATCH",
        path: "/v1/compute/instances/101/snapshots/snap-1",
        body: { name: "renamed" },
      }),
    );
  });
});

describe("contabo_snapshots_update without body", () => {
  it("defaults body to {} when omitted", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_snapshots_update")!({
      instanceId: 101,
      snapshotId: "snap-1",
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: "PATCH", body: {} }),
    );
  });
});

describe("contabo_snapshots_delete", () => {
  it("calls DELETE /v1/compute/instances/{instanceId}/snapshots/{snapshotId}", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_snapshots_delete")!({
      instanceId: 101,
      snapshotId: "snap-1",
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "DELETE",
        path: "/v1/compute/instances/101/snapshots/snap-1",
      }),
    );
  });
});

describe("contabo_snapshots_rollback", () => {
  it("calls POST /v1/compute/instances/{instanceId}/snapshots/{snapshotId}/rollback", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_snapshots_rollback")!({
      instanceId: 101,
      snapshotId: "snap-1",
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: "/v1/compute/instances/101/snapshots/snap-1/rollback",
      }),
    );
  });
});

describe("contabo_snapshots_audits_list", () => {
  it("calls GET /v1/compute/snapshots/audits with instanceId and snapshotId filters", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_snapshots_audits_list")!({
      page: 1,
      instanceId: 101,
      snapshotId: "snap-1",
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/compute/snapshots/audits",
        query: expect.objectContaining({
          page: "1",
          instanceId: "101",
          snapshotId: "snap-1",
        }),
      }),
    );
  });
});
