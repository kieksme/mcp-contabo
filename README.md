# Contabo MCP

[![CI](https://github.com/kieksme/mcp-contabo/actions/workflows/ci.yml/badge.svg)](https://github.com/kieksme/mcp-contabo/actions/workflows/ci.yml)

This repository contains an MCP server for the [Contabo](https://contabo.com/) cloud API.

## Quick start (no clone)

```bash
npx -y --package=git+https://github.com/kieksme/mcp-contabo.git#main contabo-mcp
```

Set `CONTABO_CLIENT_ID`, `CONTABO_CLIENT_SECRET`, `CONTABO_API_USER`, and `CONTABO_API_PASSWORD` in your environment or MCP client config. See [`contabo-mcp/README.md`](contabo-mcp/README.md) for Cursor `mcp.json` examples and more options.
