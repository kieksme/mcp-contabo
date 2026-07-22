import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CONTABO_ENV_KEYS } from "../config/env.js";
import type { ServerConfig } from "../config/server-config.js";
import { startHttpServer } from "./http.js";

const TOKEN = "test-bearer-token";

const config: ServerConfig = {
  transport: "http",
  httpHost: "127.0.0.1",
  httpPort: 0, // ephemeral port
  httpPath: "/",
  authToken: TOKEN,
  dnsRebindingProtection: false,
};

const INITIALIZE_BODY = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "vitest", version: "0.0.0" },
  },
};

const MCP_ACCEPT = "application/json, text/event-stream";

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  // Static access token → factory works without OAuth env or network.
  process.env.CONTABO_ACCESS_TOKEN = "test-token";
  server = await startHttpServer(config);
  const { port } = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  for (const key of CONTABO_ENV_KEYS) {
    delete process.env[key];
  }
});

describe("Streamable HTTP transport", () => {
  it("serves /health without authentication", async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });

  it("rejects a POST without a bearer token (401)", async () => {
    const res = await fetch(`${baseUrl}/`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: MCP_ACCEPT },
      body: JSON.stringify(INITIALIZE_BODY),
    });
    expect(res.status).toBe(401);
    await res.body?.cancel();
  });

  it("rejects a POST with the wrong bearer token (401)", async () => {
    const res = await fetch(`${baseUrl}/`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: MCP_ACCEPT,
        authorization: "Bearer wrong-token",
      },
      body: JSON.stringify(INITIALIZE_BODY),
    });
    expect(res.status).toBe(401);
    await res.body?.cancel();
  });

  it("rejects a GET without a session id (400)", async () => {
    const res = await fetch(`${baseUrl}/`, {
      headers: { accept: MCP_ACCEPT, authorization: `Bearer ${TOKEN}` },
    });
    expect(res.status).toBe(400);
    await res.body?.cancel();
  });

  it("completes initialize and issues a session id", async () => {
    const res = await fetch(`${baseUrl}/`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: MCP_ACCEPT,
        authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(INITIALIZE_BODY),
    });

    expect(res.status).toBe(200);
    const sessionId = res.headers.get("mcp-session-id");
    expect(sessionId).toBeTruthy();
    await res.body?.cancel();

    // A follow-up call with the session id is recognized (not rejected as 400/404).
    const followUp = await fetch(`${baseUrl}/`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: MCP_ACCEPT,
        authorization: `Bearer ${TOKEN}`,
        "mcp-session-id": sessionId as string,
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }),
    });
    expect(followUp.status).toBe(200);
    await followUp.body?.cancel();
  });
});
