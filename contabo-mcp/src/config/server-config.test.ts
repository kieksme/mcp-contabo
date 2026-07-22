import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadServerConfig, SERVER_ENV_KEYS } from "./server-config.js";

function clearEnv(): void {
  for (const key of SERVER_ENV_KEYS) {
    delete process.env[key];
  }
}

describe("loadServerConfig", () => {
  beforeEach(() => clearEnv());
  afterEach(() => clearEnv());

  it("defaults to the stdio transport when nothing is set", () => {
    const config = loadServerConfig();
    expect(config.transport).toBe("stdio");
  });

  it("parses http mode with defaults (port 3000, path /, host 0.0.0.0)", () => {
    process.env.MCP_TRANSPORT = "HTTP"; // case-insensitive
    process.env.MCP_AUTH_TOKEN = "secret-token";

    const config = loadServerConfig();

    expect(config.transport).toBe("http");
    expect(config.httpPort).toBe(3000);
    expect(config.httpPath).toBe("/");
    expect(config.httpHost).toBe("0.0.0.0");
    expect(config.authToken).toBe("secret-token");
    expect(config.dnsRebindingProtection).toBe(false);
  });

  it("throws when http mode is missing MCP_AUTH_TOKEN", () => {
    process.env.MCP_TRANSPORT = "http";
    expect(() => loadServerConfig()).toThrow(/MCP_AUTH_TOKEN is required/);
  });

  it("throws on an unknown transport value", () => {
    process.env.MCP_TRANSPORT = "grpc";
    expect(() => loadServerConfig()).toThrow(/Invalid MCP_TRANSPORT/);
  });

  it("throws on an invalid port", () => {
    process.env.MCP_TRANSPORT = "http";
    process.env.MCP_AUTH_TOKEN = "t";
    process.env.MCP_HTTP_PORT = "notaport";
    expect(() => loadServerConfig()).toThrow(/Invalid MCP_HTTP_PORT/);
  });

  it("normalizes a path without a leading slash", () => {
    process.env.MCP_TRANSPORT = "http";
    process.env.MCP_AUTH_TOKEN = "t";
    process.env.MCP_HTTP_PATH = "mcp";
    expect(loadServerConfig().httpPath).toBe("/mcp");
  });

  it("parses comma-separated allowed hosts and origins", () => {
    process.env.MCP_TRANSPORT = "http";
    process.env.MCP_AUTH_TOKEN = "t";
    process.env.MCP_HTTP_DNS_REBINDING_PROTECTION = "true";
    process.env.MCP_HTTP_ALLOWED_HOSTS = "a.example.com, b.example.com";
    process.env.MCP_HTTP_ALLOWED_ORIGINS = "https://app.example.com";

    const config = loadServerConfig();

    expect(config.dnsRebindingProtection).toBe(true);
    expect(config.allowedHosts).toEqual(["a.example.com", "b.example.com"]);
    expect(config.allowedOrigins).toEqual(["https://app.example.com"]);
  });
});
