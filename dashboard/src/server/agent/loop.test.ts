import { describe, expect, it, vi } from "vitest";
import type Anthropic from "@anthropic-ai/sdk";
import type { Client } from "@modelcontextprotocol/client";
import { ToolCatalog } from "../mcp/tool-catalog.js";
import { AgentLoop, type AgentEvent } from "./loop.js";
import { AgentSessionStore } from "./state.js";

const TOOLS = [
  {
    name: "contabo_instances_start",
    description: "Power on",
    inputSchema: { type: "object", properties: { instanceId: { type: "number" } } },
    annotations: { destructiveHint: false },
  },
  {
    name: "contabo_instances_stop",
    description: "Hard power off",
    inputSchema: { type: "object", properties: { instanceId: { type: "number" } } },
    annotations: { destructiveHint: true },
  },
  {
    name: "contabo_secrets_list",
    description: "List secrets",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true },
  },
];

function fakeMcpClient(callTool: ReturnType<typeof vi.fn>): Client {
  return {
    listTools: async () => ({ tools: TOOLS }),
    callTool,
  } as unknown as Client;
}

/** Builds a fake `client.messages.stream()` result: async-iterable + finalMessage(). */
function fakeStream(
  deltaEvents: Array<{ type: string; delta?: { type: string; text: string } }>,
  finalMessage: Partial<Anthropic.Message>,
) {
  return {
    [Symbol.asyncIterator]: async function* () {
      for (const event of deltaEvents) {
        yield event;
      }
    },
    finalMessage: async () => finalMessage as Anthropic.Message,
  };
}

function textDelta(text: string) {
  return { type: "content_block_delta", delta: { type: "text_delta", text } };
}

async function collect(gen: AsyncGenerator<AgentEvent>): Promise<AgentEvent[]> {
  const events: AgentEvent[] = [];
  for await (const event of gen) {
    events.push(event);
  }
  return events;
}

async function buildLoop(streamImpl: ReturnType<typeof vi.fn>, callTool: ReturnType<typeof vi.fn>) {
  const mcpClient = fakeMcpClient(callTool);
  const catalog = await ToolCatalog.load(mcpClient);
  const anthropic = { messages: { stream: streamImpl } } as unknown as Anthropic;
  const state = new AgentSessionStore();
  return {
    loop: new AgentLoop({
      anthropic,
      mcpClient,
      catalog,
      model: "claude-sonnet-5",
      toolPrefixes: ["contabo_instances_"],
      state,
    }),
    state,
  };
}

describe("AgentLoop", () => {
  it("streams plain text and finishes on end_turn", async () => {
    const stream = vi.fn().mockReturnValue(
      fakeStream([textDelta("Hallo!")], {
        stop_reason: "end_turn",
        content: [{ type: "text", text: "Hallo!" }],
      }),
    );
    const callTool = vi.fn();
    const { loop } = await buildLoop(stream, callTool);

    const events = await collect(loop.start("s1", "Wie geht's?"));

    expect(events).toEqual([{ type: "text", text: "Hallo!" }, { type: "done" }]);
    expect(callTool).not.toHaveBeenCalled();
  });

  it("executes a non-destructive tool call immediately and continues the loop", async () => {
    const stream = vi
      .fn()
      .mockReturnValueOnce(
        fakeStream([], {
          stop_reason: "tool_use",
          content: [
            {
              type: "tool_use",
              id: "tool_1",
              name: "contabo_instances_start",
              input: { instanceId: 42 },
            },
          ],
        }),
      )
      .mockReturnValueOnce(
        fakeStream([textDelta("Gestartet.")], {
          stop_reason: "end_turn",
          content: [{ type: "text", text: "Gestartet." }],
        }),
      );
    const callTool = vi.fn().mockResolvedValue({ isError: false, structuredContent: { ok: true } });
    const { loop } = await buildLoop(stream, callTool);

    const events = await collect(loop.start("s1", "Starte 42"));

    expect(callTool).toHaveBeenCalledWith({
      name: "contabo_instances_start",
      arguments: { instanceId: 42 },
    });
    expect(events).toEqual([{ type: "text", text: "Gestartet." }, { type: "done" }]);
    expect(stream).toHaveBeenCalledTimes(2);
  });

  it("pauses on a destructive tool call instead of executing it", async () => {
    const stream = vi.fn().mockReturnValue(
      fakeStream([], {
        stop_reason: "tool_use",
        content: [
          {
            type: "tool_use",
            id: "tool_stop_1",
            name: "contabo_instances_stop",
            input: { instanceId: 42 },
          },
        ],
      }),
    );
    const callTool = vi.fn();
    const { loop, state } = await buildLoop(stream, callTool);

    const events = await collect(loop.start("s1", "Stoppe 42"));

    expect(callTool).not.toHaveBeenCalled();
    expect(events).toEqual([
      {
        type: "confirmation_required",
        toolUseId: "tool_stop_1",
        toolName: "contabo_instances_stop",
        input: { instanceId: 42 },
      },
      { type: "awaiting_confirmation" },
    ]);
    expect(state.pending("s1")?.pendingIds.has("tool_stop_1")).toBe(true);
  });

  it("refuses to execute a tool outside the configured prefix allowlist, even though it exists on the MCP server", async () => {
    // Model is untrusted input: this must be rejected even though the tool
    // is real (listed by the fake MCP client) — only the advertised `tools`
    // array is prefix-filtered, so execution needs its own check too.
    const stream = vi
      .fn()
      .mockReturnValueOnce(
        fakeStream([], {
          stop_reason: "tool_use",
          content: [{ type: "tool_use", id: "tool_oos", name: "contabo_secrets_list", input: {} }],
        }),
      )
      .mockReturnValueOnce(
        fakeStream([textDelta("Das kann ich nicht.")], {
          stop_reason: "end_turn",
          content: [{ type: "text", text: "Das kann ich nicht." }],
        }),
      );
    const callTool = vi.fn();
    const { loop } = await buildLoop(stream, callTool);

    const events = await collect(loop.start("s1", "Zeig mir die Secrets"));

    expect(callTool).not.toHaveBeenCalled();
    expect(events).toEqual([{ type: "text", text: "Das kann ich nicht." }, { type: "done" }]);
  });

  it("resumes and finishes once a pending confirmation has been resolved", async () => {
    const stream = vi.fn().mockReturnValue(
      fakeStream([textDelta("Erledigt.")], {
        stop_reason: "end_turn",
        content: [{ type: "text", text: "Erledigt." }],
      }),
    );
    const callTool = vi.fn();
    const { loop, state } = await buildLoop(stream, callTool);

    // Simulate the state left behind by a paused turn, with the confirmation
    // already resolved (as routes/chat.ts would have done after the human
    // approved it and the tool actually ran).
    state.history("s1").push({ role: "user", content: "Stoppe 42" });
    state.setPending("s1", {
      assistantContent: [
        { type: "tool_use", id: "tool_stop_1", name: "contabo_instances_stop", input: { instanceId: 42 } },
      ],
      resolved: new Map([
        [
          "tool_stop_1",
          { type: "tool_result", tool_use_id: "tool_stop_1", content: "{}" },
        ],
      ]),
      pendingIds: new Set(),
    });

    const events = await collect(loop.resume("s1"));

    expect(events).toEqual([{ type: "text", text: "Erledigt." }, { type: "done" }]);
    expect(state.pending("s1")).toBeUndefined();
  });
});
