import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadConfig } from "./config.js";

const ENV_KEYS = [
  "CONTABO_CLIENT_ID",
  "CONTABO_CLIENT_SECRET",
  "CONTABO_API_USER",
  "CONTABO_API_PASSWORD",
  "CONTABO_ACCESS_TOKEN",
  "CONTABO_API_BASE_URL",
  "CONTABO_AUTH_URL",
] as const;

function clearEnv(): void {
  for (const key of ENV_KEYS) {
    delete process.env[key];
  }
}

describe("loadConfig", () => {
  beforeEach(() => clearEnv());
  afterEach(() => clearEnv());

  it("loads OAuth credentials when access token is not set", () => {
    process.env.CONTABO_CLIENT_ID = "client";
    process.env.CONTABO_CLIENT_SECRET = "secret";
    process.env.CONTABO_API_USER = "user@example.com";
    process.env.CONTABO_API_PASSWORD = "pass";

    const config = loadConfig();

    expect(config.clientId).toBe("client");
    expect(config.clientSecret).toBe("secret");
    expect(config.apiUser).toBe("user@example.com");
    expect(config.apiPassword).toBe("pass");
    expect(config.apiBaseUrl).toBe("https://api.contabo.com/v1");
    expect(config.accessToken).toBeUndefined();
  });

  it("uses static access token without requiring OAuth env vars", () => {
    process.env.CONTABO_ACCESS_TOKEN = "static-token";

    const config = loadConfig();

    expect(config.accessToken).toBe("static-token");
    expect(config.clientId).toBe("");
  });

  it("applies custom base and auth URLs", () => {
    process.env.CONTABO_ACCESS_TOKEN = "t";
    process.env.CONTABO_API_BASE_URL = "https://api.example.test/v1";
    process.env.CONTABO_AUTH_URL = "https://auth.example.test/token";

    const config = loadConfig();

    expect(config.apiBaseUrl).toBe("https://api.example.test/v1");
    expect(config.authUrl).toBe("https://auth.example.test/token");
  });

  it("throws when required OAuth variables are missing", () => {
    expect(() => loadConfig()).toThrow(/CONTABO_CLIENT_ID/);
  });
});
