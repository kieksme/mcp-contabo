import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CONTABO_ENV_KEYS, readContaboEnv } from "./env.js";
import {
  assertAllowedContaboUrl,
  DEFAULT_API_BASE_URL,
  DEFAULT_AUTH_URL,
} from "./hosts.js";

describe("assertAllowedContaboUrl", () => {
  beforeEach(() => {
    delete process.env.CONTABO_ALLOW_CUSTOM_HOSTS;
  });
  afterEach(() => {
    delete process.env.CONTABO_ALLOW_CUSTOM_HOSTS;
  });

  it("allows default Contabo API and auth URLs", () => {
    expect(() => assertAllowedContaboUrl(DEFAULT_API_BASE_URL, "api")).not.toThrow();
    expect(() => assertAllowedContaboUrl(DEFAULT_AUTH_URL, "auth")).not.toThrow();
  });

  it("allows *.contabo.com subdomains", () => {
    expect(() =>
      assertAllowedContaboUrl("https://staging.api.contabo.com/v1", "api"),
    ).not.toThrow();
  });

  it("rejects non-Contabo API hosts", () => {
    expect(() =>
      assertAllowedContaboUrl("https://evil.com/v1", "api"),
    ).toThrow(/not allowed/);
  });

  it("rejects non-Contabo auth hosts", () => {
    expect(() =>
      assertAllowedContaboUrl("https://evil.com/token", "auth"),
    ).toThrow(/not allowed/);
  });

  it("rejects non-HTTPS URLs", () => {
    expect(() =>
      assertAllowedContaboUrl("http://api.contabo.com/v1", "api"),
    ).toThrow(/HTTPS/);
  });

  it("skips validation when CONTABO_ALLOW_CUSTOM_HOSTS=true", () => {
    process.env.CONTABO_ALLOW_CUSTOM_HOSTS = "true";
    expect(() =>
      assertAllowedContaboUrl("https://evil.com/v1", "api"),
    ).not.toThrow();
  });
});

describe("CONTABO_ENV_KEYS", () => {
  it("lists only documented environment variables", () => {
    expect(CONTABO_ENV_KEYS).toContain("CONTABO_CLIENT_ID");
    expect(CONTABO_ENV_KEYS).toContain("CONTABO_ALLOW_CUSTOM_HOSTS");
    expect(readContaboEnv).toBeTypeOf("function");
  });
});
