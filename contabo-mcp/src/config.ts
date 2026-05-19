import {
  readContaboEnv,
  readContaboEnvOrDefault,
  type ContaboEnvKey,
} from "./config/env.js";
import {
  assertAllowedContaboUrl,
  DEFAULT_API_BASE_URL,
  DEFAULT_AUTH_URL,
} from "./config/hosts.js";

export interface ContaboConfig {
  clientId: string;
  clientSecret: string;
  apiUser: string;
  apiPassword: string;
  apiBaseUrl: string;
  authUrl: string;
  accessToken?: string;
}

function required(name: ContaboEnvKey): string {
  const value = readContaboEnv(name);
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. See .env.example and https://help.contabo.com/en/support/solutions/articles/103000270527-how-can-i-access-the-contabo-api-`,
    );
  }
  return value;
}

function resolveApiBaseUrl(): string {
  const url = readContaboEnvOrDefault("CONTABO_API_BASE_URL", DEFAULT_API_BASE_URL);
  assertAllowedContaboUrl(url, "api");
  return url;
}

function resolveAuthUrl(): string {
  const url = readContaboEnvOrDefault("CONTABO_AUTH_URL", DEFAULT_AUTH_URL);
  assertAllowedContaboUrl(url, "auth");
  return url;
}

export function loadConfig(): ContaboConfig {
  const accessToken = readContaboEnv("CONTABO_ACCESS_TOKEN");

  if (accessToken) {
    return {
      clientId: readContaboEnv("CONTABO_CLIENT_ID") ?? "",
      clientSecret: readContaboEnv("CONTABO_CLIENT_SECRET") ?? "",
      apiUser: readContaboEnv("CONTABO_API_USER") ?? "",
      apiPassword: readContaboEnv("CONTABO_API_PASSWORD") ?? "",
      apiBaseUrl: resolveApiBaseUrl(),
      authUrl: resolveAuthUrl(),
      accessToken,
    };
  }

  return {
    clientId: required("CONTABO_CLIENT_ID"),
    clientSecret: required("CONTABO_CLIENT_SECRET"),
    apiUser: required("CONTABO_API_USER"),
    apiPassword: required("CONTABO_API_PASSWORD"),
    apiBaseUrl: resolveApiBaseUrl(),
    authUrl: resolveAuthUrl(),
  };
}
