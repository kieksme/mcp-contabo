# Contributing to Contabo MCP

Thanks for helping improve this MCP server. This guide covers local development, testing, API spec updates, and releases.

The npm package lives in [`contabo-mcp/`](contabo-mcp/). User-facing install docs are in [`contabo-mcp/README.md`](contabo-mcp/README.md).

## Prerequisites

1. [Node.js](https://nodejs.org/) 20 or newer (CI uses Node 22; the release workflow uses Node 24)
2. [pnpm](https://pnpm.io/) 10.33.3 (see `packageManager` in `contabo-mcp/package.json`)
3. Contabo API credentials for manual testing — see [Obtaining API credentials](contabo-mcp/README.md#obtaining-api-credentials) ([API details](https://my.contabo.com/api/details))

## Repository setup

```bash
git clone https://github.com/kieksme/mcp-contabo.git
cd mcp-contabo/contabo-mcp
pnpm install
cp .env.example .env
# Edit .env with your credentials
pnpm build
```

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

Before opening a pull request, run `pnpm test` and `pnpm run pack:check` from `contabo-mcp/`.

### Local MCP config (cloned repo)

Point your MCP client at the built entry file:

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

## Continuous integration

Tests and build run on every push and pull request to `main` via [GitHub Actions](https://github.com/kieksme/mcp-contabo/actions/workflows/ci.yml).

## OpenAPI spec

The spec is vendored at [`contabo-mcp/openapi/contabo.openapi.json`](contabo-mcp/openapi/contabo.openapi.json), extracted from the official Redoc documentation.

To refresh types after API changes:

```bash
cd contabo-mcp
pnpm run fetch-openapi
pnpm run generate-types
```

Commit the updated spec and generated types when they change.

## Tool inventory

When adding or changing tools, keep the `contabo_*` naming convention and update tests in `contabo-mcp/src/tools/`.

| Area | Tools |
|------|--------|
| Instances | `contabo_instances_*` (list, get, create, update, reinstall, cancel, upgrade, start/stop/restart/shutdown/rescue/reset_password, audits) |
| Snapshots / backups | `contabo_snapshots_*` |
| Images | `contabo_images_*` |
| Data centers | `contabo_data_centers_list` |
| Object storage | `contabo_object_storages_*`, `contabo_object_storage_credentials_*` |
| Secrets | `contabo_secrets_*` |
| Domains | `contabo_domains_*`, `contabo_domain_handles_*` |
| DNS | `contabo_dns_zones_*`, `contabo_dns_zone_records_*`, `contabo_dns_ptrs_*` |
| Firewalls | `contabo_firewalls_*` |
| Private networks | `contabo_private_networks_*` |
| VIPs | `contabo_vips_*` |
| Tags | `contabo_tags_*`, `contabo_tag_assignments_*` |

Notes:

- Automated VM backups: use `contabo_instances_upgrade` with body `{ "backup": {} }`.
- Object storage S3 credentials require `userId` (Contabo user UUID from the control panel).

## Pull requests

1. Fork the repository and create a branch from `main`.
2. Keep changes focused; match existing TypeScript style and patterns in `contabo-mcp/src/`.
3. Add or update tests for behavior you change.
4. Ensure CI passes (`pnpm test`, `pnpm run build` in `contabo-mcp/`).
5. Open a pull request with a clear description of what changed and why.

## Releasing (maintainers)

Releases are automated with [release-please](https://github.com/googleapis/release-please) and published when a version tag is created.

### Routine release

1. Merge changes to `main` using [Conventional Commits](https://www.conventionalcommits.org/). All standard types configured in [`release-please-config.json`](release-please-config.json) (`feat`, `fix`, `docs`, `chore`, `ci`, `test`, `build`, `refactor`, `style`, `perf`, `revert`, `deps`, `security`) update the release PR and changelog.
   - `feat` → minor bump; `BREAKING CHANGE` in footer → major bump; every other listed type → patch bump.
2. The [Release Please workflow](https://github.com/kieksme/mcp-contabo/actions/workflows/release-please.yml) opens or updates a release PR (title like `chore(main): release 1.0.3`).
3. Review the PR (version bump in [`contabo-mcp/package.json`](contabo-mcp/package.json) and [`contabo-mcp/CHANGELOG.md`](contabo-mcp/CHANGELOG.md)).
4. Merge the release PR. Release Please creates a Git tag **without** a `v` prefix (e.g. `1.0.3`).
5. The same [Release Please workflow](https://github.com/kieksme/mcp-contabo/actions/workflows/release-please.yml) run then calls the [publish workflow](https://github.com/kieksme/mcp-contabo/actions/workflows/publish.yml): tests, npm publish to [npmjs.com](https://www.npmjs.com/package/@kieksme/contabo-mcp) (OIDC), and a GitHub Release from `contabo-mcp/CHANGELOG.md`.

   Release Please creates the Git tag and GitHub Release, then dispatches [`publish.yml`](.github/workflows/publish.yml) via `workflow_dispatch` (outputs `contabo-mcp--release_created` / `contabo-mcp--tag_name`). Tags created by GitHub Actions do not trigger separate workflows; do not rely on `push: tags` alone.

   **npm Trusted Publishing** must list workflow filename **`publish.yml`** only. Do not chain publish through `workflow_call` from `release-please.yml` — npm OIDC attributes the caller workflow name, which breaks trusted publishing ([npm docs](https://docs.npmjs.com/trusted-publishers/)).

   **Manual GitHub Release** for a tag pushed outside Release Please: handled by [`github-release-on-tag.yml`](.github/workflows/github-release-on-tag.yml) on tag push.

   **Manual npm publish for an existing tag** (e.g. after a failed publish): Actions → [Release](https://github.com/kieksme/mcp-contabo/actions/workflows/publish.yml) → Run workflow → enter the tag (e.g. `1.2.0`).

### Manual release (fallback)

If Release Please is unavailable:

1. Bump `version` in `contabo-mcp/package.json` and update `contabo-mcp/CHANGELOG.md`.
2. Push to `main`, then tag: `git tag 1.0.x && git push origin 1.0.x`

### npm Trusted Publishing (routine releases)

After the package exists on npm, CI publishes via OIDC. **Do not** keep a long-lived `NPM_TOKEN` for routine releases.

1. On [npmjs.com](https://www.npmjs.com/package/@kieksme/contabo-mcp) → **Settings** → **Trusted publishing**, add **GitHub Actions**:
   - **Repository**: `kieksme/mcp-contabo`
   - **Workflow filename**: `publish.yml` (must match [`.github/workflows/publish.yml`](.github/workflows/publish.yml) exactly)
   - **Environment** (optional): leave empty unless you use a GitHub deployment environment
2. Or use the CLI (requires npm 2FA):

   ```bash
   npm trust github @kieksme/contabo-mcp --file publish.yml --repository kieksme/mcp-contabo -y
   ```

3. (Recommended) Under **Publishing access**, choose **Require two-factor authentication and disallow tokens**, then revoke old automation tokens you no longer need.
4. Re-run the [Release workflow](https://github.com/kieksme/mcp-contabo/actions/workflows/publish.yml) or push the version tag again.

Requirements: GitHub-hosted runners, Node **24** (release job), npm CLI **11.5.1+** via `npx npm@11.5.1`. The package `repository.url` in `package.json` must match this GitHub repo.

### First publish (package not on npm yet)

npm [Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) only works **after** the package exists on the registry. For the **first** upload, use one of:

**A — GitHub Actions (one-time bootstrap)**

1. Log in to npm as **[kieksme](https://www.npmjs.com/settings/kieksme/packages)** and create a [granular access token](https://docs.npmjs.com/creating-and-viewing-access-tokens) with **Publish** for `@kieksme/contabo-mcp`.
2. Add it as repository secret **`NPM_TOKEN`**.
3. Run workflow **[npm bootstrap (first publish)](https://github.com/kieksme/mcp-contabo/actions/workflows/npm-bootstrap.yml)** (`workflow_dispatch`).
4. Remove **`NPM_TOKEN`** from GitHub secrets after Trusted Publishing is configured.

**B — Local machine**

```bash
cd contabo-mcp
pnpm install
pnpm run build
pnpm test
pnpm run pack:check
npm login
npx npm@11.5.1 publish --access public --provenance
```

## Socket.dev (supply chain alerts)

The package page on [Socket](https://socket.dev/npm/package/@kieksme/contabo-mcp) may flag **network access**, **environment variable access**, **URL strings**, and **GPL license** alerts. These are expected for an API MCP server under GPL; see [`contabo-mcp/SECURITY.md`](contabo-mcp/SECURITY.md).

Repository config: [`socket.yml`](socket.yml) limits PR scans to `contabo-mcp/package.json` and `contabo-mcp/pnpm-lock.yaml`.

On the Socket organization dashboard, link `kieksme/mcp-contabo` and set these alert types to **Monitor** (not Block) so pull requests are not blocked on intentional behavior:

- `networkAccess`, `envVars`, `externalUrls`, `copyleftLicense`, `nonPermissiveLicense`

Use [repository labels / security policies](https://docs.socket.dev/docs/socket-yml) on Socket (preferred over deprecated `issueRules` in `socket.yml`).

## License

By contributing, you agree that your contributions will be licensed under **GPL-3.0-or-later** (see [LICENSE](LICENSE)).
