import { timingSafeEqual } from "node:crypto";
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { CfWorkerJsonSchemaValidator } from "@modelcontextprotocol/sdk/validation/cfworker";
import { ContaboAuth } from "./auth.js";
import { ContaboClient } from "./client.js";
import { loadConfig } from "./config.js";
import { registerAllTools } from "./tools/register-all.js";
import { loadPackageVersion } from "./version.js";

/**
 * Remote HTTP entrypoint (Streamable HTTP transport) used by the Docker image only.
 *
 * The published npm CLI (`dist/index.js`) stays stdio-only; this file exposes the exact
 * same MCP server over HTTP so it can run as a remote endpoint behind a reverse proxy.
 *
 * Security: the endpoint controls infrastructure (VMs, snapshots, secrets), so access is
 * gated by a bearer token (`MCP_HTTP_AUTH_TOKEN`). The server refuses to start without one
 * (fail-closed) and never exposes the MCP route unauthenticated.
 */

const PORT = Number(process.env.PORT ?? "3000");
const HOST = process.env.HOST ?? "0.0.0.0";
const MCP_PATH = process.env.MCP_HTTP_PATH ?? "/mcp";
const AUTH_TOKEN = process.env.MCP_HTTP_AUTH_TOKEN;

function unauthorized(res: ServerResponse): void {
  res.writeHead(401, {
    "content-type": "application/json",
    "www-authenticate": 'Bearer realm="contabo-mcp"',
  });
  res.end(JSON.stringify({ error: "unauthorized" }));
}

/** Constant-time bearer-token check against MCP_HTTP_AUTH_TOKEN. */
function isAuthorized(req: IncomingMessage): boolean {
  if (!AUTH_TOKEN) {
    return false;
  }
  const header = req.headers.authorization;
  const prefix = "Bearer ";
  if (typeof header !== "string" || !header.startsWith(prefix)) {
    return false;
  }
  const provided = Buffer.from(header.slice(prefix.length));
  const expected = Buffer.from(AUTH_TOKEN);
  // timingSafeEqual requires equal length; the length guard is not itself constant-time,
  // but the token length is not secret.
  if (provided.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(provided, expected);
}

async function main(): Promise<void> {
  if (!AUTH_TOKEN) {
    throw new Error(
      "MCP_HTTP_AUTH_TOKEN is required to run the HTTP transport (fail-closed). Set a strong random token.",
    );
  }

  // Build config/auth/client once (auth caches the OAuth token across requests).
  const config = loadConfig();
  const auth = new ContaboAuth(config);
  const client = new ContaboClient(config, auth);
  const version = loadPackageVersion();

  // Fresh McpServer + transport per request (stateless Streamable HTTP) to avoid
  // request-id/state collisions between concurrent clients. The client is shared.
  function buildServer(): McpServer {
    const server = new McpServer(
      { name: "contabo-mcp", version },
      { jsonSchemaValidator: new CfWorkerJsonSchemaValidator() },
    );
    registerAllTools(server, client);
    return server;
  }

  const httpServer = createServer((req, res) => {
    void handleRequest(req, res).catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      if (!res.headersSent) {
        res.writeHead(500, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "internal_server_error" }));
      } else {
        res.end();
      }
    });
  });

  async function handleRequest(
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

    // Unauthenticated liveness/readiness probe for the container health check.
    if (req.method === "GET" && url.pathname === "/health") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ status: "ok", version }));
      return;
    }

    if (url.pathname !== MCP_PATH) {
      res.writeHead(404, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: "not_found" }));
      return;
    }

    if (!isAuthorized(req)) {
      unauthorized(res);
      return;
    }

    const server = buildServer();
    const transport = new StreamableHTTPServerTransport({
      // Stateless mode: no session tracking, one transport per request.
      sessionIdGenerator: undefined,
    });
    res.on("close", () => {
      void transport.close();
      void server.close();
    });
    await server.connect(transport);
    await transport.handleRequest(req, res);
  }

  httpServer.listen(PORT, HOST, () => {
    console.error(
      `contabo-mcp v${version} listening on http://${HOST}:${PORT}${MCP_PATH}`,
    );
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
