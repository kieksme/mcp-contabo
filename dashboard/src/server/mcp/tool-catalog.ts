import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type Anthropic from "@anthropic-ai/sdk";

export interface McpToolInfo {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  destructive: boolean;
}

/**
 * Caches the MCP server's tool list (it never changes at runtime — tools are
 * registered once at server construction) and exposes the two things callers
 * actually need: a destructive-action check shared by the REST routes and the
 * chat agent, and a prefix filter for the chat agent's curated tool scope.
 */
export class ToolCatalog {
  private tools: McpToolInfo[] = [];

  private constructor() {}

  static async load(client: Client): Promise<ToolCatalog> {
    const catalog = new ToolCatalog();
    const { tools } = await client.listTools();
    catalog.tools = tools.map((tool) => ({
      name: tool.name,
      description: tool.description ?? "",
      // MCP's inputSchema is already plain JSON Schema — same shape Claude's
      // tool `input_schema` expects, no conversion needed.
      inputSchema: tool.inputSchema as Record<string, unknown>,
      destructive: tool.annotations?.destructiveHint === true,
    }));
    return catalog;
  }

  all(): McpToolInfo[] {
    return this.tools;
  }

  get(name: string): McpToolInfo | undefined {
    return this.tools.find((tool) => tool.name === name);
  }

  isDestructive(name: string): boolean {
    return this.get(name)?.destructive ?? false;
  }

  filterByPrefixes(prefixes: string[]): McpToolInfo[] {
    return this.tools.filter((tool) =>
      prefixes.some((prefix) => tool.name.startsWith(prefix)),
    );
  }
}

/** Converts a curated MCP tool list into Claude Messages API tool definitions. */
export function toClaudeTools(tools: McpToolInfo[]): Anthropic.Tool[] {
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    input_schema: tool.inputSchema as Anthropic.Tool["input_schema"],
  }));
}
