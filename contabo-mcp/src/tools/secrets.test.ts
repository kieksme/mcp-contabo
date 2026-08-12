import { describe, expect, it, vi } from "vitest";
import { ContaboAuth } from "../auth.js";
import { ContaboClient } from "../client.js";
import type { ContaboConfig } from "../config.js";
import { registerSecretTools } from "./secrets.js";
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
    data: [{ secretId: 3, name: "root-password" }],
  });

  registerSecretTools(server, client);

  return { handlers, requestSpy };
}

describe("contabo_secrets_list", () => {
  it("calls GET /v1/secrets with name and type filters", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_secrets_list")!({
      page: 1,
      name: "root-password",
      type: "password",
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/secrets",
        query: expect.objectContaining({
          page: "1",
          name: "root-password",
          type: "password",
        }),
      }),
    );
  });
});

describe("contabo_secrets_get", () => {
  it("calls GET /v1/secrets/{secretId}", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_secrets_get")!({ secretId: 3 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/secrets/3",
      }),
    );
  });
});

describe("contabo_secrets_create", () => {
  it("calls POST /v1/secrets with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_secrets_create")!({
      body: { name: "root-password", type: "password", value: "s3cr3t" },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: "/v1/secrets",
        body: { name: "root-password", type: "password", value: "s3cr3t" },
      }),
    );
  });
});

describe("contabo_secrets_create without body", () => {
  it("defaults body to {} when omitted", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_secrets_create")!({});

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: "POST", body: {} }),
    );
  });
});

describe("contabo_secrets_update", () => {
  it("calls PATCH /v1/secrets/{secretId} with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_secrets_update")!({
      secretId: 3,
      body: { name: "renamed" },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PATCH",
        path: "/v1/secrets/3",
        body: { name: "renamed" },
      }),
    );
  });
});

describe("contabo_secrets_update without body", () => {
  it("defaults body to {} when omitted", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_secrets_update")!({ secretId: 3 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: "PATCH", body: {} }),
    );
  });
});

describe("contabo_secrets_delete", () => {
  it("calls DELETE /v1/secrets/{secretId}", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_secrets_delete")!({ secretId: 3 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "DELETE",
        path: "/v1/secrets/3",
      }),
    );
  });
});

describe("contabo_secrets_audits_list", () => {
  it("calls GET /v1/secrets/audits with pagination", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_secrets_audits_list")!({ page: 1 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/secrets/audits",
        query: expect.objectContaining({ page: "1" }),
      }),
    );
  });
});
