# Agent instructions

Guidance for AI agents working in this repository.

## Project

MCP server for the [Contabo API](https://api.contabo.com/). Package: [`contabo-mcp/`](contabo-mcp/) (`@kieksme/contabo-mcp`). See [`contabo-mcp/README.md`](contabo-mcp/README.md) and [CONTRIBUTING.md](CONTRIBUTING.md).

## Commits

**Use [Conventional Commits](https://www.conventionalcommits.org/) in English.**

Format:

```text
<type>(<optional scope>): <short description>

<optional body>
```

Common types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`, `build`, `perf`.

Examples:

- `feat(instances): add filter by region`
- `fix(auth): refresh token on 401`
- `docs: document API credentials from control panel`

Rules:

- Use the imperative mood in the subject line (`add`, not `added`).
- Keep the subject concise (about 72 characters or less).
- Only create commits when the user explicitly asks.
- Do not commit secrets (`.env`, API keys, `mcp.json` credentials).

## Code changes

- Keep diffs minimal and focused.
- Match existing patterns in `contabo-mcp/src/`.
- Run `pnpm test` and `pnpm run pack:check` from `contabo-mcp/` before finishing substantive changes.
- Write user-facing documentation in English.
