import { Router } from "express";
import type { SessionStore } from "../auth/session-store.js";
import { isValidToken, SESSION_COOKIE } from "../auth/auth-middleware.js";
import type { AgentSessionStore } from "../agent/state.js";

export function createAuthRouter(
  store: SessionStore,
  authToken: string,
  agentState: AgentSessionStore,
): Router {
  const router = Router();

  // Public — the frontend calls this on load to decide whether to render
  // the login form or the dashboard, since the static shell itself is served
  // unauthenticated (no secrets in it).
  router.get("/session", (req, res) => {
    const sessionId = req.signedCookies[SESSION_COOKIE] as string | undefined;
    res.json({ authenticated: store.isValid(sessionId) });
  });

  router.post("/login", (req, res) => {
    const { token } = req.body as { token?: unknown };
    if (!isValidToken(token, authToken)) {
      res.status(401).json({ error: "invalid_token" });
      return;
    }

    const sessionId = store.create();
    res.cookie(SESSION_COOKIE, sessionId, {
      signed: true,
      httpOnly: true,
      // req.secure reflects the real client protocol once "trust proxy" is
      // set (app.ts) — e.g. behind Railway's TLS-terminating proxy. The
      // NODE_ENV fallback covers running the built server directly without
      // a fronting proxy (the Docker image bakes NODE_ENV=production).
      secure: req.secure || process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 12 * 60 * 60 * 1000,
    });
    res.json({ ok: true });
  });

  router.post("/logout", (req, res) => {
    const sessionId = req.signedCookies[SESSION_COOKIE] as string | undefined;
    store.destroy(sessionId);
    if (sessionId) {
      agentState.reset(sessionId);
    }
    res.clearCookie(SESSION_COOKIE);
    res.json({ ok: true });
  });

  return router;
}
