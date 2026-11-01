import { useRef, useState } from "react";
import { confirmToolUse, streamChat, type SseEvent } from "../api/client.js";
import { ChatMessage, type ChatMessageData } from "./ChatMessage.js";

interface PendingConfirmation {
  toolUseId: string;
  toolName: string;
  input: unknown;
}

let nextId = 0;
function newId(): string {
  nextId += 1;
  return `msg-${nextId}`;
}

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingConfirmation[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const streamingTextRef = useRef("");

  function handleEvent(event: SseEvent) {
    switch (event.type) {
      case "text":
        streamingTextRef.current += event.text;
        setStreamingText(streamingTextRef.current);
        break;
      case "confirmation_required":
        setPending((prev) => [
          ...prev,
          { toolUseId: event.toolUseId, toolName: event.toolName, input: event.input },
        ]);
        break;
      case "awaiting_confirmation":
        setSending(false);
        break;
      case "done":
        finalizeAssistantMessage();
        setSending(false);
        break;
      case "error":
        finalizeAssistantMessage();
        setMessages((prev) => [...prev, { id: newId(), role: "error", text: event.message }]);
        setSending(false);
        break;
    }
  }

  function finalizeAssistantMessage() {
    if (streamingTextRef.current) {
      setMessages((prev) => [
        ...prev,
        { id: newId(), role: "assistant", text: streamingTextRef.current },
      ]);
    }
    streamingTextRef.current = "";
    setStreamingText(null);
  }

  async function handleSend() {
    const message = input.trim();
    if (!message || sending || pending.length > 0) {
      return;
    }
    setMessages((prev) => [...prev, { id: newId(), role: "user", text: message }]);
    setInput("");
    setSending(true);
    await streamChat(message, handleEvent);
  }

  async function handleConfirm(toolUseId: string, approved: boolean) {
    setPending((prev) => prev.filter((p) => p.toolUseId !== toolUseId));
    const stillPending = pending.some((p) => p.toolUseId !== toolUseId);
    if (!stillPending) {
      setSending(true);
    }
    await confirmToolUse(toolUseId, approved, handleEvent);
  }

  return (
    <div className="chat-panel">
      <div className="panel-header">
        <h2>Chat</h2>
      </div>
      <div className="chat-messages">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {streamingText !== null && (
          <ChatMessage message={{ id: "streaming", role: "assistant", text: streamingText }} />
        )}
        {pending.map((confirmation) => (
          <div key={confirmation.toolUseId} className="confirmation-card">
            <div>
              Aktion <code>{confirmation.toolName}</code> bestätigen?
            </div>
            <pre className="confirmation-input">{JSON.stringify(confirmation.input)}</pre>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => void handleConfirm(confirmation.toolUseId, false)}
              >
                Ablehnen
              </button>
              <button
                className="btn-danger"
                onClick={() => void handleConfirm(confirmation.toolUseId, true)}
              >
                Bestätigen
              </button>
            </div>
          </div>
        ))}
      </div>
      <form
        className="chat-input"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSend();
        }}
      >
        <input
          value={input}
          placeholder="z. B. „Wie ist der Status von kube-1?“"
          onChange={(e) => setInput(e.target.value)}
          disabled={sending || pending.length > 0}
        />
        <button type="submit" disabled={sending || pending.length > 0 || !input.trim()}>
          Senden
        </button>
      </form>
    </div>
  );
}
