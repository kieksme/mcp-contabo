export interface ContaboConfig {
  clientId: string;
  clientSecret: string;
  apiUser: string;
  apiPassword: string;
  apiBaseUrl: string;
  authUrl: string;
  accessToken?: string;
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. See .env.example and https://help.contabo.com/en/support/solutions/articles/103000270527-how-can-i-access-the-contabo-api-`,
    );
  }
  return value;
}

export function loadConfig(): ContaboConfig {
  const accessToken = process.env.CONTABO_ACCESS_TOKEN;

  if (accessToken) {
    return {
      clientId: process.env.CONTABO_CLIENT_ID ?? "",
      clientSecret: process.env.CONTABO_CLIENT_SECRET ?? "",
      apiUser: process.env.CONTABO_API_USER ?? "",
      apiPassword: process.env.CONTABO_API_PASSWORD ?? "",
      apiBaseUrl:
        process.env.CONTABO_API_BASE_URL ?? "https://api.contabo.com/v1",
      authUrl:
        process.env.CONTABO_AUTH_URL ??
        "https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token",
      accessToken,
    };
  }

  return {
    clientId: required("CONTABO_CLIENT_ID"),
    clientSecret: required("CONTABO_CLIENT_SECRET"),
    apiUser: required("CONTABO_API_USER"),
    apiPassword: required("CONTABO_API_PASSWORD"),
    apiBaseUrl:
      process.env.CONTABO_API_BASE_URL ?? "https://api.contabo.com/v1",
    authUrl:
      process.env.CONTABO_AUTH_URL ??
      "https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token",
  };
}
