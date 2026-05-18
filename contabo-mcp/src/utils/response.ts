const SENSITIVE_VALUE_KEYS = new Set([
  "value",
  "accessKey",
  "secretKey",
  "secret",
  "password",
  "key",
  "s3AccessKey",
  "s3SecretKey",
  "accessKeyId",
  "secretAccessKey",
  "rootPassword",
  "authCode",
]);

export function formatToolResult(data: unknown): {
  content: Array<{ type: "text"; text: string }>;
  structuredContent: Record<string, unknown>;
} {
  const redacted = redactSensitiveFields(data);
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

function redactSensitiveFields(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data.map(redactSensitiveFields);
  }
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (shouldRedactKey(key, obj)) {
        result[key] =
          value === null || value === undefined ? value : "[REDACTED]";
      } else {
        result[key] = redactSensitiveFields(value);
      }
    }
    return result;
  }
  return data;
}

function shouldRedactKey(key: string, obj: Record<string, unknown>): boolean {
  if (!SENSITIVE_VALUE_KEYS.has(key)) {
    return false;
  }
  if (key === "value") {
    return isSecretContext(obj);
  }
  if (key === "key" || key === "password") {
    return isCredentialContext(obj) || isSecretContext(obj);
  }
  if (key === "rootPassword" || key === "authCode") {
    return true;
  }
  return isCredentialContext(obj) || isSecretContext(obj);
}

function isSecretContext(obj: Record<string, unknown>): boolean {
  return (
    "secretId" in obj ||
    obj.type === "password" ||
    obj.type === "ssh"
  );
}

function isCredentialContext(obj: Record<string, unknown>): boolean {
  return (
    "credentialId" in obj ||
    "objectStorageId" in obj ||
    "accessKey" in obj ||
    "secretKey" in obj ||
    "s3AccessKey" in obj ||
    "s3SecretKey" in obj
  );
}
