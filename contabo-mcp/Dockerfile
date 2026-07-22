# syntax=docker/dockerfile:1
# Multi-stage build for the Contabo MCP server (remote Streamable HTTP transport).
# Build context is the package directory (contabo-mcp/).

# ---- Build stage ----
FROM node:22-bookworm-slim AS build
WORKDIR /app

# corepack ships with Node and pins the pnpm version from package.json.
RUN corepack enable

# Install dependencies against the committed lockfile first (better layer caching).
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src
RUN pnpm run build

# Drop devDependencies for the runtime copy.
RUN pnpm prune --prod

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
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
# package.json is read at runtime by loadPackageVersion().
COPY package.json ./

# Run as the built-in unprivileged user (least privilege).
USER node

EXPOSE 3000

# Container healthcheck against the unauthenticated /health endpoint.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.MCP_HTTP_PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/index.js"]
