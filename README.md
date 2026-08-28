# Contabo MCP

![Contabo MCP](assets/readme-header.svg)

[![CI](https://github.com/kieksme/mcp-contabo/actions/workflows/ci.yml/badge.svg)](https://github.com/kieksme/mcp-contabo/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@kieksme/contabo-mcp.svg)](https://www.npmjs.com/package/@kieksme/contabo-mcp)
[![Socket Badge](https://badge.socket.dev/npm/package/@kieksme/contabo-mcp)](https://socket.dev/npm/package/@kieksme/contabo-mcp)
[![SkillAudit](https://skillaudit.dev/badge/kieksme/mcp-contabo.svg)](https://skillaudit.dev/report/kieksme/mcp-contabo)

[![Install in Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](cursor://anysphere.cursor-deeplink/mcp/install?name=contabo&config=eyJjb21tYW5kIjogIm5weCIsICJhcmdzIjogWyIteSIsICJAa2lla3NtZS9jb250YWJvLW1jcCJdLCAiZW52IjogeyJDT05UQUJPX0NMSUVOVF9JRCI6ICJ5b3VyLWNsaWVudC1pZCIsICJDT05UQUJPX0NMSUVOVF9TRUNSRVQiOiAieW91ci1jbGllbnQtc2VjcmV0IiwgIkNPTlRBQk9fQVBJX1VTRVIiOiAieW91ci1hcGktdXNlckBlbWFpbC5jb20iLCAiQ09OVEFCT19BUElfUEFTU1dPUkQiOiAieW91ci1hcGktcGFzc3dvcmQifX0%3D) [![Install in VS Code](https://img.shields.io/badge/VS_Code-Install_Server-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](vscode:mcp/install?%7B%22name%22%3A%20%22contabo%22%2C%20%22command%22%3A%20%22npx%22%2C%20%22args%22%3A%20%5B%22-y%22%2C%20%22%40kieksme%2Fcontabo-mcp%22%5D%2C%20%22env%22%3A%20%7B%22CONTABO_CLIENT_ID%22%3A%20%22your-client-id%22%2C%20%22CONTABO_CLIENT_SECRET%22%3A%20%22your-client-secret%22%2C%20%22CONTABO_API_USER%22%3A%20%22your-api-user%40email.com%22%2C%20%22CONTABO_API_PASSWORD%22%3A%20%22your-api-password%22%7D%7D)

MCP server for the [Contabo](https://contabo.com/) cloud API — virtual machines, images, snapshots, networking, DNS, object storage, secrets, domains, and tags.

Manage Contabo VPS/VDS instances, images, snapshots, firewalls, private networks, VIPs, DNS, S3-compatible object storage, secrets, domains, and tags from Cursor, Claude Desktop, or any MCP client. Published on npm as [`@kieksme/contabo-mcp`](https://www.npmjs.com/package/@kieksme/contabo-mcp).

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

## Remote MCP (HTTP)

Besides stdio, the server runs as a **remote MCP over Streamable HTTP** with Bearer-token auth — the mode used in Docker. Select it via `MCP_TRANSPORT=http` (default is `stdio`, fully backward compatible).

Run the published image from GHCR:

```bash
docker run --rm -p 3000:3000 \
  -e MCP_TRANSPORT=http \
  -e MCP_AUTH_TOKEN="$(openssl rand -hex 32)" \
  -e CONTABO_CLIENT_ID=... -e CONTABO_CLIENT_SECRET=... \
  -e CONTABO_API_USER=... -e CONTABO_API_PASSWORD=... \
  ghcr.io/kieksme/contabo-mcp:latest
```

The server listens on `http://localhost:3000/`; `GET /health` returns `{"status":"ok"}` (unauthenticated) for orchestrator probes. The `CONTABO_*` credentials are still required — the HTTP transport only changes how clients reach the server, not how it authenticates to Contabo.

Connect an MCP client (present the `MCP_AUTH_TOKEN` as a Bearer token):

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

**Security:** the server speaks plain HTTP — terminate TLS at a reverse proxy / ingress and never expose the raw port unencrypted. Beyond localhost, enable `MCP_HTTP_DNS_REBINDING_PROTECTION=true` with `MCP_HTTP_ALLOWED_HOSTS`. See [Remote HTTP transport (Docker)](contabo-mcp/README.md#remote-http-transport-docker) in the package README for all `MCP_*` variables, Docker Compose, and scaling notes.

Deploying to [Railway](https://railway.com) instead of Docker? See [Deploy on Railway](contabo-mcp/README.md#deploy-on-railway) in the package README — the Dockerfile and a committed `railway.json` already carry the build/healthcheck config, so it's a Root Directory + variables setup away from a running instance (and, once a maintainer publishes it, a one-click marketplace template).

See [`contabo-mcp/README.md`](contabo-mcp/README.md) for the full tool list and install options. To develop or release, see [CONTRIBUTING.md](CONTRIBUTING.md). Releases on `main` are proposed by [release-please](https://github.com/googleapis/release-please) via pull request.

## Install as a Claude Code plugin

```shell
/plugin marketplace add kieksme/mcp-contabo
/plugin install contabo-mcp@mcp-contabo
```

Claude Code prompts you for the four Contabo API credentials when you enable the plugin and stores them in the OS credential store rather than in plaintext config files — no manual `.mcp.json` editing needed.
