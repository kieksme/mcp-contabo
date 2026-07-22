import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
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
