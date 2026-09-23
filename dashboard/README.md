# Contabo Dashboard

A small web dashboard for [`@kieksme/contabo-mcp`](../contabo-mcp): a VM status table (start/stop/restart, like Contabo's own admin console) plus a Claude-powered chat agent that can answer questions and perform actions using a curated set of the MCP server's tools.

It embeds `contabo-mcp` in-process (no subprocess, no extra network hop) via `InMemoryTransport` — see [`src/server/mcp/client.ts`](src/server/mcp/client.ts).

## Setup

From the repository root (single pnpm workspace lockfile):

```bash
pnpm install
```

Then, in `dashboard/`:

```bash
cp .env.example .env
# Fill in:
#   CONTABO_CLIENT_ID / CONTABO_CLIENT_SECRET / CONTABO_API_USER / CONTABO_API_PASSWORD
#   ANTHROPIC_API_KEY
#   DASHBOARD_AUTH_TOKEN     (openssl rand -hex 32)
#   DASHBOARD_SESSION_SECRET (openssl rand -hex 32)
```

`contabo-mcp` must be built first (the dashboard imports its compiled output):

```bash
pnpm --filter @kieksme/contabo-mcp run build
```

## Development

```bash
pnpm run dev          # vite dev server + tsx watch, proxying /api to the Express server
```

## Build & run

```bash
pnpm run build        # builds the React frontend (dist/web) and the server (dist/server)
pnpm start            # node dist/server/index.js
```

## Configuration

See [`.env.example`](.env.example) for the full list. Notable ones:

- `DASHBOARD_AGENT_MODEL` (default `claude-sonnet-5`) — model used by the chat agent.
- `DASHBOARD_AGENT_TOOL_PREFIXES` (default `contabo_instances_,contabo_snapshots_`) — comma-separated MCP tool-name prefixes the chat agent is allowed to call. Widen this to expose more of `contabo-mcp`'s 115 tools to the agent.
- `DASHBOARD_AUTH_TOKEN` / `DASHBOARD_SESSION_SECRET` — dashboard login. There is no per-user account system; this is a single shared secret for a single-operator tool.

## Safety: destructive actions require confirmation

Any MCP tool marked `destructiveHint: true` (stop, restart, shutdown, reinstall, cancel, …) is never executed automatically — neither by a button click without confirmation, nor by the chat agent. The REST API returns `428 Precondition Required` until the request includes `{"confirmed": true}`; the chat agent pauses the conversation and waits for an explicit approve/deny via `POST /api/chat/confirm` before running the tool. See [`src/server/agent/loop.ts`](src/server/agent/loop.ts).

## Deployment

`Dockerfile` + `railway.json` build a self-contained image via `pnpm deploy` (see the Dockerfile for details). The build context must be the repository root, not `dashboard/`, since it embeds the sibling `contabo-mcp` workspace package.
