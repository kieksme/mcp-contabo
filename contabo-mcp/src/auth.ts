import type { ContaboConfig } from "./config.js";
import { assertAllowedContaboUrl } from "./config/hosts.js";

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export class ContaboAuth {
  private token?: string;
  private expiresAt = 0;

  constructor(private readonly config: ContaboConfig) {}

  async getAccessToken(): Promise<string> {
    if (this.config.accessToken) {
      return this.config.accessToken;
    }

    const now = Date.now();
    if (this.token && now < this.expiresAt - 30_000) {
      return this.token;
    }

    const body = new URLSearchParams({
      grant_type: "password",
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      username: this.config.apiUser,
      password: this.config.apiPassword,
    });

    assertAllowedContaboUrl(this.config.authUrl, "auth");
    const response = await fetch(this.config.authUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Contabo OAuth token request failed (${response.status}): ${text}. Check CONTABO_CLIENT_ID, CONTABO_CLIENT_SECRET, CONTABO_API_USER, and CONTABO_API_PASSWORD.`,
      );
    }

    const data = (await response.json()) as TokenResponse;
    this.token = data.access_token;
    this.expiresAt = now + data.expires_in * 1000;
    return this.token;
  }

  invalidate(): void {
    this.token = undefined;
    this.expiresAt = 0;
  }
}
