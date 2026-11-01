export interface ChatMessageData {
  id: string;
  role: "user" | "assistant" | "error";
  text: string;
}

export function ChatMessage({ message }: { message: ChatMessageData }) {
  return (
    <div className={`chat-message chat-message-${message.role}`}>
      <div className="chat-message-bubble">{message.text}</div>
    </div>
  );
}
