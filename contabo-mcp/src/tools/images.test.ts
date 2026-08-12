import { describe, expect, it, vi } from "vitest";
import { ContaboAuth } from "../auth.js";
import { ContaboClient } from "../client.js";
import type { ContaboConfig } from "../config.js";
import { registerImageTools } from "./images.js";
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

const imageId = "22222222-2222-2222-2222-222222222222";

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
    data: [{ imageId, name: "Ubuntu 24.04" }],
  });

  registerImageTools(server, client);

  return { handlers, requestSpy };
}

describe("contabo_images_list", () => {
  it("calls GET /v1/compute/images with filters", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_images_list")!({
      page: 1,
      name: "Ubuntu",
      standardImage: true,
      search: "24.04",
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/compute/images",
        query: expect.objectContaining({
          page: "1",
          name: "Ubuntu",
          standardImage: "true",
          search: "24.04",
        }),
      }),
    );
  });
});

describe("contabo_images_get", () => {
  it("calls GET /v1/compute/images/{imageId}", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_images_get")!({ imageId });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: `/v1/compute/images/${imageId}`,
      }),
    );
  });
});

describe("contabo_images_create", () => {
  it("calls POST /v1/compute/images with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_images_create")!({
      body: {
        name: "custom",
        url: "https://example.com/image.iso",
        osType: "Linux",
        version: "1.0",
      },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: "/v1/compute/images",
        body: {
          name: "custom",
          url: "https://example.com/image.iso",
          osType: "Linux",
          version: "1.0",
        },
      }),
    );
  });
});

describe("contabo_images_create without body", () => {
  it("defaults body to {} when omitted", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_images_create")!({});

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: "POST", body: {} }),
    );
  });
});

describe("contabo_images_update", () => {
  it("calls PATCH /v1/compute/images/{imageId} with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_images_update")!({
      imageId,
      body: { name: "renamed" },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PATCH",
        path: `/v1/compute/images/${imageId}`,
        body: { name: "renamed" },
      }),
    );
  });
});

describe("contabo_images_update without body", () => {
  it("defaults body to {} when omitted", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_images_update")!({ imageId });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: "PATCH", body: {} }),
    );
  });
});

describe("contabo_images_delete", () => {
  it("calls DELETE /v1/compute/images/{imageId}", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_images_delete")!({ imageId });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "DELETE",
        path: `/v1/compute/images/${imageId}`,
      }),
    );
  });
});

describe("contabo_images_stats", () => {
  it("calls GET /v1/compute/images/stats", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_images_stats")!({});

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/compute/images/stats",
      }),
    );
  });
});

describe("contabo_images_audits_list", () => {
  it("calls GET /v1/compute/images/audits with pagination", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_images_audits_list")!({ page: 1 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/compute/images/audits",
        query: expect.objectContaining({ page: "1" }),
      }),
    );
  });
});
