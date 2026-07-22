# syntax=docker/dockerfile:1

# --- Build stage: install full deps, type-check + bundle both entrypoints ------------------
FROM node:20-slim AS build
WORKDIR /app

# Pin pnpm via corepack (packageManager field in package.json).
RUN corepack enable

# Install with a warm lockfile first (better layer caching). patches/ + .npmrc are needed
# because pnpm applies a patched dependency (@modelcontextprotocol/sdk) during install.
COPY package.json pnpm-lock.yaml .npmrc ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile

# Build: tsc --emitDeclarationOnly (type-check) + esbuild bundle -> dist/index.js, dist/http.js
COPY tsconfig.json ./
COPY scripts ./scripts
COPY src ./src
RUN pnpm run build

# Materialize the two (zero-dep) runtime externals as real files. pnpm's node_modules are
# symlinks into the .pnpm store, so a plain cross-stage COPY would carry dangling links;
# cp -rL dereferences them into a flat, self-contained folder for the runtime stage.
RUN mkdir -p /runtime_modules \
  && cp -rL node_modules/zod /runtime_modules/zod \
  && cp -rL node_modules/@cfworker /runtime_modules/@cfworker

# --- Runtime stage: minimal, non-root, HTTP transport only ---------------------------------
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000

# The bundle externalizes only these two (dependency-free) runtime deps.
COPY --from=build /runtime_modules ./node_modules

# package.json is read at runtime by loadPackageVersion() (../package.json relative to dist/).
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/dist ./dist

EXPOSE 3000
USER node

# Liveness/readiness probe hits the unauthenticated /health route (no curl in slim image).
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/http.js"]
