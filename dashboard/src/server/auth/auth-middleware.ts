import { timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import type { SessionStore } from "./session-store.js";

export const SESSION_COOKIE = "dashboard_session";

/**
 * Constant-time comparison of the login form's shared secret against the
 * expected token — same approach as contabo-mcp's transports/auth-middleware.ts
 * `isAuthorized()`, adapted from a Bearer header to a login-form field.
 */
export function isValidToken(presentedToken: unknown, expectedToken: string): boolean {
  if (typeof presentedToken !== "string" || !presentedToken || !expectedToken) {
    return false;
  }
  const presented = Buffer.from(presentedToken);
  const expected = Buffer.from(expectedToken);
  if (presented.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(presented, expected);
}

/**
 * Gates an API route group behind a valid signed session cookie. Mounted
 * only under /api/* (see app.ts) — the static SPA shell itself is served
 * unauthenticated, since it carries no secrets; the frontend calls
 * GET /api/auth/session on load to decide whether to render the login form.
 */
export function requireSession(store: SessionStore) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const sessionId = req.signedCookies[SESSION_COOKIE] as string | undefined;
    if (store.isValid(sessionId)) {
      next();
      return;
    }
    res.status(401).json({ error: "unauthorized" });
  };
}
