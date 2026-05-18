export function formatToolResult(data: unknown): {
  content: Array<{ type: "text"; text: string }>;
  structuredContent: Record<string, unknown>;
} {
  const redacted = redactSecrets(data);
  const structured =
    redacted !== null &&
    typeof redacted === "object" &&
    !Array.isArray(redacted)
      ? (redacted as Record<string, unknown>)
      : { data: redacted };

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(redacted, null, 2),
      },
    ],
    structuredContent: structured,
  };
}

function redactSecrets(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data.map(redactSecrets);
  }
  if (data && typeof data === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (
        key === "value" &&
        (typeof value === "string" || value === null) &&
        isSecretContext(data as Record<string, unknown>)
      ) {
        result[key] = value === null ? null : "[REDACTED]";
      } else {
        result[key] = redactSecrets(value);
      }
    }
    return result;
  }
  return data;
}

function isSecretContext(obj: Record<string, unknown>): boolean {
  return (
    "secretId" in obj ||
    "type" in obj ||
    obj.type === "password" ||
    obj.type === "ssh"
  );
}
