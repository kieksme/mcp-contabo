# Contabo MCP

[![CI](https://github.com/kieksme/mcp-contabo/actions/workflows/ci.yml/badge.svg)](https://github.com/kieksme/mcp-contabo/actions/workflows/ci.yml)

MCP server for the [Contabo](https://contabo.com/) cloud API — virtual machines, snapshots, object storage, secrets, and domains.

## Quick start

```bash
npx -y contabo-mcp
```

GitHub Release: [1.0.1](https://github.com/kieksme/mcp-contabo/releases/tag/1.0.1) · npm: [`contabo-mcp`](https://www.npmjs.com/package/contabo-mcp) — **not published yet** (see [first publish](contabo-mcp/README.md#first-publish-package-not-on-npm-yet) in package README)

Set `CONTABO_CLIENT_ID`, `CONTABO_CLIENT_SECRET`, `CONTABO_API_USER`, and `CONTABO_API_PASSWORD` in your environment or MCP client config.

**Cursor** (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "contabo": {
      "command": "npx",
      "args": ["-y", "contabo-mcp"],
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

See [`contabo-mcp/README.md`](contabo-mcp/README.md) for the full tool list, GitHub install, and development setup.
