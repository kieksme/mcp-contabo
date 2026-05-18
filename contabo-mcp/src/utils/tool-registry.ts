import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import type { ContaboClient } from "../client.js";
import { formatToolResult } from "./response.js";

type ZodShape = Record<string, z.ZodTypeAny>;

export function registerContaboTool(
  server: McpServer,
  client: ContaboClient,
  options: {
    name: string;
    description: string;
    inputSchema: ZodShape;
    annotations?: ToolAnnotations;
    handler: (args: Record<string, unknown>) => Promise<unknown>;
  },
): void {
  server.registerTool(
    options.name,
    {
      description: options.description,
      inputSchema: options.inputSchema,
      annotations: options.annotations,
    },
    async (args) => {
      try {
        const result = await options.handler(args as Record<string, unknown>);
        return formatToolResult(result);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: message }],
          isError: true,
        };
      }
    },
  );
}

export const bodyField = z
  .record(z.unknown())
  .optional()
  .describe("JSON request body (Contabo API fields)");
