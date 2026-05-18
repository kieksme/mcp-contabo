import { describe, expect, it } from "vitest";
import { formatToolResult } from "./response.js";

describe("formatToolResult", () => {
  it("returns JSON text and structured content for objects", () => {
    const result = formatToolResult({ data: [{ id: 1 }] });

    expect(result.content[0]?.type).toBe("text");
    expect(JSON.parse(result.content[0]!.text)).toEqual({ data: [{ id: 1 }] });
    expect(result.structuredContent).toEqual({ data: [{ id: 1 }] });
  });

  it("wraps non-object payloads in data key", () => {
    const result = formatToolResult([1, 2]);

    expect(result.structuredContent).toEqual({ data: [1, 2] });
  });

  it("redacts secret values in secret-like objects", () => {
    const result = formatToolResult({
      data: [
        {
          secretId: 1,
          name: "root",
          type: "password",
          value: "super-secret",
        },
      ],
    });

    const parsed = JSON.parse(result.content[0]!.text) as {
      data: Array<{ value: string }>;
    };
    expect(parsed.data[0]!.value).toBe("[REDACTED]");
  });

  it("does not redact unrelated value fields", () => {
    const result = formatToolResult({
      data: [{ displayName: "vm", value: "visible" }],
    });

    const parsed = JSON.parse(result.content[0]!.text) as {
      data: Array<{ value: string }>;
    };
    expect(parsed.data[0]!.value).toBe("visible");
  });
});
