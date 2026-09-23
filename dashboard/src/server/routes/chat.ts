import { Router, type Response } from "express";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  AgentLoop,
  findPendingToolUse,
  resolvePendingToolUse,
  type AgentEvent,
} from "../agent/loop.js";
import type { AgentSessionStore } from "../agent/state.js";
import { SESSION_COOKIE } from "../auth/auth-middleware.js";

function startSse(res: Response): void {
  res.writeHead(200, {
    "content-type": "text/event-stream",
    "cache-control": "no-cache",
    connection: "keep-alive",
  });
}

function writeSse(res: Response, event: AgentEvent): void {
  res.write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
}

async function pump(res: Response, events: AsyncGenerator<AgentEvent>): Promise<void> {
  for await (const event of events) {
    writeSse(res, event);
  }
  res.end();
}

export function createChatRouter(
  loop: AgentLoop,
  state: AgentSessionStore,
  mcpClient: Client,
): Router {
  const router = Router();

  router.post("/", async (req, res) => {
    const sessionId = req.signedCookies[SESSION_COOKIE] as string;
    const { message } = req.body as { message?: unknown };
    if (typeof message !== "string" || !message.trim()) {
      res.status(400).json({ error: "message is required" });
      return;
    }

    startSse(res);
    await pump(res, loop.start(sessionId, message));
  });

  router.post("/confirm", async (req, res) => {
    const sessionId = req.signedCookies[SESSION_COOKIE] as string;
    const { toolUseId, approved } = req.body as {
      toolUseId?: unknown;
      approved?: unknown;
    };
    if (typeof toolUseId !== "string" || typeof approved !== "boolean") {
      res.status(400).json({ error: "toolUseId and approved are required" });
      return;
    }

    const pending = state.pending(sessionId);
    const toolUse = pending ? findPendingToolUse(pending, toolUseId) : undefined;
    if (!pending || !pending.pendingIds.has(toolUseId) || !toolUse) {
      res.status(404).json({ error: "no such pending confirmation" });
      return;
    }

    if (approved) {
      try {
        const result = await mcpClient.callTool({
          name: toolUse.toolName,
          arguments: toolUse.input as Record<string, unknown>,
        });
        resolvePendingToolUse(pending, toolUseId, {
          type: "tool_result",
          tool_use_id: toolUseId,
          content: JSON.stringify(result.structuredContent ?? result.content),
          is_error: result.isError === true,
        });
      } catch (error) {
        resolvePendingToolUse(pending, toolUseId, {
          type: "tool_result",
          tool_use_id: toolUseId,
          is_error: true,
          content: error instanceof Error ? error.message : String(error),
        });
      }
    } else {
      resolvePendingToolUse(pending, toolUseId, {
        type: "tool_result",
        tool_use_id: toolUseId,
        is_error: true,
        content: "Der Nutzer hat diese Aktion abgelehnt.",
      });
    }

    if (pending.pendingIds.size > 0) {
      res.json({ ok: true, remainingPending: Array.from(pending.pendingIds) });
      return;
    }

    startSse(res);
    await pump(res, loop.resume(sessionId));
  });

  return router;
}
