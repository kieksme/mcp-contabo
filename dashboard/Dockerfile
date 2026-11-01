# syntax=docker/dockerfile:1
# Multi-stage build for the Contabo dashboard (chat agent + status table).
#
# Build context is the REPO ROOT (pnpm workspace) — see
# .github/workflows/dashboard-docker-publish.yml.

# ---- Build stage ----
FROM node:22-bookworm-slim AS build
WORKDIR /repo

RUN corepack enable

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY contabo-mcp/package.json contabo-mcp/package.json
COPY dashboard/package.json dashboard/package.json
RUN pnpm install --frozen-lockfile

# The dashboard embeds contabo-mcp in-process (see src/server/mcp/client.ts),
# so its own build output must exist before the dashboard is built.
COPY contabo-mcp contabo-mcp
RUN pnpm --filter @kieksme/contabo-mcp run build

COPY dashboard dashboard
RUN pnpm --filter @kieksme/contabo-dashboard run build

RUN pnpm --filter @kieksme/contabo-dashboard deploy --prod /out

# ---- Runtime stage ----
FROM node:22-bookworm-slim AS runtime

LABEL org.opencontainers.image.title="contabo-dashboard" \
      org.opencontainers.image.description="Web dashboard + chat agent for the Contabo MCP server" \
      org.opencontainers.image.source="https://github.com/kieksme/mcp-contabo" \
      org.opencontainers.image.licenses="GPL-3.0-or-later"

ENV NODE_ENV=production \
    PORT=3000

WORKDIR /app
COPY --from=build /out/node_modules ./node_modules
COPY --from=build /out/dist ./dist
COPY --from=build /out/package.json ./

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/server/index.js"]
