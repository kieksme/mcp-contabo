# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.2](https://github.com/kieksme/mcp-contabo/compare/1.1.1...1.1.2) (2026-05-18)


### Changed

* **contabo-mcp:** trigger release-please test for patch release ([fa40f58](https://github.com/kieksme/mcp-contabo/commit/fa40f58ce56437c7fe0744d3eb77dbb3ba4a6b53))

## [1.1.1](https://github.com/kieksme/mcp-contabo/compare/1.1.0...1.1.1) (2026-05-18)


### Changed

* **contabo-mcp:** document automated release process in package README ([cd5ab4e](https://github.com/kieksme/mcp-contabo/commit/cd5ab4e056e7b94c52b84a357dacaec1d90ee78e))
* **main:** release 1.1.0 ([6f51f8f](https://github.com/kieksme/mcp-contabo/commit/6f51f8f66bd5dbe6ac5b439b9c95d739dce7f6f0))

## [1.1.0](https://github.com/kieksme/mcp-contabo/compare/1.0.2...1.1.0) (2026-05-18)


### Added

* Add CONTRIBUTING.md for development guidelines and update README.md links ([268aa9e](https://github.com/kieksme/mcp-contabo/commit/268aa9ef7a5020aa0bbbddd812c337e0f9209c45))


### Changed

* Update API credentials instructions in CONTRIBUTING.md and README.md, and enhance .env.example with detailed field descriptions ([574b01c](https://github.com/kieksme/mcp-contabo/commit/574b01ce50c5d570caf54fc34cbd9412b6451f83))
* Update changelog path references in documentation and scripts to point to contabo-mcp/CHANGELOG.md ([a292716](https://github.com/kieksme/mcp-contabo/commit/a2927163fe4eafe78b1bbe54c06bafdbe6f9d46f))

## [Unreleased]

## [1.0.2] - 2026-05-18

### Changed

- npm package renamed to `@kieksme/contabo-mcp` (published under the [kieksme](https://www.npmjs.com/settings/kieksme/packages) npm account; CLI command remains `contabo-mcp`)

### Fixed

- npm publish job: use Node 24 and `npx npm@11.5.1 publish` instead of broken global `npm install -g`

### Added

- `npm-bootstrap.yml` workflow for the first publish when the package is not on npm yet (requires one-time `NPM_TOKEN`)

[1.0.2]: https://github.com/kieksme/mcp-contabo/releases/tag/1.0.2

## [1.0.1] - 2026-05-18

### Added

- GitHub Release notes are built from `CHANGELOG.md` with all [Keep a Changelog](https://keepachangelog.com/) categories

### Changed

- Release workflow uses [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) (OIDC) instead of a long-lived `NPM_TOKEN`

### Deprecated

- No changes in this release

### Removed

- No changes in this release

### Fixed

- No changes in this release

### Security

- CI/npm publishes no longer use automation tokens with 2FA bypass; configure [Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) on npm instead

## [1.0.0] - 2026-05-18

### Added

- MCP server for the Contabo API with 57 tools (`contabo_*`)
- Virtual machines: list, create, lifecycle actions, upgrades, audits
- Snapshots and automated backup addon via instance upgrade
- Object storage and S3 credential management
- Secrets (passwords and SSH keys) with value redaction in responses
- Domains, handles, and availability checks
- OAuth2 password grant with token cache and 401 retry
- npm package `contabo-mcp` with `npx contabo-mcp` installation
- CI (build, test, pack check) and release workflow (npm + GitHub Release)

[1.0.1]: https://github.com/kieksme/mcp-contabo/releases/tag/1.0.1
[1.0.0]: https://github.com/kieksme/mcp-contabo/releases/tag/1.0.0
