import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from "node:http";
import { randomUUID } from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import type { ServerConfig } from "../config/server-config.js";
import { createContaboServer } from "../server.js";
import { isAuthorized, unauthorized } from "./auth-middleware.js";

/** Reject request bodies larger than this to avoid unbounded buffering. */
const MAX_BODY_BYTES = 4 * 1024 * 1024;

function jsonRpcError(
  res: ServerResponse,
  status: number,
  code: number,
  message: string,
  headers: Record<string, string> = {},
): void {
  res
    .writeHead(status, { "content-type": "application/json", ...headers })
    .end(
      JSON.stringify({
        jsonrpc: "2.0",
        error: { code, message },
        id: null,
      }),
    );
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    total += (chunk as Buffer).length;
    if (total > MAX_BODY_BYTES) {
      throw new Error("payload too large");
    }
    chunks.push(chunk as Buffer);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw.length > 0 ? JSON.parse(raw) : undefined;
}

function getSessionId(req: IncomingMessage): string | undefined {
  const value = req.headers["mcp-session-id"];
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Builds the Node HTTP request handler for the stateful Streamable HTTP
 * transport. Each MCP session gets its own `StreamableHTTPServerTransport`
 * (and `McpServer`), tracked in an in-memory map keyed by `Mcp-Session-Id`.
 */
export function createHttpRequestHandler(
  config: ServerConfig,
): (req: IncomingMessage, res: ServerResponse) => void {
  const transports = new Map<string, StreamableHTTPServerTransport>();

  async function handlePost(
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> {
    let body: unknown;
    try {
      body = await readJsonBody(req);
    } catch (error) {
      if (error instanceof Error && error.message === "payload too large") {
        jsonRpcError(res, 413, -32000, "Payload Too Large");
        return;
      }
      jsonRpcError(res, 400, -32700, "Parse error");
      return;
    }

    const sessionId = getSessionId(req);
    let transport: StreamableHTTPServerTransport | undefined;

    if (sessionId && transports.has(sessionId)) {
      transport = transports.get(sessionId);
    } else if (!sessionId && isInitializeRequest(body)) {
      // New session: create a dedicated transport + server pair.
      const server = createContaboServer();
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        enableDnsRebindingProtection: config.dnsRebindingProtection,
        allowedHosts: config.allowedHosts,
        allowedOrigins: config.allowedOrigins,
        onsessioninitialized: (sid) => {
          transports.set(sid, transport as StreamableHTTPServerTransport);
        },
      });
      transport.onclose = () => {
        const sid = transport?.sessionId;
        if (sid) {
          transports.delete(sid);
        }
        void server.close();
      };
      await server.connect(transport);
    } else {
      jsonRpcError(
        res,
        400,
        -32000,
        "Bad Request: no valid session ID provided for a non-initialize request",
      );
      return;
    }

    await transport!.handleRequest(req, res, body);
  }

  async function handleSessionRequest(
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> {
    // GET (SSE stream) and DELETE (session termination) require an existing session.
    const sessionId = getSessionId(req);
    if (!sessionId || !transports.has(sessionId)) {
      jsonRpcError(res, 400, -32000, "Bad Request: invalid or missing session ID");
      return;
    }
    await transports.get(sessionId)!.handleRequest(req, res);
  }

  async function route(
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> {
    let url: URL;
    try {
      url = new URL(req.url ?? "/", "http://localhost");
    } catch {
      jsonRpcError(res, 400, -32000, "Bad Request: invalid URL");
      return;
    }

    // Unauthenticated liveness/health probe — checked before the path/auth gates.
    if (req.method === "GET" && url.pathname === "/health") {
      res
        .writeHead(200, { "content-type": "application/json" })
        .end(JSON.stringify({ status: "ok" }));
      return;
    }

    if (url.pathname !== config.httpPath) {
      res.writeHead(404, { "content-type": "application/json" }).end(
        JSON.stringify({ error: "Not Found" }),
      );
      return;
    }

    // Bearer auth gate — runs before any MCP processing, including `initialize`.
    if (!isAuthorized(req, config.authToken)) {
      unauthorized(res);
      return;
    }

    switch (req.method) {
      case "POST":
        await handlePost(req, res);
        return;
      case "GET":
      case "DELETE":
        await handleSessionRequest(req, res);
        return;
      default:
        jsonRpcError(res, 405, -32000, "Method Not Allowed", {
          allow: "POST, GET, DELETE",
        });
    }
  }

  return (req, res) => {
    void route(req, res).catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      if (!res.headersSent) {
        jsonRpcError(res, 500, -32603, "Internal error");
      }
    });
  };
}

/**
 * Starts the remote MCP server over Streamable HTTP and resolves once it is
 * listening. Rejects on bind failure (e.g. port in use) so the process fails fast.
 */
export function startHttpServer(config: ServerConfig): Promise<Server> {
  const httpServer = createServer(createHttpRequestHandler(config));

  return new Promise<Server>((resolve, reject) => {
    httpServer.once("error", reject);
    httpServer.listen(config.httpPort, config.httpHost, () => {
      httpServer.removeListener("error", reject);
      const address = httpServer.address();
      const port = typeof address === "object" && address ? address.port : config.httpPort;
      console.error(
        `contabo-mcp Streamable HTTP transport listening on ${config.httpHost}:${port}${config.httpPath}`,
      );
      resolve(httpServer);
    });
  });
}
