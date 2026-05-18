import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ContaboAuth } from "./auth.js";
import type { ContaboConfig } from "./config.js";

const baseConfig: ContaboConfig = {
  clientId: "client-id",
  clientSecret: "client-secret",
  apiUser: "user@example.com",
  apiPassword: "api-pass",
  apiBaseUrl: "https://api.contabo.com/v1",
  authUrl: "https://auth.contabo.com/token",
};

describe("ContaboAuth", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns configured static access token without calling fetch", async () => {
    const auth = new ContaboAuth({
      ...baseConfig,
      accessToken: "static-bearer",
    });

    const token = await auth.getAccessToken();

    expect(token).toBe("static-bearer");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("fetches and caches OAuth tokens", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          access_token: "token-a",
          expires_in: 3600,
          token_type: "Bearer",
        }),
        { status: 200 },
      ),
    );

    const auth = new ContaboAuth(baseConfig);
    const first = await auth.getAccessToken();
    const second = await auth.getAccessToken();

    expect(first).toBe("token-a");
    expect(second).toBe("token-a");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [, init] = fetchMock.mock.calls[0]!;
    expect(init?.method).toBe("POST");
    expect(String(init?.body)).toContain("grant_type=password");
    expect(String(init?.body)).toContain("client_id=client-id");
  });

  it("throws actionable error when OAuth fails", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response("invalid_grant", { status: 401 }),
    );

    const auth = new ContaboAuth(baseConfig);

    await expect(auth.getAccessToken()).rejects.toThrow(
      /CONTABO_CLIENT_ID/,
    );
  });

  it("refetches token after invalidate", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            access_token: "token-1",
            expires_in: 3600,
            token_type: "Bearer",
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            access_token: "token-2",
            expires_in: 3600,
            token_type: "Bearer",
          }),
          { status: 200 },
        ),
      );

    const auth = new ContaboAuth(baseConfig);
    expect(await auth.getAccessToken()).toBe("token-1");
    auth.invalidate();
    expect(await auth.getAccessToken()).toBe("token-2");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
