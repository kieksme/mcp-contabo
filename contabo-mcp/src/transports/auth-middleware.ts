import { timingSafeEqual } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

const BEARER_PREFIX = "Bearer ";

/**
 * Constant-time check of the `Authorization: Bearer <token>` header against the
 * expected token. Returns false on any missing/malformed header.
 *
 * The early length-mismatch return leaks only the token *length* (not sensitive)
 * while keeping the value comparison itself constant-time — `timingSafeEqual`
 * requires equal-length buffers.
 */
export function isAuthorized(
  req: IncomingMessage,
  expectedToken: string,
): boolean {
  const header = req.headers.authorization;
  if (typeof header !== "string" || !header.startsWith(BEARER_PREFIX)) {
    return false;
  }

  const presented = Buffer.from(header.slice(BEARER_PREFIX.length));
  const expected = Buffer.from(expectedToken);

  if (presented.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(presented, expected);
}

/** Writes a 401 JSON-RPC error response with a `WWW-Authenticate` challenge. */
export function unauthorized(res: ServerResponse): void {
  res
    .writeHead(401, {
      "content-type": "application/json",
      "www-authenticate": 'Bearer realm="contabo-mcp"',
    })
    .end(
      JSON.stringify({
        jsonrpc: "2.0",
        error: { code: -32001, message: "Unauthorized" },
        id: null,
      }),
    );
}
