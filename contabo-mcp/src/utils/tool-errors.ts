import { z } from "zod";
import { ContaboApiError } from "./errors.js";

export const toolErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  xRequestId: z.string().optional(),
  status: z.number().int().optional(),
  hint: z.string().optional(),
});

export type ToolErrorPayload = z.infer<typeof toolErrorSchema>;

const DEFAULT_HINT =
  "Use audit list tools (e.g. contabo_instances_audits_list) with x-request-id for more detail.";

export function formatToolError(error: unknown): {
  content: Array<{ type: "text"; text: string }>;
  structuredContent: { error: ToolErrorPayload };
  isError: true;
} {
  const payload = toToolErrorPayload(error);
  const text = [
    payload.message,
    payload.status != null ? `status: ${payload.status}` : null,
    payload.xRequestId ? `x-request-id: ${payload.xRequestId}` : null,
    payload.hint ? `hint: ${payload.hint}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    content: [{ type: "text", text }],
    structuredContent: { error: payload },
    isError: true,
  };
}

function toToolErrorPayload(error: unknown): ToolErrorPayload {
  if (error instanceof ContaboApiError) {
    return {
      code: "CONTABO_API_ERROR",
      message: error.message,
      xRequestId: error.requestId,
      status: error.status,
      hint: error.hint,
    };
  }

  if (error instanceof Error) {
    return {
      code: "TOOL_ERROR",
      message: error.message,
      hint: DEFAULT_HINT,
    };
  }

  return {
    code: "TOOL_ERROR",
    message: String(error),
    hint: DEFAULT_HINT,
  };
}
