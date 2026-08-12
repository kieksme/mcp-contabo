import { describe, expect, it, vi } from "vitest";
import { ContaboAuth } from "../auth.js";
import { ContaboClient } from "../client.js";
import type { ContaboConfig } from "../config.js";
import { registerObjectStorageTools } from "./object-storages.js";
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

const objectStorageId = "33333333-3333-3333-3333-333333333333";
const userId = "44444444-4444-4444-4444-444444444444";

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
    data: [{ objectStorageId, displayName: "my-storage" }],
  });

  registerObjectStorageTools(server, client);

  return { handlers, requestSpy };
}

describe("contabo_object_storages_list", () => {
  it("calls GET /v1/object-storages with filters", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_object_storages_list")!({
      page: 1,
      displayName: "my-storage",
      region: "EU",
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/object-storages",
        query: expect.objectContaining({
          page: "1",
          displayName: "my-storage",
          region: "EU",
        }),
      }),
    );
  });
});

describe("contabo_object_storages_get", () => {
  it("calls GET /v1/object-storages/{objectStorageId}", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_object_storages_get")!({ objectStorageId });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: `/v1/object-storages/${objectStorageId}`,
      }),
    );
  });
});

describe("contabo_object_storages_create", () => {
  it("calls POST /v1/object-storages with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_object_storages_create")!({
      body: { region: "EU", totalPurchasedSpaceTb: 1 },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: "/v1/object-storages",
        body: { region: "EU", totalPurchasedSpaceTb: 1 },
      }),
    );
  });
});

describe("contabo_object_storages_create without body", () => {
  it("defaults body to {} when omitted", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_object_storages_create")!({});

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: "POST", body: {} }),
    );
  });
});

describe("contabo_object_storages_update", () => {
  it("calls PATCH /v1/object-storages/{objectStorageId} with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_object_storages_update")!({
      objectStorageId,
      body: { displayName: "renamed" },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PATCH",
        path: `/v1/object-storages/${objectStorageId}`,
        body: { displayName: "renamed" },
      }),
    );
  });
});

describe("contabo_object_storages_update without body", () => {
  it("defaults body to {} when omitted", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_object_storages_update")!({ objectStorageId });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: "PATCH", body: {} }),
    );
  });
});

describe("contabo_object_storages_cancel", () => {
  it("calls PATCH /v1/object-storages/{objectStorageId}/cancel with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_object_storages_cancel")!({
      objectStorageId,
      body: { cancelDate: "2026-12-31" },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PATCH",
        path: `/v1/object-storages/${objectStorageId}/cancel`,
        body: { cancelDate: "2026-12-31" },
      }),
    );
  });
});

describe("contabo_object_storages_resize", () => {
  it("calls POST /v1/object-storages/{objectStorageId}/resize with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_object_storages_resize")!({
      objectStorageId,
      body: { totalPurchasedSpaceTb: 2 },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: `/v1/object-storages/${objectStorageId}/resize`,
        body: { totalPurchasedSpaceTb: 2 },
      }),
    );
  });
});

describe("contabo_object_storages_resize without body", () => {
  it("defaults body to {} when omitted", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_object_storages_resize")!({ objectStorageId });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: "POST", body: {} }),
    );
  });
});

describe("contabo_object_storages_stats", () => {
  it("calls GET /v1/object-storages/{objectStorageId}/stats", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_object_storages_stats")!({ objectStorageId });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: `/v1/object-storages/${objectStorageId}/stats`,
      }),
    );
  });
});

describe("contabo_object_storages_audits_list", () => {
  it("calls GET /v1/object-storages/audits with pagination", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_object_storages_audits_list")!({ page: 1 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/object-storages/audits",
        query: expect.objectContaining({ page: "1" }),
      }),
    );
  });
});

describe("contabo_object_storage_credentials_list", () => {
  it("calls GET /v1/users/{userId}/object-storages/credentials with pagination", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_object_storage_credentials_list")!({
      userId,
      page: 1,
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: `/v1/users/${userId}/object-storages/credentials`,
        query: expect.objectContaining({ page: "1" }),
      }),
    );
  });
});

describe("contabo_object_storage_credentials_get", () => {
  it("calls GET /v1/users/{userId}/object-storages/{objectStorageId}/credentials/{credentialId}", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_object_storage_credentials_get")!({
      userId,
      objectStorageId,
      credentialId: 5,
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: `/v1/users/${userId}/object-storages/${objectStorageId}/credentials/5`,
      }),
    );
  });
});

describe("contabo_object_storage_credentials_regenerate", () => {
  it("calls PATCH /v1/users/{userId}/object-storages/{objectStorageId}/credentials/{credentialId}", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_object_storage_credentials_regenerate")!({
      userId,
      objectStorageId,
      credentialId: 5,
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PATCH",
        path: `/v1/users/${userId}/object-storages/${objectStorageId}/credentials/5`,
      }),
    );
  });
});
