import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ContaboAuth } from "./auth.js";
import { ContaboClient } from "./client.js";
import type { ContaboConfig } from "./config.js";

const config: ContaboConfig = {
  clientId: "c",
  clientSecret: "s",
  apiUser: "u",
  apiPassword: "p",
  apiBaseUrl: "https://api.contabo.com/v1",
  authUrl: "https://auth.contabo.com/token",
  accessToken: "test-token",
};

describe("ContaboClient", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends authorized GET with x-request-id and query params", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: [] }), { status: 200 }),
    );

    const client = new ContaboClient(config, new ContaboAuth(config));
    const result = await client.request({
      method: "GET",
      path: "/v1/compute/instances",
      query: { page: "1", size: "10" },
      xTraceId: "trace-abc",
    });

    expect(result).toEqual({ data: [] });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe(
      "https://api.contabo.com/v1/compute/instances?page=1&size=10",
    );
    expect(init?.method).toBe("GET");
    const headers = init?.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer test-token");
    expect(headers["x-request-id"]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(headers["x-trace-id"]).toBe("trace-abc");
  });

  it("deduplicates /v1 when base URL already includes /v1", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: [] }), { status: 200 }),
    );

    const client = new ContaboClient(config, new ContaboAuth(config));
    await client.request({
      method: "GET",
      path: "/v1/secrets",
    });

    expect(String(fetchMock.mock.calls[0]![0])).toBe(
      "https://api.contabo.com/v1/secrets",
    );
  });

  it("sends JSON body on POST", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { instanceId: 1 } }), {
        status: 201,
      }),
    );

    const client = new ContaboClient(config, new ContaboAuth(config));
    await client.request({
      method: "POST",
      path: "/v1/compute/instances",
      body: { imageId: "img", productId: "V1", region: "EU" },
    });

    const [, init] = fetchMock.mock.calls[0]!;
    expect(init?.method).toBe("POST");
    expect(init?.body).toBe(
      JSON.stringify({ imageId: "img", productId: "V1", region: "EU" }),
    );
  });

  it("retries once on 401 when using OAuth", async () => {
    const oauthConfig: ContaboConfig = {
      ...config,
      accessToken: undefined,
    };

    const auth = new ContaboAuth(oauthConfig);
    const getToken = vi
      .spyOn(auth, "getAccessToken")
      .mockResolvedValueOnce("expired")
      .mockResolvedValueOnce("fresh");
    const invalidate = vi.spyOn(auth, "invalidate");

    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(new Response("unauthorized", { status: 401 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: { ok: true } }), { status: 200 }),
      );

    const client = new ContaboClient(oauthConfig, auth);
    const result = await client.request({
      method: "GET",
      path: "/v1/secrets",
    });

    expect(result).toEqual({ data: { ok: true } });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(invalidate).toHaveBeenCalledTimes(1);
    expect(getToken).toHaveBeenCalledTimes(2);
  });

  it("does not retry 401 when using static access token", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(new Response("forbidden", { status: 401 }));

    const client = new ContaboClient(config, new ContaboAuth(config));

    await expect(
      client.request({ method: "GET", path: "/v1/secrets" }),
    ).rejects.toThrow(/401/);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns request id wrapper for 204 responses", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 204 }));

    const client = new ContaboClient(config, new ContaboAuth(config));
    const result = await client.request({
      method: "DELETE",
      path: "/v1/secrets/1",
    });

    expect(result).toHaveProperty("_requestId");
  });
});
