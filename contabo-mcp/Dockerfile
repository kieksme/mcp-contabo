# syntax=docker/dockerfile:1
# Multi-stage build for the Contabo MCP server (remote Streamable HTTP transport).
#
# Build context is the REPO ROOT (this is a pnpm workspace as of the dashboard/
# package addition) — see .github/workflows/docker-publish.yml for the
# `context: .` / `file: contabo-mcp/Dockerfile` invocation, and
# docker-compose.yml for local use.

# ---- Build stage ----
FROM node:22-bookworm-slim AS build
WORKDIR /repo

# corepack ships with Node and pins the pnpm version from package.json.
RUN corepack enable

# Install against the committed workspace lockfile first (better layer
# caching) — only the package.json files, not full sources, so editing
# contabo-mcp/src or dashboard/src doesn't bust the install layer.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY contabo-mcp/package.json contabo-mcp/package.json
COPY dashboard/package.json dashboard/package.json
RUN pnpm install --frozen-lockfile

COPY contabo-mcp contabo-mcp
RUN pnpm --filter @kieksme/contabo-mcp run build

# `pnpm deploy` packages this one workspace package (its build output, its
# own package.json, and its production dependencies resolved from the
# workspace) into a self-contained directory — the standard way to produce
# a per-package Docker build context out of a pnpm monorepo.
RUN pnpm --filter @kieksme/contabo-mcp deploy --prod /out

# ---- Runtime stage ----
FROM node:22-bookworm-slim AS runtime

# OCI labels so the GHCR package links back to the source repository.
LABEL org.opencontainers.image.title="contabo-mcp" \
      org.opencontainers.image.description="MCP server for the Contabo API (remote Streamable HTTP transport)" \
      org.opencontainers.image.source="https://github.com/kieksme/mcp-contabo" \
      org.opencontainers.image.licenses="GPL-3.0-or-later"

ENV NODE_ENV=production \
    MCP_TRANSPORT=http \
    MCP_HTTP_HOST=0.0.0.0 \
    MCP_HTTP_PORT=3000 \
    MCP_HTTP_PATH=/

WORKDIR /app
COPY --from=build /out/node_modules ./node_modules
COPY --from=build /out/dist ./dist
# package.json is read at runtime by loadPackageVersion().
COPY --from=build /out/package.json ./

# Run as the built-in unprivileged user (least privilege).
USER node

EXPOSE 3000

# Container healthcheck against the unauthenticated /health endpoint.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.MCP_HTTP_PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/index.js"]
