# Contabo MCP Server

MCP (Model Context Protocol) server for the [Contabo API](https://api.contabo.com/). Manage virtual machines, snapshots/backups, object storage, secrets, and domains from Cursor or other MCP clients.

## Features

- **57 tools** with `contabo_*` naming
- OAuth2 password grant (or static bearer token for development)
- Automatic `x-request-id` per request and token refresh on 401
- Secret value redaction in tool responses

## Prerequisites

1. [Node.js](https://nodejs.org/) 20 or newer
2. Enable API access in the [Contabo Customer Control Panel](https://my.contabo.com/api/details)
3. Set **Client ID**, **Client Secret**, and API user password ([help article](https://help.contabo.com/en/support/solutions/articles/103000270527-how-can-i-access-the-contabo-api-))

## Install from npm (recommended)

Published as [`@kieksme/contabo-mcp`](https://www.npmjs.com/package/@kieksme/contabo-mcp) on npm under the [kieksme](https://www.npmjs.com/settings/kieksme/packages) account. No clone and no build step required.

### Cursor / MCP client

Add to `.cursor/mcp.json` (or your global MCP config):

```json
{
  "mcpServers": {
    "contabo": {
      "command": "npx",
      "args": ["-y", "@kieksme/contabo-mcp"],
      "env": {
        "CONTABO_CLIENT_ID": "your-client-id",
        "CONTABO_CLIENT_SECRET": "your-client-secret",
        "CONTABO_API_USER": "your-api-user@email.com",
        "CONTABO_API_PASSWORD": "your-api-password"
      }
    }
  }
}
```

With **pnpm**:

```json
{
  "mcpServers": {
    "contabo": {
      "command": "pnpm",
      "args": ["dlx", "@kieksme/contabo-mcp"],
      "env": {
        "CONTABO_CLIENT_ID": "your-client-id",
        "CONTABO_CLIENT_SECRET": "your-client-secret",
        "CONTABO_API_USER": "your-api-user@email.com",
        "CONTABO_API_PASSWORD": "your-api-password"
      }
    }
  }
}
```

See [`mcp.json.example`](mcp.json.example) for more variants.

### Terminal (stdio)

```bash
npx -y @kieksme/contabo-mcp
```

```bash
pnpm dlx @kieksme/contabo-mcp
```

### Global install

```bash
npm install -g @kieksme/contabo-mcp
contabo-mcp
```

## Install from GitHub (alternative)

Without npm, install from the repository (first run builds the package; requires pnpm via Corepack on Node 20+):

```json
{
  "mcpServers": {
    "contabo": {
      "command": "npx",
      "args": [
        "-y",
        "--package=git+https://github.com/kieksme/mcp-contabo.git#main",
        "contabo-mcp"
      ],
      "env": { "...": "..." }
    }
  }
}
```

```bash
npx -y --package=git+https://github.com/kieksme/mcp-contabo.git#main contabo-mcp
```

## Contributing

Development setup, testing, OpenAPI refresh, and release process: see [CONTRIBUTING.md](../CONTRIBUTING.md) in the repository root.

## Tool inventory

| Area | Tools |
|------|--------|
| Instances | `contabo_instances_*` (list, get, create, update, reinstall, cancel, upgrade, start/stop/restart/shutdown/rescue/reset_password, audits) |
| Snapshots / backups | `contabo_snapshots_*` |
| Object storage | `contabo_object_storages_*`, `contabo_object_storage_credentials_*` |
| Secrets | `contabo_secrets_*` |
| Domains | `contabo_domains_*`, `contabo_domain_handles_*` |

Automated VM backups: use `contabo_instances_upgrade` with body `{ "backup": {} }`.

Object storage S3 credentials require `userId` (Contabo user UUID from the control panel).

## License

GPL-3.0-or-later (see [LICENSE](LICENSE)).
