import { describe, expect, it } from "vitest";
import { ContaboApiError } from "./errors.js";
import { formatToolError } from "./tool-errors.js";

describe("formatToolError", () => {
  it("structures ContaboApiError for agents", () => {
    const error = new ContaboApiError(
      404,
      "req-abc",
      "Contabo API error 404 Not Found\nx-request-id: req-abc",
    );

    const result = formatToolError(error);

    expect(result.isError).toBe(true);
    expect(result.structuredContent.error).toMatchObject({
      code: "CONTABO_API_ERROR",
      status: 404,
      xRequestId: "req-abc",
    });
    expect(result.content[0]?.text).toContain("404");
  });

  it("structures generic errors", () => {
    const result = formatToolError(new Error("boom"));

    expect(result.structuredContent.error.code).toBe("TOOL_ERROR");
    expect(result.content[0]?.text).toContain("boom");
    expect(result.structuredContent.error.hint).toContain("audit list tools");
  });
});
