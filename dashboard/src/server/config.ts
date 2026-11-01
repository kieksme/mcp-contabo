/**
 * Environment variables read by the dashboard (allowlist, mirrors
 * contabo-mcp's config/env.ts pattern). Contabo credentials themselves are
 * read directly by contabo-mcp's own loadConfig() — this module only covers
 * variables specific to the dashboard process.
 */
const DASHBOARD_ENV_KEYS = [
  "ANTHROPIC_API_KEY",
  "DASHBOARD_AGENT_MODEL",
  "DASHBOARD_AGENT_TOOL_PREFIXES",
  "DASHBOARD_AUTH_TOKEN",
  "DASHBOARD_SESSION_SECRET",
  "PORT",
] as const;

type DashboardEnvKey = (typeof DASHBOARD_ENV_KEYS)[number];

function read(name: DashboardEnvKey): string | undefined {
  return process.env[name];
}

export const DEFAULT_AGENT_MODEL = "claude-sonnet-5";
export const DEFAULT_AGENT_TOOL_PREFIXES = [
  "contabo_instances_",
  "contabo_snapshots_",
];
export const DEFAULT_PORT = 3000;

export interface DashboardConfig {
  anthropicApiKey: string;
  agentModel: string;
  agentToolPrefixes: string[];
  authToken: string;
  sessionSecret: string;
  port: number;
}

function required(name: DashboardEnvKey): string {
  const value = read(name);
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. See dashboard/.env.example.`,
    );
  }
  return value;
}

function parseCsv(value: string | undefined, fallback: string[]): string[] {
  if (!value) {
    return fallback;
  }
  const items = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length > 0 ? items : fallback;
}

export function loadDashboardConfig(): DashboardConfig {
  const rawPort = read("PORT");
  const port = rawPort === undefined ? DEFAULT_PORT : Number(rawPort);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT="${rawPort}". Expected an integer between 1 and 65535.`);
  }

  return {
    anthropicApiKey: required("ANTHROPIC_API_KEY"),
    agentModel: read("DASHBOARD_AGENT_MODEL") ?? DEFAULT_AGENT_MODEL,
    agentToolPrefixes: parseCsv(
      read("DASHBOARD_AGENT_TOOL_PREFIXES"),
      DEFAULT_AGENT_TOOL_PREFIXES,
    ),
    authToken: required("DASHBOARD_AUTH_TOKEN"),
    sessionSecret: required("DASHBOARD_SESSION_SECRET"),
    port,
  };
}
