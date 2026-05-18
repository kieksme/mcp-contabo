# Contabo MCP

[![CI](https://github.com/kieksme/mcp-contabo/actions/workflows/ci.yml/badge.svg)](https://github.com/kieksme/mcp-contabo/actions/workflows/ci.yml)

MCP server for the [Contabo](https://contabo.com/) cloud API — virtual machines, snapshots, object storage, secrets, and domains.

Manage Contabo VPS/VDS instances, snapshots, S3-compatible object storage, secrets, and domains from Cursor, Claude Desktop, or any MCP client. Published on npm as [`@kieksme/contabo-mcp`](https://www.npmjs.com/package/@kieksme/contabo-mcp).

## Quick start

```bash
npx -y @kieksme/contabo-mcp
```

npm: [`@kieksme/contabo-mcp`](https://www.npmjs.com/package/@kieksme/contabo-mcp) · [Releases](https://github.com/kieksme/mcp-contabo/releases)

Set `CONTABO_CLIENT_ID`, `CONTABO_CLIENT_SECRET`, `CONTABO_API_USER`, and `CONTABO_API_PASSWORD` in your environment or MCP client config. How to get them from the [Contabo API details page](https://my.contabo.com/api/details): see [Obtaining API credentials](contabo-mcp/README.md#obtaining-api-credentials) in the package README.

**Cursor** (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "contabo": {
      "command": "npx",
      "args": ["-y", "@kieksme/contabo-mcp"],
      "env": {
        "CONTABO_CLIENT_ID": "...",
        "CONTABO_CLIENT_SECRET": "...",
        "CONTABO_API_USER": "...",
        "CONTABO_API_PASSWORD": "..."
      }
    }
  }
}
```

See [`contabo-mcp/README.md`](contabo-mcp/README.md) for the full tool list and install options. To develop or release, see [CONTRIBUTING.md](CONTRIBUTING.md). Releases on `main` are proposed by [release-please](https://github.com/googleapis/release-please) via pull request.

## MCP Market

List this server on [MCP Market](https://mcpmarket.com) so others can discover it when searching for Contabo or cloud hosting tools.

1. Open **[Submit an MCP Server](https://mcpmarket.com/submit)**.
2. Choose **MCP Server** (not Agent Skill).
3. Paste the repository URL: `https://github.com/kieksme/mcp-contabo`
4. Submit and wait for review.

After approval, the listing appears in [MCP Market search](https://mcpmarket.com/search?q=contabo).
