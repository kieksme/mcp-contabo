import { McpServer } from "@modelcontextprotocol/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ContaboAuth } from "./auth.js";
import { ContaboClient } from "./client.js";
import { CONTABO_ENV_KEYS } from "./config/env.js";
import { createContaboServer } from "./server.js";

function clearEnv(): void {
  for (const key of CONTABO_ENV_KEYS) {
    delete process.env[key];
  }
}

describe("createContaboServer", () => {
  beforeEach(() => clearEnv());
  afterEach(() => clearEnv());

  it("builds a wired McpServer from valid env (no network at construction)", () => {
    // Static access token → dev mode, no OAuth vars required, no lazy fetch fires.
    process.env.CONTABO_ACCESS_TOKEN = "test-token";

    const server = createContaboServer();

    expect(server).toBeInstanceOf(McpServer);
  });

  it("throws when required credentials are missing", () => {
    expect(() => createContaboServer()).toThrow(/Missing required environment variable/);
  });
});

describe("createContaboServer with a shared client", () => {
  beforeEach(() => clearEnv());
  afterEach(() => clearEnv());

  it("does not read the environment when a client is passed in", () => {
    const config = {
      clientId: "",
      clientSecret: "",
      apiUser: "",
      apiPassword: "",
      apiBaseUrl: "https://api.contabo.com/v1",
      authUrl: "https://auth.contabo.com/token",
      accessToken: "test-token",
    };

    const server = createContaboServer(new ContaboClient(config, new ContaboAuth(config)));

    expect(server).toBeInstanceOf(McpServer);
  });
});
