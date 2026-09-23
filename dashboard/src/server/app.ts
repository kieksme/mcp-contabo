import path from "node:path";
import { fileURLToPath } from "node:url";
import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import Anthropic from "@anthropic-ai/sdk";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { DashboardConfig } from "./config.js";
import { SessionStore } from "./auth/session-store.js";
import { requireSession } from "./auth/auth-middleware.js";
import { ToolCatalog } from "./mcp/tool-catalog.js";
import { AgentLoop } from "./agent/loop.js";
import { AgentSessionStore } from "./agent/state.js";
import { createHealthRouter } from "./routes/health.js";
import { createAuthRouter } from "./routes/auth.js";
import { createInstancesRouter } from "./routes/instances.js";
import { createChatRouter } from "./routes/chat.js";

const here = path.dirname(fileURLToPath(import.meta.url));
// Built by `vite build` (see vite.config.ts: build.outDir = ../../dist/web),
// which lands as a sibling of this compiled file's own dist/server output.
const STATIC_DIR = path.join(here, "..", "web");

export async function createApp(
  config: DashboardConfig,
  mcpClient: Client,
): Promise<Express> {
  const catalog = await ToolCatalog.load(mcpClient);
  const anthropic = new Anthropic({ apiKey: config.anthropicApiKey });
  const agentState = new AgentSessionStore();
  const agentLoop = new AgentLoop({
    anthropic,
    mcpClient,
    catalog,
    model: config.agentModel,
    toolPrefixes: config.agentToolPrefixes,
    state: agentState,
  });
  const sessionStore = new SessionStore();

  const app = express();
  app.use(express.json());
  app.use(cookieParser(config.sessionSecret));

  app.use("/health", createHealthRouter());
  app.use("/api/auth", createAuthRouter(sessionStore, config.authToken));

  app.use("/api", requireSession(sessionStore));
  app.use("/api/instances", createInstancesRouter(mcpClient, catalog));
  app.use("/api/chat", createChatRouter(agentLoop, agentState, mcpClient));

  // Static SPA shell — public. It carries no secrets; the frontend decides
  // whether to show the login form or the dashboard via GET /api/auth/session.
  app.use(express.static(STATIC_DIR));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(STATIC_DIR, "index.html"));
  });

  return app;
}
