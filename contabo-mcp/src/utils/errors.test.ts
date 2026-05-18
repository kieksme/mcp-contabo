import { describe, expect, it } from "vitest";
import { contaboErrorMessage } from "./errors.js";

describe("contaboErrorMessage", () => {
  it("formats JSON error bodies with request id", async () => {
    const response = new Response(
      JSON.stringify({
        message: "Not found",
        statusCode: 404,
        data: { id: 99 },
      }),
      { status: 404, statusText: "Not Found" },
    );

    const message = await contaboErrorMessage(response, "req-123");

    expect(message).toContain("404");
    expect(message).toContain("x-request-id: req-123");
    expect(message).toContain("Not found");
    expect(message).toContain("contabo_instances_audits_list");
  });

  it("includes plain text bodies when JSON parsing fails", async () => {
    const response = new Response("upstream error", {
      status: 502,
      statusText: "Bad Gateway",
    });

    const message = await contaboErrorMessage(response, "req-456");

    expect(message).toContain("502");
    expect(message).toContain("upstream error");
  });
});
