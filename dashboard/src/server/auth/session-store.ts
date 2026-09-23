import { randomUUID } from "node:crypto";

const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12h — a single-operator tool, not a public multi-user app.

interface Session {
  expiresAt: number;
}

/** In-memory session store. Single-operator tool: no external store needed. */
export class SessionStore {
  private sessions = new Map<string, Session>();

  create(): string {
    const id = randomUUID();
    this.sessions.set(id, { expiresAt: Date.now() + SESSION_TTL_MS });
    return id;
  }

  isValid(id: string | undefined): boolean {
    if (!id) {
      return false;
    }
    const session = this.sessions.get(id);
    if (!session) {
      return false;
    }
    if (session.expiresAt < Date.now()) {
      this.sessions.delete(id);
      return false;
    }
    return true;
  }

  destroy(id: string | undefined): void {
    if (id) {
      this.sessions.delete(id);
    }
  }
}
