import { randomUUID } from "node:crypto";
import type { ContaboAuth } from "./auth.js";
import type { ContaboConfig } from "./config.js";
import { contaboErrorMessage } from "./utils/errors.js";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ContaboRequestOptions {
  method: HttpMethod;
  path: string;
  query?: Record<string, string>;
  body?: unknown;
  xTraceId?: string;
}

export class ContaboClient {
  constructor(
    private readonly config: ContaboConfig,
    private readonly auth: ContaboAuth,
  ) {}

  async request<T = unknown>(options: ContaboRequestOptions): Promise<T> {
    return this.requestWithRetry(options, false);
  }

  private async requestWithRetry<T>(
    options: ContaboRequestOptions,
    retried: boolean,
  ): Promise<T> {
    const requestId = randomUUID();
    const token = await this.auth.getAccessToken();

    const url = new URL(
      options.path.startsWith("/") ? options.path.slice(1) : options.path,
      this.config.apiBaseUrl.endsWith("/")
        ? this.config.apiBaseUrl
        : `${this.config.apiBaseUrl}/`,
    );

    if (options.query) {
      for (const [key, value] of Object.entries(options.query)) {
        url.searchParams.set(key, value);
      }
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "x-request-id": requestId,
      Accept: "application/json",
    };

    if (options.xTraceId) {
      headers["x-trace-id"] = options.xTraceId;
    }

    let body: string | undefined;
    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(options.body);
    }

    const response = await fetch(url.toString(), {
      method: options.method,
      headers,
      body,
    });

    if (response.status === 401 && !retried && !this.config.accessToken) {
      this.auth.invalidate();
      return this.requestWithRetry(options, true);
    }

    if (!response.ok) {
      throw new Error(await contaboErrorMessage(response, requestId));
    }

    if (response.status === 204) {
      return { _requestId: requestId } as T;
    }

    const text = await response.text();
    if (!text) {
      return { _requestId: requestId } as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      return { _requestId: requestId, raw: text } as T;
    }
  }
}
