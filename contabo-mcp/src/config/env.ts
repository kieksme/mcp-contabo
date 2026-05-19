/** Environment variables read by this MCP server (allowlist). */
export const CONTABO_ENV_KEYS = [
  "CONTABO_CLIENT_ID",
  "CONTABO_CLIENT_SECRET",
  "CONTABO_API_USER",
  "CONTABO_API_PASSWORD",
  "CONTABO_ACCESS_TOKEN",
  "CONTABO_API_BASE_URL",
  "CONTABO_AUTH_URL",
  "CONTABO_ALLOW_CUSTOM_HOSTS",
] as const;

export type ContaboEnvKey = (typeof CONTABO_ENV_KEYS)[number];

/** Sole entry point for reading Contabo-related environment variables. */
export function readContaboEnv(name: ContaboEnvKey): string | undefined {
  return process.env[name];
}

export function readContaboEnvOrDefault(
  name: ContaboEnvKey,
  defaultValue: string,
): string {
  return readContaboEnv(name) ?? defaultValue;
}

export function isCustomHostsAllowed(): boolean {
  return readContaboEnv("CONTABO_ALLOW_CUSTOM_HOSTS") === "true";
}
