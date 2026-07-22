# Contabo MCP Server

[![npm version](https://img.shields.io/npm/v/@kieksme/contabo-mcp.svg)](https://www.npmjs.com/package/@kieksme/contabo-mcp)
[![Socket Badge](https://badge.socket.dev/npm/package/@kieksme/contabo-mcp)](https://socket.dev/npm/package/@kieksme/contabo-mcp)

MCP (Model Context Protocol) server for the [Contabo API](https://api.contabo.com/). Manage virtual machines, images, snapshots/backups, networking, DNS, object storage, secrets, domains, and tags from Cursor or other MCP clients.

## Features

- **115 tools** with `contabo_*` naming
- Two transports: **stdio** (default) and **remote Streamable HTTP** with Bearer-token auth (Docker-ready — see [Remote HTTP transport](#remote-http-transport-docker))
- OAuth2 password grant (or static bearer token for development)
- Automatic `x-request-id` per request and token refresh on 401
- Secret value redaction in tool responses (secrets and S3 credentials)
- MCP tool annotations (`readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`) on all tools
- Structured error payloads with `x-request-id` and audit-tool hints

## Security and Socket

This package is an API client: it reads `CONTABO_*` environment variables and calls Contabo over HTTPS only. Outbound hosts are restricted to `*.contabo.com` unless `CONTABO_ALLOW_CUSTOM_HOSTS=true` (staging). See [SECURITY.md](SECURITY.md) for the full allowlist and reporting process.

The [Socket.dev](https://socket.dev/npm/package/@kieksme/contabo-mcp) badge may show **network access**, **environment variable access**, **URL strings**, and **GPL license** alerts — these are intentional for this package type, not indicators of malware. Dependency CVEs are tracked via `pnpm audit` in CI.

## Tool annotations

Every tool sets MCP hints so clients can warn before destructive calls:

| Annotation               | Used for                                                    |
|--------------------------|-------------------------------------------------------------|
| `readOnlyHint`           | List, get, stats, availability checks, audits               |
| `destructiveHint: false` | Safe writes (metadata updates, start instance)              |
| `destructiveHint: true`  | Deletes, cancels, reinstall, power actions, billing changes |
| `openWorldHint`          | Creates and purchases that affect live account resources    |
| `idempotentHint`         | DELETE operations safe to retry with the same id            |

Errors return structured JSON (`structuredContent.error`) with `code`, `message`, `status`, and `xRequestId`.

## Releases

Versioning and npm publish are automated with [release-please](https://github.com/googleapis/release-please) on `main`. Any conventional commit under `contabo-mcp/` updates the next release pull request. See [CONTRIBUTING.md](../CONTRIBUTING.md#releasing-maintainers) in the repository root.

## Prerequisites

1. [Node.js](https://nodejs.org/) 20 or newer
2. Contabo API credentials (see [Obtaining API credentials](#obtaining-api-credentials) below)
3. Optional background: [Contabo help — How can I access the Contabo API?](https://help.contabo.com/en/support/solutions/articles/103000270527-how-can-i-access-the-contabo-api-)

## Obtaining API credentials

All values come from the Contabo Customer Control Panel. You need a normal control-panel login (including 2FA if enabled).

### Open the API page

1. Sign in at [my.contabo.com](https://my.contabo.com/).
2. Open **[API details](https://my.contabo.com/api/details)** (menu path may vary; the direct URL is stable).

The page title is **API**. It states that the data shown there plus the **API password** are required to use the API.

### Fields on the API page

The panel lists four pieces of information (labels may appear in German or English depending on locale):

| Control panel (DE) | Control panel (EN) | Environment variable    | Notes                                                                                |
|--------------------|--------------------|-------------------------|--------------------------------------------------------------------------------------|
| Kunden-ID          | Customer ID        | `CONTABO_CLIENT_ID`     | Format like `DE-8791`. This is the OAuth **client id**, not your VPS name.           |
| Client-Secret      | Client secret      | `CONTABO_CLIENT_SECRET` | Shown masked (`••••••`). Copy when displayed or regenerate if you no longer have it. |
| Benutzername       | Username           | `CONTABO_API_USER`      | Your API user email (often the same as your control-panel login).                    |
| API-Passwort       | API password       | `CONTABO_API_PASSWORD`  | **Separate** from your control-panel login password (see below).                     |

### Set the API password (required once)

Until you set an API password, the panel typically asks you to **set a new password** before you can use the API (“Bitte setzen Sie ein neues Passwort, um die API nutzen zu können”).

1. On [API details](https://my.contabo.com/api/details), use the control to set or change the **API password**.
2. Choose a strong password and store it in a password manager.
3. Use that value for `CONTABO_API_PASSWORD` — **not** your normal my.contabo.com login password.

You can change the API password anytime in the same place.

### Map credentials to this MCP server

Copy the four values into `.env` (local development) or your MCP client `env` block:

```bash
CONTABO_CLIENT_ID=DE-XXXX          # Customer ID from the panel
CONTABO_CLIENT_SECRET=...          # Client secret (full string)
CONTABO_API_USER=you@example.com   # Username from the panel
CONTABO_API_PASSWORD=...           # API password you set on the API page
```

Example `.cursor/mcp.json` fragment:

```json
"env": {
  "CONTABO_CLIENT_ID": "DE-XXXX",
  "CONTABO_CLIENT_SECRET": "your-client-secret",
  "CONTABO_API_USER": "you@example.com",
  "CONTABO_API_PASSWORD": "your-api-password"
}
```

### Verify credentials

After saving config, restart the MCP client (or reload MCP servers in Cursor). A quick check:

- OAuth errors such as `unauthorized_client` / *Invalid client credentials* usually mean a wrong **Customer ID** or **Client secret**.
- `invalid_grant` or login-related errors often mean a wrong **API user** or **API password** (e.g. using the control-panel login password instead of the API password).

Do not commit `.env` or paste secrets into chat, issues, or screenshots.

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

## Remote HTTP transport (Docker)

Besides stdio, the server can run as a **remote MCP over Streamable HTTP**, authenticated with a Bearer token. This is the mode used in Docker. Behavior is selected via `MCP_TRANSPORT` (default `stdio`, fully backward compatible).

### Configuration

| Variable | Default | Description |
|---|---|---|
| `MCP_TRANSPORT` | `stdio` | `stdio` or `http`. |
| `MCP_AUTH_TOKEN` | — | **Required** in `http` mode. Bearer token clients must present. Generate with `openssl rand -hex 32`. |
| `MCP_HTTP_HOST` | `0.0.0.0` | Bind address. `0.0.0.0` inside containers; use `127.0.0.1` for local-only. |
| `MCP_HTTP_PORT` | `3000` | Listen port. |
| `MCP_HTTP_PATH` | `/` | MCP endpoint path. |
| `MCP_HTTP_DNS_REBINDING_PROTECTION` | `false` | Enable `Host`/`Origin` validation (recommended beyond localhost). |
| `MCP_HTTP_ALLOWED_HOSTS` | — | Comma-separated allowed `Host` values (used when protection is on). |
| `MCP_HTTP_ALLOWED_ORIGINS` | — | Comma-separated allowed `Origin` values. |

The Contabo API credentials (`CONTABO_*`) are still required — the HTTP transport only changes how MCP clients reach the server, not how it authenticates to Contabo.

### Run with Docker Compose

```bash
cp .env.example .env      # fill in CONTABO_* and set MCP_AUTH_TOKEN
docker compose up --build
```

The server listens on `http://localhost:3000/`. An unauthenticated `GET /health` returns `{"status":"ok"}` for container/orchestrator probes.

### Pull the published image (GHCR)

Released versions are published to the GitHub Container Registry as public images, tagged with the version number (and `latest` for the newest release):

```bash
docker run --rm -p 3000:3000 \
  -e MCP_AUTH_TOKEN=... \
  -e CONTABO_CLIENT_ID=... -e CONTABO_CLIENT_SECRET=... \
  -e CONTABO_API_USER=... -e CONTABO_API_PASSWORD=... \
  ghcr.io/kieksme/contabo-mcp:latest        # or :1.4.0
```

> **Maintainers:** a GHCR package is private on first publish. Set its visibility to **public** once under the package settings (`https://github.com/users/kieksme/packages/container/contabo-mcp/settings`).

### Connect an MCP client

```json
{
  "mcpServers": {
    "contabo-remote": {
      "type": "streamable-http",
      "url": "https://your-host:3000/",
      "headers": { "Authorization": "Bearer <MCP_AUTH_TOKEN>" }
    }
  }
}
```

For stdio-only clients, bridge with [`mcp-remote`](https://www.npmjs.com/package/mcp-remote):

```bash
npx -y mcp-remote https://your-host:3000/ --header "Authorization: Bearer <MCP_AUTH_TOKEN>"
```

Clients must send `Accept: application/json, text/event-stream`; a plain `curl` without it gets `406`.

### Security notes

- **TLS:** the server speaks plain HTTP. Terminate TLS at a reverse proxy / ingress and never expose the raw port to the internet unencrypted.
- **Scaling:** sessions are held in-memory (stateful). Behind multiple replicas, enable **sticky sessions** at the load balancer so a client stays on the instance that holds its `Mcp-Session-Id`.
- Enable `MCP_HTTP_DNS_REBINDING_PROTECTION` with `MCP_HTTP_ALLOWED_HOSTS` for any deployment reachable beyond localhost.

## Evaluations

Read-only evaluation scenarios for agent testing live in [`evaluations/contabo.eval.xml`](evaluations/contabo.eval.xml). Regenerate answers against your account when adding live-data questions.

## Contributing

Development setup, testing, OpenAPI refresh, and release process: see [CONTRIBUTING.md](../CONTRIBUTING.md) in the repository root.

## Tool inventory

| Area                | Tools                                                                                                                                    |
|---------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| Instances           | `contabo_instances_*` (list, get, create, update, reinstall, cancel, upgrade, start/stop/restart/shutdown/rescue/reset_password, audits) |
| Snapshots / backups | `contabo_snapshots_*`                                                                                                                    |
| Images              | `contabo_images_*` (list, get, create, update, delete, stats, audits)                                                                    |
| Data centers        | `contabo_data_centers_list`                                                                                                              |
| Object storage      | `contabo_object_storages_*`, `contabo_object_storage_credentials_*`                                                                      |
| Secrets             | `contabo_secrets_*`                                                                                                                      |
| Domains             | `contabo_domains_*`, `contabo_domain_handles_*`                                                                                          |
| DNS                 | `contabo_dns_zones_*`, `contabo_dns_zone_records_*`, `contabo_dns_ptrs_*`, DNS audits                                                     |
| Firewalls           | `contabo_firewalls_*` (CRUD, rules, attach/detach instance, preset rules, audits)                                                        |
| Private networks    | `contabo_private_networks_*` (CRUD, attach/detach instance, audits)                                                                      |
| VIPs                | `contabo_vips_*` (list, get, assign, unassign, audits)                                                                                   |
| Tags                | `contabo_tags_*`, `contabo_tag_assignments_*`                                                                                            |

Automated VM backups: use `contabo_instances_upgrade` with body `{ "backup": {} }`.

Object storage S3 credentials require `userId` (Contabo user UUID from the control panel).

## License

GPL-3.0-or-later (see [LICENSE](LICENSE)).
