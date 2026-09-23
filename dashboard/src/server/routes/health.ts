import { Router } from "express";

/** Unauthenticated liveness probe — mirrors contabo-mcp's GET /health. */
export function createHealthRouter(): Router {
  const router = Router();
  router.get("/", (_req, res) => {
    res.json({ status: "ok" });
  });
  return router;
}
