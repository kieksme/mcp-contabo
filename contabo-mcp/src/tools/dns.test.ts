import { describe, expect, it, vi } from "vitest";
import { ContaboAuth } from "../auth.js";
import { ContaboClient } from "../client.js";
import type { ContaboConfig } from "../config.js";
import { registerDnsTools } from "./dns.js";
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
    data: [{ zoneName: "example.com" }],
  });

  registerDnsTools(server, client);

  return { handlers, requestSpy };
}

describe("contabo_dns_zones_list", () => {
  it("calls GET /v1/dns/zones with pagination and zoneName filter", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_dns_zones_list")!({
      page: 1,
      size: 25,
      zoneName: "example.com",
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/dns/zones",
        query: expect.objectContaining({
          page: "1",
          size: "25",
          zoneName: "example.com",
        }),
      }),
    );
  });
});

describe("contabo_dns_zones_get", () => {
  it("calls GET /v1/dns/zones/{zoneName}", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_dns_zones_get")!({ zoneName: "example.com" });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/dns/zones/example.com",
      }),
    );
  });
});

describe("contabo_dns_zones_create", () => {
  it("calls POST /v1/dns/zones with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_dns_zones_create")!({
      body: { zoneName: "example.com" },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: "/v1/dns/zones",
        body: { zoneName: "example.com" },
      }),
    );
  });
});

describe("contabo_dns_zones_create without body", () => {
  it("defaults body to {} when omitted", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_dns_zones_create")!({});

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: "POST", body: {} }),
    );
  });
});

describe("contabo_dns_zones_delete", () => {
  it("calls DELETE /v1/dns/zones/{zoneName}", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_dns_zones_delete")!({ zoneName: "example.com" });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "DELETE",
        path: "/v1/dns/zones/example.com",
      }),
    );
  });
});

describe("contabo_dns_zone_records_list", () => {
  it("calls GET /v1/dns/zones/{zoneName}/records with search filter", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_dns_zone_records_list")!({
      zoneName: "example.com",
      page: 2,
      search: "www",
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/dns/zones/example.com/records",
        query: expect.objectContaining({ page: "2", search: "www" }),
      }),
    );
  });
});

describe("contabo_dns_zone_records_create", () => {
  it("calls POST /v1/dns/zones/{zoneName}/records with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_dns_zone_records_create")!({
      zoneName: "example.com",
      body: { type: "A", ttl: 3600, data: "1.2.3.4" },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: "/v1/dns/zones/example.com/records",
        body: { type: "A", ttl: 3600, data: "1.2.3.4" },
      }),
    );
  });
});

describe("contabo_dns_zone_records_create without body", () => {
  it("defaults body to {} when omitted", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_dns_zone_records_create")!({
      zoneName: "example.com",
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: "POST", body: {} }),
    );
  });
});

describe("contabo_dns_zone_records_update", () => {
  it("calls PATCH /v1/dns/zones/{zoneName}/records/{recordId} with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_dns_zone_records_update")!({
      zoneName: "example.com",
      recordId: 42,
      body: { type: "A", ttl: 7200, data: "5.6.7.8" },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PATCH",
        path: "/v1/dns/zones/example.com/records/42",
        body: { type: "A", ttl: 7200, data: "5.6.7.8" },
      }),
    );
  });
});

describe("contabo_dns_zone_records_update without body", () => {
  it("defaults body to {} when omitted", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_dns_zone_records_update")!({
      zoneName: "example.com",
      recordId: 42,
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: "PATCH", body: {} }),
    );
  });
});

describe("contabo_dns_zone_records_delete", () => {
  it("calls DELETE /v1/dns/zones/{zoneName}/records/{recordId}", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_dns_zone_records_delete")!({
      zoneName: "example.com",
      recordId: 42,
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "DELETE",
        path: "/v1/dns/zones/example.com/records/42",
      }),
    );
  });
});

describe("contabo_dns_zone_records_bulk_delete", () => {
  it("calls DELETE /v1/dns/zones/{zoneName}/records/bulk with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_dns_zone_records_bulk_delete")!({
      zoneName: "example.com",
      body: { recordIds: [1, 2, 3] },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "DELETE",
        path: "/v1/dns/zones/example.com/records/bulk",
        body: { recordIds: [1, 2, 3] },
      }),
    );
  });
});

describe("contabo_dns_zone_records_bulk_delete without body", () => {
  it("defaults body to {} when omitted", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_dns_zone_records_bulk_delete")!({
      zoneName: "example.com",
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: "DELETE", body: {} }),
    );
  });
});

describe("contabo_dns_zones_audits_list", () => {
  it("calls GET /v1/dns/zones/audits with pagination", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_dns_zones_audits_list")!({ page: 1, size: 10 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/dns/zones/audits",
        query: expect.objectContaining({ page: "1", size: "10" }),
      }),
    );
  });
});

describe("contabo_dns_records_audits_list", () => {
  it("calls GET /v1/dns/records/audits with pagination", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_dns_records_audits_list")!({ page: 1 });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/dns/records/audits",
        query: expect.objectContaining({ page: "1" }),
      }),
    );
  });
});

describe("contabo_dns_ptrs_list", () => {
  it("calls GET /v1/dns/ptrs with ips and search filters", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_dns_ptrs_list")!({
      ips: "1.2.3.4",
      search: "host",
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/dns/ptrs",
        query: expect.objectContaining({ ips: "1.2.3.4", search: "host" }),
      }),
    );
  });
});

describe("contabo_dns_ptrs_get", () => {
  it("calls GET /v1/dns/ptrs/{ipAddress}", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_dns_ptrs_get")!({ ipAddress: "1.2.3.4" });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/v1/dns/ptrs/1.2.3.4",
      }),
    );
  });
});

describe("contabo_dns_ptrs_create", () => {
  it("calls POST /v1/dns/ptrs with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_dns_ptrs_create")!({
      body: { ptr: "host.example.com", ip: "1.2.3.4", ttl: 3600 },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: "/v1/dns/ptrs",
        body: { ptr: "host.example.com", ip: "1.2.3.4", ttl: 3600 },
      }),
    );
  });
});

describe("contabo_dns_ptrs_create without body", () => {
  it("defaults body to {} when omitted", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_dns_ptrs_create")!({});

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: "POST", body: {} }),
    );
  });
});

describe("contabo_dns_ptrs_update", () => {
  it("calls PUT /v1/dns/ptrs/{ipAddress} with body", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_dns_ptrs_update")!({
      ipAddress: "1.2.3.4",
      body: { ptr: "new-host.example.com" },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PUT",
        path: "/v1/dns/ptrs/1.2.3.4",
        body: { ptr: "new-host.example.com" },
      }),
    );
  });
});

describe("contabo_dns_ptrs_update without body", () => {
  it("defaults body to {} when omitted", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_dns_ptrs_update")!({ ipAddress: "1.2.3.4" });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: "PUT", body: {} }),
    );
  });
});

describe("contabo_dns_ptrs_delete", () => {
  it("calls DELETE /v1/dns/ptrs/{ipAddress}", async () => {
    const { handlers, requestSpy } = setup();

    await handlers.get("contabo_dns_ptrs_delete")!({ ipAddress: "1.2.3.4" });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "DELETE",
        path: "/v1/dns/ptrs/1.2.3.4",
      }),
    );
  });
});
