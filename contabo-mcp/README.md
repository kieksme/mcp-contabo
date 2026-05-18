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

Published as [`contabo-mcp`](https://www.npmjs.com/package/contabo-mcp) on npm. No clone and no build step required.

### Cursor / MCP client

Add to `.cursor/mcp.json` (or your global MCP config):

```json
{
  "mcpServers": {
    "contabo": {
      "command": "npx",
      "args": ["-y", "contabo-mcp"],
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
      "args": ["dlx", "contabo-mcp"],
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
npx -y contabo-mcp
```

```bash
pnpm dlx contabo-mcp
```

### Global install

```bash
npm install -g contabo-mcp
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

## Publishing (maintainers)

Releases are published to npm when a Git tag matching the package version is pushed.

1. Bump `version` in [`package.json`](package.json) (semver).
2. Commit and push to `main`.
3. Create and push a tag: `git tag v1.0.x && git push origin v1.0.x`
4. The [publish workflow](https://github.com/kieksme/mcp-contabo/actions/workflows/publish.yml) runs tests, verifies the npm tarball, and publishes with provenance.

### One-time setup

1. Create an npm account and ensure you can publish the [`contabo-mcp`](https://www.npmjs.com/package/contabo-mcp) package name (or use a scoped name and update `name` in `package.json`).
2. Create an npm **Granular Access Token** with publish rights for this package.
3. Add the token as repository secret **`NPM_TOKEN`** in GitHub (Settings → Secrets → Actions).

### First publish (manual)

If you need to publish before CI is configured:

```bash
cd contabo-mcp
pnpm install
pnpm run build
pnpm test
pnpm run pack:check
npm login
npm publish --access public --provenance
```

## License

GPL-3.0-or-later (see [LICENSE](LICENSE)).
