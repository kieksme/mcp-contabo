import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import type Anthropic from "@anthropic-ai/sdk";
import type { Client } from "@modelcontextprotocol/client";
import { ToolCatalog } from "../mcp/tool-catalog.js";
import { AgentLoop } from "../agent/loop.js";
import { AgentSessionStore } from "../agent/state.js";
import { createChatRouter } from "./chat.js";
import { SESSION_COOKIE } from "../auth/auth-middleware.js";

const TOOLS = [
  {
    name: "contabo_instances_stop",
    description: "Hard power off",
    inputSchema: { type: "object", properties: { instanceId: { type: "number" } } },
    annotations: { destructiveHint: true },
  },
];

/** Builds a fake `client.messages.stream()` result: async-iterable + finalMessage(). */
function fakeStream(finalMessage: Partial<Anthropic.Message>) {
  return {
    [Symbol.asyncIterator]: async function* () {
      // no text deltas needed for these tests
    },
    finalMessage: async () => finalMessage as Anthropic.Message,
  };
}

async function buildApp(callTool: ReturnType<typeof vi.fn>, streamImpl: ReturnType<typeof vi.fn>) {
  const mcpClient = { listTools: async () => ({ tools: TOOLS }), callTool } as unknown as Client;
  const catalog = await ToolCatalog.load(mcpClient);
  const anthropic = { messages: { stream: streamImpl } } as unknown as Anthropic;
  const state = new AgentSessionStore();
  const loop = new AgentLoop({
    anthropic,
    mcpClient,
    catalog,
    model: "claude-sonnet-5",
    toolPrefixes: ["contabo_instances_"],
    state,
  });

  const app = express();
  app.use(express.json());
  // A fake signed-cookie reader standing in for cookie-parser + the real
  // session middleware (out of scope here) — fixes every request to one
  // session id, which is all these tests need.
  app.use((req, _res, next) => {
    (req as unknown as { signedCookies: Record<string, string> }).signedCookies = {
      [SESSION_COOKIE]: "s1",
    };
    next();
  });
  app.use("/api/chat", createChatRouter(loop, state, mcpClient));
  return { app, state };
}

describe("chat routes", () => {
  it("POST /api/chat rejects a new message while a confirmation is pending", async () => {
    const callTool = vi.fn();
    const stream = vi.fn();
    const { app, state } = await buildApp(callTool, stream);
    state.setPending("s1", {
      assistantContent: [
        { type: "tool_use", id: "tool_1", name: "contabo_instances_stop", input: { instanceId: 1 } },
      ],
      resolved: new Map(),
      pendingIds: new Set(["tool_1"]),
    });

    const res = await request(app).post("/api/chat").send({ message: "Stoppe noch einen" });

    expect(res.status).toBe(409);
    expect(stream).not.toHaveBeenCalled();
  });

  it("POST /api/chat/confirm executes the destructive tool exactly once under concurrent duplicate requests", async () => {
    let resolveCallTool: (value: unknown) => void = () => {};
    const callTool = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCallTool = resolve;
        }),
    );
    const stream = vi.fn().mockReturnValue(
      fakeStream({ stop_reason: "end_turn", content: [{ type: "text", text: "Erledigt." }] }),
    );
    const { app, state } = await buildApp(callTool, stream);
    state.setPending("s1", {
      assistantContent: [
        { type: "tool_use", id: "tool_1", name: "contabo_instances_stop", input: { instanceId: 1 } },
      ],
      resolved: new Map(),
      pendingIds: new Set(["tool_1"]),
    });

    const [first, second] = await Promise.all([
      request(app).post("/api/chat/confirm").send({ toolUseId: "tool_1", approved: true }),
      request(app).post("/api/chat/confirm").send({ toolUseId: "tool_1", approved: true }),
      // Let both requests reach the claim check before the tool call settles.
      new Promise((r) => setTimeout(r, 10)).then(() => resolveCallTool({ isError: false, structuredContent: {} })),
    ]);

    const statuses = [first.status, second.status].sort();
    expect(statuses).toEqual([200, 404]);
    expect(callTool).toHaveBeenCalledTimes(1);
  });
});
