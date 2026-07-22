/**
 * Transport / serving configuration for the MCP server.
 *
 * Deliberately kept separate from `config/env.ts` (`CONTABO_ENV_KEYS`), whose
 * allowlist is scoped to Contabo API credentials. These `MCP_*` variables
 * configure how the process serves MCP (stdio vs. remote HTTP), which is a
 * different concern from upstream API auth.
 */

export type TransportKind = "stdio" | "http";

export interface ServerConfig {
  transport: TransportKind;
  httpHost: string;
  httpPort: number;
  httpPath: string;
  /** Bearer token required for the HTTP transport. Empty string in stdio mode (unused). */
  authToken: string;
  dnsRebindingProtection: boolean;
  allowedHosts?: string[];
  allowedOrigins?: string[];
}

/** Environment variables read by this module (allowlist). */
export const SERVER_ENV_KEYS = [
  "MCP_TRANSPORT",
  "MCP_HTTP_HOST",
  "MCP_HTTP_PORT",
  "MCP_HTTP_PATH",
  "MCP_AUTH_TOKEN",
  "MCP_HTTP_DNS_REBINDING_PROTECTION",
  "MCP_HTTP_ALLOWED_HOSTS",
  "MCP_HTTP_ALLOWED_ORIGINS",
] as const;

export type ServerEnvKey = (typeof SERVER_ENV_KEYS)[number];

function read(name: ServerEnvKey): string | undefined {
  return process.env[name];
}

function parseCsv(value: string | undefined): string[] | undefined {
  if (!value) {
    return undefined;
  }
  const items = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length > 0 ? items : undefined;
}

export const DEFAULT_HTTP_HOST = "0.0.0.0";
export const DEFAULT_HTTP_PORT = 3000;
export const DEFAULT_HTTP_PATH = "/";

export function loadServerConfig(): ServerConfig {
  const rawTransport = (read("MCP_TRANSPORT") ?? "stdio").toLowerCase();
  if (rawTransport !== "stdio" && rawTransport !== "http") {
    throw new Error(
      `Invalid MCP_TRANSPORT="${rawTransport}". Expected "stdio" or "http".`,
    );
  }
  const transport = rawTransport as TransportKind;

  if (transport === "stdio") {
    return {
      transport,
      httpHost: "",
      httpPort: 0,
      httpPath: "",
      authToken: "",
      dnsRebindingProtection: false,
    };
  }

  const authToken = read("MCP_AUTH_TOKEN") ?? "";
  if (!authToken) {
    throw new Error(
      "MCP_AUTH_TOKEN is required when MCP_TRANSPORT=http. Generate a strong random value, e.g. `openssl rand -hex 32`.",
    );
  }

  const rawPort = read("MCP_HTTP_PORT");
  const httpPort = rawPort === undefined ? DEFAULT_HTTP_PORT : Number(rawPort);
  if (!Number.isInteger(httpPort) || httpPort < 1 || httpPort > 65535) {
    throw new Error(
      `Invalid MCP_HTTP_PORT="${rawPort}". Expected an integer between 1 and 65535.`,
    );
  }

  let httpPath = read("MCP_HTTP_PATH") ?? DEFAULT_HTTP_PATH;
  if (!httpPath.startsWith("/")) {
    httpPath = `/${httpPath}`;
  }

  return {
    transport,
    httpHost: read("MCP_HTTP_HOST") ?? DEFAULT_HTTP_HOST,
    httpPort,
    httpPath,
    authToken,
    dnsRebindingProtection:
      read("MCP_HTTP_DNS_REBINDING_PROTECTION") === "true",
    allowedHosts: parseCsv(read("MCP_HTTP_ALLOWED_HOSTS")),
    allowedOrigins: parseCsv(read("MCP_HTTP_ALLOWED_ORIGINS")),
  };
}
