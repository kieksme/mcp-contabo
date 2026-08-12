import { describe, expect, it, vi } from "vitest";
import { ContaboAuth } from "../auth.js";
import { ContaboClient } from "../client.js";
import type { ContaboConfig } from "../config.js";
import { registerDomainTools } from "./domains.js";
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
    data: [{ domainName: "example.com" }],
  });

  registerDomainTools(server, client);

  return { handlers, requestSpy };
}

describe("contabo_domains_list", () => {
  it("calls GET /v1/domains with pagination and domainName filter", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_domains_list")!({
      page: 1,
      domainName: "example.com",
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/domains",
        query: expect.objectContaining({ page: "1", domainName: "example.com" }),
      }),
    );
  });
});

describe("contabo_domains_get", () => {
  it("calls GET /v1/domains/{domain}", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_domains_get")!({ domain: "example.com" });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/domains/example.com",
      }),
    );
  });
});

describe("contabo_domains_create", () => {
  it("calls POST /v1/domains with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_domains_create")!({
      body: { domainName: "example.com" },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: "/v1/domains",
        body: { domainName: "example.com" },
      }),
    );
  });
});

describe("contabo_domains_create without body", () => {
  it("defaults body to {} when omitted", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_domains_create")!({});

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: "POST", body: {} }),
    );
  });
});

describe("contabo_domains_update", () => {
  it("calls PATCH /v1/domains/{domain} with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_domains_update")!({
      domain: "example.com",
      body: { autoRenew: true },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PATCH",
        path: "/v1/domains/example.com",
        body: { autoRenew: true },
      }),
    );
  });
});

describe("contabo_domains_update without body", () => {
  it("defaults body to {} when omitted", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_domains_update")!({ domain: "example.com" });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: "PATCH", body: {} }),
    );
  });
});

describe("contabo_domains_cancel", () => {
  it("calls POST /v1/domains/{domain}/cancel with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_domains_cancel")!({
      domain: "example.com",
      body: { cancelDate: "2026-12-31" },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: "/v1/domains/example.com/cancel",
        body: { cancelDate: "2026-12-31" },
      }),
    );
  });
});

describe("contabo_domains_revoke_cancellation", () => {
  it("calls POST /v1/domains/{domain}/revoke-cancellation", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_domains_revoke_cancellation")!({
      domain: "example.com",
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: "/v1/domains/example.com/revoke-cancellation",
      }),
    );
  });
});

describe("contabo_domains_auth_code", () => {
  it("calls POST /v1/domains/{domain}/generate-auth-code", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_domains_auth_code")!({ domain: "example.com" });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: "/v1/domains/example.com/generate-auth-code",
      }),
    );
  });
});

describe("contabo_domains_transfer_out_confirm", () => {
  it("calls POST /v1/domains/{domain}/transfer-out with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_domains_transfer_out_confirm")!({
      domain: "example.com",
      body: { confirm: true },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: "/v1/domains/example.com/transfer-out",
        body: { confirm: true },
      }),
    );
  });
});

describe("contabo_domains_transfer_out_revoke", () => {
  it("calls DELETE /v1/domains/{domain}/transfer-out", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_domains_transfer_out_revoke")!({
      domain: "example.com",
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "DELETE",
        path: "/v1/domains/example.com/transfer-out",
      }),
    );
  });
});

describe("contabo_domains_check_availability", () => {
  it("calls POST /v1/registries-domains/{domain}/check-availability with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_domains_check_availability")!({
      domain: "example.com",
      body: { tld: "com" },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: "/v1/registries-domains/example.com/check-availability",
        body: { tld: "com" },
      }),
    );
  });
});

describe("contabo_domains_audits_list", () => {
  it("calls GET /v1/domains/audits with pagination", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_domains_audits_list")!({ page: 1 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/domains/audits",
        query: expect.objectContaining({ page: "1" }),
      }),
    );
  });
});

describe("contabo_domain_handles_list", () => {
  it("calls GET /v1/domains/handles with pagination", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_domain_handles_list")!({ page: 1 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/domains/handles",
        query: expect.objectContaining({ page: "1" }),
      }),
    );
  });
});

describe("contabo_domain_handles_get", () => {
  it("calls GET /v1/domains/handles/{handleId}", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_domain_handles_get")!({ handleId: 7 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/domains/handles/7",
      }),
    );
  });
});

describe("contabo_domain_handles_create", () => {
  it("calls POST /v1/domains/handles with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_domain_handles_create")!({
      body: { firstName: "Jane" },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: "/v1/domains/handles",
        body: { firstName: "Jane" },
      }),
    );
  });
});

describe("contabo_domain_handles_create without body", () => {
  it("defaults body to {} when omitted", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_domain_handles_create")!({});

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: "POST", body: {} }),
    );
  });
});

describe("contabo_domain_handles_update", () => {
  it("calls PUT /v1/domains/handles/{handleId} with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_domain_handles_update")!({
      handleId: 7,
      body: { firstName: "Jane" },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PUT",
        path: "/v1/domains/handles/7",
        body: { firstName: "Jane" },
      }),
    );
  });
});

describe("contabo_domain_handles_update without body", () => {
  it("defaults body to {} when omitted", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_domain_handles_update")!({ handleId: 7 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: "PUT", body: {} }),
    );
  });
});

describe("contabo_domain_handles_delete", () => {
  it("calls DELETE /v1/domains/handles/{handleId}", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_domain_handles_delete")!({ handleId: 7 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "DELETE",
        path: "/v1/domains/handles/7",
      }),
    );
  });
});

describe("contabo_domain_handles_set_default", () => {
  it("calls PATCH /v1/domains/handles/{handleId}/default with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_domain_handles_set_default")!({
      handleId: 7,
      body: { default: true },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PATCH",
        path: "/v1/domains/handles/7/default",
        body: { default: true },
      }),
    );
  });
});

describe("contabo_domain_handles_audits_list", () => {
  it("calls GET /v1/domains/handles/audits with pagination", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_domain_handles_audits_list")!({ page: 1 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/domains/handles/audits",
        query: expect.objectContaining({ page: "1" }),
      }),
    );
  });
});
