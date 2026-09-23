export interface InstanceDto {
  id: number;
  name: string;
  displayName: string;
  status: string;
  ipv4: string | null;
  hostSystem: string | null;
  defaultUser: string | null;
  productType: string | null;
}

export type SseEvent =
  | { type: "text"; text: string }
  | { type: "confirmation_required"; toolUseId: string; toolName: string; input: unknown }
  | { type: "awaiting_confirmation" }
  | { type: "done" }
  | { type: "error"; message: string };

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function getSession(): Promise<{ authenticated: boolean }> {
  return json(await fetch("/api/auth/session"));
}

export async function login(token: string): Promise<void> {
  await json(
    await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token }),
    }),
  );
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

export async function listInstances(): Promise<InstanceDto[]> {
  const data = await json<{ instances: InstanceDto[] }>(await fetch("/api/instances"));
  return data.instances;
}

export async function performAction(
  id: number,
  action: "start" | "stop" | "restart" | "shutdown",
  confirmed: boolean,
): Promise<void> {
  const res = await fetch(`/api/instances/${id}/actions/${action}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ confirmed }),
  });
  if (res.status === 428) {
    throw new ConfirmationRequiredError();
  }
  await json(res);
}

export class ConfirmationRequiredError extends Error {
  constructor() {
    super("confirmation_required");
  }
}

/** Parses a `text/event-stream` response body into individual SSE events. */
async function readSse(res: Response, onEvent: (event: SseEvent) => void): Promise<void> {
  const reader = res.body?.getReader();
  if (!reader) {
    return;
  }
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });

    let separatorIndex: number;
    while ((separatorIndex = buffer.indexOf("\n\n")) !== -1) {
      const rawEvent = buffer.slice(0, separatorIndex);
      buffer = buffer.slice(separatorIndex + 2);

      const dataLine = rawEvent
        .split("\n")
        .find((line) => line.startsWith("data: "));
      if (dataLine) {
        onEvent(JSON.parse(dataLine.slice("data: ".length)) as SseEvent);
      }
    }
  }
}

export async function streamChat(
  message: string,
  onEvent: (event: SseEvent) => void,
): Promise<void> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    onEvent({ type: "error", message: body.error ?? `HTTP ${res.status}` });
    return;
  }
  await readSse(res, onEvent);
}

/**
 * Resolves a pending confirmation. If other confirmations from the same turn
 * are still pending, the server responds with plain JSON instead of
 * resuming the stream — the caller only gets further events once every
 * pending tool use in the turn has been resolved.
 */
export async function confirmToolUse(
  toolUseId: string,
  approved: boolean,
  onEvent: (event: SseEvent) => void,
): Promise<void> {
  const res = await fetch("/api/chat/confirm", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ toolUseId, approved }),
  });
  if (res.headers.get("content-type")?.includes("text/event-stream")) {
    await readSse(res, onEvent);
    return;
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    onEvent({ type: "error", message: body.error ?? `HTTP ${res.status}` });
  }
}
