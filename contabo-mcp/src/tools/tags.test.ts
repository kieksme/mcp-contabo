import { describe, expect, it, vi } from "vitest";
import { ContaboAuth } from "../auth.js";
import { ContaboClient } from "../client.js";
import type { ContaboConfig } from "../config.js";
import { registerTagTools } from "./tags.js";
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
    data: [{ tagId: 8, name: "production" }],
  });

  registerTagTools(server, client);

  return { handlers, requestSpy };
}

describe("contabo_tags_list", () => {
  it("calls GET /v1/tags with name filter", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_tags_list")!({
      page: 1,
      name: "production",
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/tags",
        query: expect.objectContaining({ page: "1", name: "production" }),
      }),
    );
  });
});

describe("contabo_tags_get", () => {
  it("calls GET /v1/tags/{tagId}", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_tags_get")!({ tagId: 8 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/tags/8",
      }),
    );
  });
});

describe("contabo_tags_create", () => {
  it("calls POST /v1/tags with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_tags_create")!({
      body: { name: "production", color: "#ff0000" },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: "/v1/tags",
        body: { name: "production", color: "#ff0000" },
      }),
    );
  });
});

describe("contabo_tags_create without body", () => {
  it("defaults body to {} when omitted", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_tags_create")!({});

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: "POST", body: {} }),
    );
  });
});

describe("contabo_tags_update", () => {
  it("calls PATCH /v1/tags/{tagId} with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_tags_update")!({
      tagId: 8,
      body: { name: "renamed" },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PATCH",
        path: "/v1/tags/8",
        body: { name: "renamed" },
      }),
    );
  });
});

describe("contabo_tags_update without body", () => {
  it("defaults body to {} when omitted", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_tags_update")!({ tagId: 8 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: "PATCH", body: {} }),
    );
  });
});

describe("contabo_tags_delete", () => {
  it("calls DELETE /v1/tags/{tagId}", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_tags_delete")!({ tagId: 8 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "DELETE",
        path: "/v1/tags/8",
      }),
    );
  });
});

describe("contabo_tag_assignments_list", () => {
  it("calls GET /v1/tags/{tagId}/assignments with resourceType filter", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_tag_assignments_list")!({
      tagId: 8,
      page: 1,
      resourceType: "instance",
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/tags/8/assignments",
        query: expect.objectContaining({ page: "1", resourceType: "instance" }),
      }),
    );
  });
});

describe("contabo_tag_assignments_get", () => {
  it("calls GET /v1/tags/{tagId}/assignments/{resourceType}/{resourceId}", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_tag_assignments_get")!({
      tagId: 8,
      resourceType: "instance",
      resourceId: "101",
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/tags/8/assignments/instance/101",
      }),
    );
  });
});

describe("contabo_tag_assignments_create", () => {
  it("calls POST /v1/tags/{tagId}/assignments/{resourceType}/{resourceId}", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_tag_assignments_create")!({
      tagId: 8,
      resourceType: "instance",
      resourceId: "101",
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: "/v1/tags/8/assignments/instance/101",
      }),
    );
  });
});

describe("contabo_tag_assignments_delete", () => {
  it("calls DELETE /v1/tags/{tagId}/assignments/{resourceType}/{resourceId}", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_tag_assignments_delete")!({
      tagId: 8,
      resourceType: "instance",
      resourceId: "101",
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "DELETE",
        path: "/v1/tags/8/assignments/instance/101",
      }),
    );
  });
});

describe("contabo_tags_audits_list", () => {
  it("calls GET /v1/tags/audits with pagination", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_tags_audits_list")!({ page: 1 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/tags/audits",
        query: expect.objectContaining({ page: "1" }),
      }),
    );
  });
});

describe("contabo_tag_assignments_audits_list", () => {
  it("calls GET /v1/tags/assignments/audits with pagination", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_tag_assignments_audits_list")!({ page: 1 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/tags/assignments/audits",
        query: expect.objectContaining({ page: "1" }),
      }),
    );
  });
});
