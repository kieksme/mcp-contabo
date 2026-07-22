import type { IncomingMessage } from "node:http";
import { describe, expect, it } from "vitest";
import { isAuthorized } from "./auth-middleware.js";

function reqWith(authorization?: string): IncomingMessage {
  return { headers: authorization ? { authorization } : {} } as IncomingMessage;
}

describe("isAuthorized", () => {
  const token = "s3cr3t-token";

  it("returns false when the expected token is empty", () => {
    expect(isAuthorized(reqWith("Bearer "), "")).toBe(false);
  });

  it("returns false when the Authorization header is missing", () => {
    expect(isAuthorized(reqWith(), token)).toBe(false);
  });

  it("returns false for a non-Bearer scheme", () => {
    expect(isAuthorized(reqWith(`Basic ${token}`), token)).toBe(false);
  });

  it("returns false for a wrong token of equal length", () => {
    const wrong = "x".repeat(token.length);
    expect(isAuthorized(reqWith(`Bearer ${wrong}`), token)).toBe(false);
  });

  it("returns false for a wrong token of different length", () => {
    expect(isAuthorized(reqWith("Bearer short"), token)).toBe(false);
  });

  it("returns true for the correct token", () => {
    expect(isAuthorized(reqWith(`Bearer ${token}`), token)).toBe(true);
  });
});
