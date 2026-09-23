import Anthropic from "@anthropic-ai/sdk";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { toClaudeTools, type ToolCatalog } from "../mcp/tool-catalog.js";
import type { AgentSessionStore, PendingTurn } from "./state.js";

export type AgentEvent =
  | { type: "text"; text: string }
  | { type: "confirmation_required"; toolUseId: string; toolName: string; input: unknown }
  | { type: "awaiting_confirmation" }
  | { type: "done" }
  | { type: "error"; message: string };

export interface AgentLoopOptions {
  anthropic: Anthropic;
  mcpClient: Client;
  catalog: ToolCatalog;
  model: string;
  toolPrefixes: string[];
  state: AgentSessionStore;
}

function findToolUseBlock(
  content: Anthropic.ContentBlockParam[],
  toolUseId: string,
): Anthropic.ToolUseBlockParam | undefined {
  return content.find(
    (block): block is Anthropic.ToolUseBlockParam =>
      block.type === "tool_use" && block.id === toolUseId,
  );
}

/** Orders resolved tool_result blocks to match the assistant turn's tool_use order. */
function buildToolResultMessage(pending: PendingTurn): Anthropic.MessageParam {
  const toolUseOrder = pending.assistantContent
    .filter((b): b is Anthropic.ToolUseBlockParam => b.type === "tool_use")
    .map((b) => b.id);
  const content = toolUseOrder
    .map((id) => pending.resolved.get(id))
    .filter((block): block is Anthropic.ToolResultBlockParam => block !== undefined);
  return { role: "user", content };
}

export class AgentLoop {
  constructor(private readonly options: AgentLoopOptions) {}

  /** Runs a fresh user turn to completion (or until a confirmation is needed). */
  async *start(sessionId: string, userMessage: string): AsyncGenerator<AgentEvent> {
    this.options.state.history(sessionId).push({ role: "user", content: userMessage });
    yield* this.continueLoop(sessionId);
  }

  /**
   * Called once every pending tool use for the current turn has been
   * approved/denied — pushes the collected tool_results and resumes.
   */
  async *resume(sessionId: string): AsyncGenerator<AgentEvent> {
    const pending = this.options.state.pending(sessionId);
    if (!pending) {
      yield { type: "error", message: "no pending turn to resume" };
      return;
    }
    this.options.state.history(sessionId).push(buildToolResultMessage(pending));
    this.options.state.setPending(sessionId, undefined);
    yield* this.continueLoop(sessionId);
  }

  private async *continueLoop(sessionId: string): AsyncGenerator<AgentEvent> {
    const { anthropic, mcpClient, catalog, model, toolPrefixes, state } = this.options;
    const tools = toClaudeTools(catalog.filterByPrefixes(toolPrefixes));

    // A turn may span several model round-trips (pause_turn, or several
    // rounds of non-destructive tool calls) before it either finishes or
    // stops on a destructive confirmation.
    while (true) {
      const stream = anthropic.messages.stream({
        model,
        max_tokens: 4096,
        thinking: { type: "adaptive" },
        output_config: { effort: "low" },
        tools,
        messages: state.history(sessionId),
      });

      let message: Anthropic.Message;
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            yield { type: "text", text: event.delta.text };
          }
        }
        message = await stream.finalMessage();
      } catch (error) {
        yield { type: "error", message: error instanceof Error ? error.message : String(error) };
        return;
      }

      if (message.stop_reason === "refusal") {
        state.history(sessionId).push({ role: "assistant", content: message.content });
        yield { type: "error", message: "Anfrage wurde aus Sicherheitsgründen abgelehnt." };
        return;
      }

      state.history(sessionId).push({ role: "assistant", content: message.content });

      if (message.stop_reason === "pause_turn") {
        continue;
      }

      const toolUseBlocks = message.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
      );
      if (toolUseBlocks.length === 0) {
        yield { type: "done" };
        return;
      }

      const resolved = new Map<string, Anthropic.ToolResultBlockParam>();
      const pendingIds = new Set<string>();

      for (const tool of toolUseBlocks) {
        if (catalog.isDestructive(tool.name)) {
          pendingIds.add(tool.id);
          yield {
            type: "confirmation_required",
            toolUseId: tool.id,
            toolName: tool.name,
            input: tool.input,
          };
          continue;
        }

        try {
          const result = await mcpClient.callTool({
            name: tool.name,
            arguments: tool.input as Record<string, unknown>,
          });
          resolved.set(tool.id, {
            type: "tool_result",
            tool_use_id: tool.id,
            content: JSON.stringify(result.structuredContent ?? result.content),
            is_error: result.isError === true,
          });
        } catch (error) {
          resolved.set(tool.id, {
            type: "tool_result",
            tool_use_id: tool.id,
            is_error: true,
            content: error instanceof Error ? error.message : String(error),
          });
        }
      }

      if (pendingIds.size > 0) {
        state.setPending(sessionId, {
          assistantContent: message.content as Anthropic.ContentBlockParam[],
          resolved,
          pendingIds,
        });
        yield { type: "awaiting_confirmation" };
        return;
      }

      state.history(sessionId).push({ role: "user", content: Array.from(resolved.values()) });
    }
  }
}

/** Resolves a specific pending tool_use with a human decision, mutating the pending turn in place. */
export function resolvePendingToolUse(
  pending: PendingTurn,
  toolUseId: string,
  result: Anthropic.ToolResultBlockParam,
): void {
  pending.resolved.set(toolUseId, result);
  pending.pendingIds.delete(toolUseId);
}

export function findPendingToolUse(
  pending: PendingTurn,
  toolUseId: string,
): { toolName: string; input: unknown } | undefined {
  const block = findToolUseBlock(pending.assistantContent, toolUseId);
  return block ? { toolName: block.name, input: block.input } : undefined;
}
