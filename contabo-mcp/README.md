# Contabo MCP Server

MCP (Model Context Protocol) server for the [Contabo API](https://api.contabo.com/). Manage virtual machines, snapshots/backups, object storage, secrets, and domains from Cursor or other MCP clients.

## Features

- **57 tools** with `contabo_*` naming
- OAuth2 password grant (or static bearer token for development)
- Automatic `x-request-id` per request and token refresh on 401
- Secret value redaction in tool responses

## Releases

Versioning and npm publish are automated with [release-please](https://github.com/googleapis/release-please) on `main`. See [CONTRIBUTING.md](../CONTRIBUTING.md#releasing-maintainers) in the repository root.

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

| Control panel (DE) | Control panel (EN) | Environment variable | Notes |
|--------------------|--------------------|----------------------|-------|
| Kunden-ID | Customer ID | `CONTABO_CLIENT_ID` | Format like `DE-8791`. This is the OAuth **client id**, not your VPS name. |
| Client-Secret | Client secret | `CONTABO_CLIENT_SECRET` | Shown masked (`••••••`). Copy when displayed or regenerate if you no longer have it. |
| Benutzername | Username | `CONTABO_API_USER` | Your API user email (often the same as your control-panel login). |
| API-Passwort | API password | `CONTABO_API_PASSWORD` | **Separate** from your control-panel login password (see below). |

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
