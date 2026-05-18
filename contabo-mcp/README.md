# Contabo MCP Server

MCP (Model Context Protocol) server for the [Contabo API](https://api.contabo.com/). Manage virtual machines, snapshots/backups, object storage, secrets, and domains from Cursor or other MCP clients.

## Features

- **52 tools** with `contabo_*` naming
- OAuth2 password grant (or static bearer token for development)
- Automatic `x-request-id` per request and token refresh on 401
- Secret value redaction in tool responses

## Prerequisites

1. [Node.js](https://nodejs.org/) 20 or newer
2. Enable API access in the [Contabo Customer Control Panel](https://my.contabo.com/api/details)
3. Set **Client ID**, **Client Secret**, and API user password ([help article](https://help.contabo.com/en/support/solutions/articles/103000270527-how-can-i-access-the-contabo-api-))

## Run without cloning the repository

You can use the server directly from GitHub. The first start downloads the package and builds `contabo-mcp` with **pnpm** (via [Corepack](https://nodejs.org/api/corepack.html) on Node 20+). This can take about a minute.

### Cursor / MCP client (recommended)

Add to `.cursor/mcp.json` (or your global MCP config). Replace `main` with a tag or branch if needed:

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
      "args": [
        "dlx",
        "--package=git+https://github.com/kieksme/mcp-contabo.git#main",
        "contabo-mcp"
      ],
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

### Terminal (stdio)

```bash
npx -y --package=git+https://github.com/kieksme/mcp-contabo.git#main contabo-mcp
```

Or with pnpm:

```bash
pnpm dlx --package=git+https://github.com/kieksme/mcp-contabo.git#main contabo-mcp
```

Export credentials first, or use a `.env` file with [dotenv-cli](https://www.npmjs.com/package/dotenv-cli):

```bash
export CONTABO_CLIENT_ID=...
export CONTABO_CLIENT_SECRET=...
export CONTABO_API_USER=...
export CONTABO_API_PASSWORD=...
npx -y --package=git+https://github.com/kieksme/mcp-contabo.git#main contabo-mcp
```

### Global install (no clone)

```bash
npm install -g "git+https://github.com/kieksme/mcp-contabo.git#main"
# then: contabo-mcp
```

```bash
pnpm add -g "github:kieksme/mcp-contabo#main"
# then: contabo-mcp
```

### Download source without `git clone`

If you prefer a local folder but do not use Git:

```bash
curl -fsSL https://github.com/kieksme/mcp-contabo/archive/refs/heads/main.tar.gz \
  | tar -xz
cd mcp-contabo-main/contabo-mcp
pnpm install && pnpm build
node dist/index.js
```

## Setup from a cloned repository

```bash
cd contabo-mcp
pnpm install
cp .env.example .env
# Edit .env with your credentials
pnpm build
```

## Cursor configuration (local clone)

If you cloned the repo, point Cursor at the built entry file:

```json
{
  "mcpServers": {
    "contabo": {
      "command": "node",
      "args": ["/absolute/path/to/contabo-mcp/dist/index.js"],
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

See also [`mcp.json.example`](mcp.json.example) for a clone-based setup.

## CI

Tests and build run on every push and pull request to `main` via [GitHub Actions](https://github.com/kieksme/mcp-contabo/actions/workflows/ci.yml).

## Development

```bash
pnpm build
pnpm test                     # unit tests (vitest)
pnpm run test:watch           # watch mode
pnpm start                    # stdio MCP server
pnpm run fetch-openapi        # refresh openapi/contabo.openapi.json
pnpm run generate-types       # regenerate src/generated/contabo.d.ts
npx @modelcontextprotocol/inspector  # interactive testing
```

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

## OpenAPI spec

The spec is vendored at [`openapi/contabo.openapi.json`](openapi/contabo.openapi.json), extracted from the official Redoc documentation. Refresh with `pnpm run fetch-openapi`.

## License

GPL-3.0-or-later (see repository root LICENSE).
