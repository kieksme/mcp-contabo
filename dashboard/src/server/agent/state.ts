import type Anthropic from "@anthropic-ai/sdk";

export interface PendingToolUse {
  toolUseId: string;
  toolName: string;
  input: unknown;
}

/**
 * One assistant turn that produced at least one destructive tool_use block.
 * The loop stops here until every pending tool use has been approved or
 * denied via POST /api/chat/confirm — Claude requires a tool_result for
 * every tool_use block in the turn before the conversation can continue.
 */
export interface PendingTurn {
  assistantContent: Anthropic.ContentBlockParam[];
  /** Resolved tool_result blocks collected so far, keyed by tool_use id. */
  resolved: Map<string, Anthropic.ToolResultBlockParam>;
  /** tool_use ids still awaiting a human decision. */
  pendingIds: Set<string>;
}

interface AgentSession {
  history: Anthropic.MessageParam[];
  pending?: PendingTurn;
}

/**
 * Per-dashboard-session chat state: conversation history and any turn
 * paused on a destructive-action confirmation. Keyed by the same session id
 * as the auth cookie — one browser session, one chat.
 */
export class AgentSessionStore {
  private sessions = new Map<string, AgentSession>();

  private getOrCreate(sessionId: string): AgentSession {
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = { history: [] };
      this.sessions.set(sessionId, session);
    }
    return session;
  }

  history(sessionId: string): Anthropic.MessageParam[] {
    return this.getOrCreate(sessionId).history;
  }

  pending(sessionId: string): PendingTurn | undefined {
    return this.sessions.get(sessionId)?.pending;
  }

  setPending(sessionId: string, pending: PendingTurn | undefined): void {
    this.getOrCreate(sessionId).pending = pending;
  }

  reset(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
}
