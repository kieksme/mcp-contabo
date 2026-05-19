import { isCustomHostsAllowed } from "./env.js";

export const DEFAULT_API_BASE_URL = "https://api.contabo.com/v1";
export const DEFAULT_AUTH_URL =
  "https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token";

const API_HOSTS = new Set(["api.contabo.com"]);
const AUTH_HOSTS = new Set(["auth.contabo.com"]);

export type ContaboUrlPurpose = "api" | "auth";

function allowedHostsFor(purpose: ContaboUrlPurpose): Set<string> {
  return purpose === "api" ? API_HOSTS : AUTH_HOSTS;
}

function isAllowedHostname(hostname: string, purpose: ContaboUrlPurpose): boolean {
  const allowed = allowedHostsFor(purpose);
  if (allowed.has(hostname)) {
    return true;
  }
  return hostname.endsWith(".contabo.com") && hostname.length > ".contabo.com".length;
}

/**
 * Ensures outbound URLs target Contabo infrastructure only.
 * Set CONTABO_ALLOW_CUSTOM_HOSTS=true to permit non-Contabo hosts (staging/dev).
 */
export function assertAllowedContaboUrl(
  url: string,
  purpose: ContaboUrlPurpose,
): void {
  if (isCustomHostsAllowed()) {
    return;
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid ${purpose} URL: ${url}`);
  }

  if (parsed.protocol !== "https:") {
    throw new Error(
      `${purpose} URL must use HTTPS (got ${parsed.protocol}//${parsed.hostname})`,
    );
  }

  if (!isAllowedHostname(parsed.hostname, purpose)) {
    const expected = [...allowedHostsFor(purpose)].join(", ");
    throw new Error(
      `${purpose} URL host "${parsed.hostname}" is not allowed. Expected Contabo host (${expected} or *.contabo.com). Set CONTABO_ALLOW_CUSTOM_HOSTS=true only for non-production staging.`,
    );
  }
}
