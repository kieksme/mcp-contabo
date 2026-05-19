# Security

## Expected capabilities

`@kieksme/contabo-mcp` is an MCP server that runs over **stdio** and proxies requests to the [Contabo API](https://api.contabo.com/). By design it:

- Reads configuration from a fixed set of environment variables (see below).
- Performs outbound **HTTPS** requests to Contabo authentication and API endpoints.
- Does **not** ship install scripts in the published npm tarball (`prepublishOnly` runs only at publish time in CI).

## Environment variables

Only these variables are read (via `readContaboEnv` in `src/config/env.ts`):

| Variable                     | Required         | Purpose                                                        |
|------------------------------|------------------|----------------------------------------------------------------|
| `CONTABO_CLIENT_ID`          | Yes (OAuth mode) | OAuth client id (Customer ID from control panel)               |
| `CONTABO_CLIENT_SECRET`      | Yes (OAuth mode) | OAuth client secret                                            |
| `CONTABO_API_USER`           | Yes (OAuth mode) | API username (email)                                           |
| `CONTABO_API_PASSWORD`       | Yes (OAuth mode) | API password (set on API details page)                         |
| `CONTABO_ACCESS_TOKEN`       | No               | Static bearer token (dev); skips OAuth when set                |
| `CONTABO_API_BASE_URL`       | No               | API base URL (default: `https://api.contabo.com/v1`)           |
| `CONTABO_AUTH_URL`           | No               | OAuth token URL (default: Contabo Keycloak endpoint)           |
| `CONTABO_ALLOW_CUSTOM_HOSTS` | No               | Set to `true` to allow non-`*.contabo.com` URLs (staging only) |

See [`.env.example`](.env.example) for a template.

## Network endpoints

By default the server contacts:

| Purpose | Host                                                |
|---------|-----------------------------------------------------|
| API     | `api.contabo.com` (and `*.contabo.com` subdomains)  |
| OAuth   | `auth.contabo.com` (and `*.contabo.com` subdomains) |

Custom `CONTABO_API_BASE_URL` / `CONTABO_AUTH_URL` values must use Contabo hostnames unless `CONTABO_ALLOW_CUSTOM_HOSTS=true`. Runtime requests are validated again in `src/config/hosts.ts`.

## Secret handling

- API credentials are never written to tool responses.
- Secret and S3 credential values are redacted in MCP tool output (see `src/utils/response.ts`).

## Socket.dev alerts

[Socket](https://socket.dev/npm/package/@kieksme/contabo-mcp) may flag this package for:

| Alert                             | Why it appears                        |
|-----------------------------------|---------------------------------------|
| Network access                    | Calls Contabo API over HTTPS          |
| Environment variable access       | Reads `CONTABO_*` configuration       |
| URL strings                       | Default Contabo API/auth URLs in code |
| Copyleft / non-permissive license | Package is **GPL-3.0-or-later**       |

These are **expected** for an API client under GPL. Dependency alerts: only `@modelcontextprotocol/sdk` and `zod`; no known malware in the tree at publish time.

## Reporting vulnerabilities

Please report security issues via [GitHub Issues](https://github.com/kieksme/mcp-contabo/issues) with minimal reproduction steps. Do not include live API credentials or tokens.

For sensitive reports, contact the maintainers through the contact options on the [npm package page](https://www.npmjs.com/package/@kieksme/contabo-mcp).
