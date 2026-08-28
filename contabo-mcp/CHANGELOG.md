# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.3](https://github.com/kieksme/mcp-contabo/compare/1.5.2...1.5.3) (2026-08-28)


### Changed

* add Cursor and VS Code install buttons to README ([a2a1f68](https://github.com/kieksme/mcp-contabo/commit/a2a1f68cc600ad2ffe7fed533087828768a21b48))
* **contabo-mcp:** add handler coverage for tool modules ([6f78a32](https://github.com/kieksme/mcp-contabo/commit/6f78a32deb156b0202574f6213adc386eb3d8296))
* **contabo-mcp:** add handler coverage for tool modules ([2d2f7ab](https://github.com/kieksme/mcp-contabo/commit/2d2f7ab4736acba30439d54b547ea4a689b9189b))
* **contabo-mcp:** add Railway deploy config and template guide ([1da2f2a](https://github.com/kieksme/mcp-contabo/commit/1da2f2a62e5ef567daed56a28a503e5ab31b07d3))

## [1.5.2](https://github.com/kieksme/mcp-contabo/compare/1.5.1...1.5.2) (2026-07-28)


### Changed

* fix inaccurate credential storage claim in plugin install docs ([d36a9cb](https://github.com/kieksme/mcp-contabo/commit/d36a9cbac6e1ee9b89a97d296f69c3254fd385f4))

## [1.5.1](https://github.com/kieksme/mcp-contabo/compare/1.5.0...1.5.1) (2026-07-22)


### Fixed

* **deps:** patch transitive CVEs to raise Socket.dev score ([713f24d](https://github.com/kieksme/mcp-contabo/commit/713f24da13ee208fb980ba64a92c075d226b1213))


### Changed

* also publish npm package to GitHub Packages ([cfb9b8e](https://github.com/kieksme/mcp-contabo/commit/cfb9b8ec49e747e29f7a733d0f3a92a1dc056de0))

## [1.5.0](https://github.com/kieksme/mcp-contabo/compare/1.4.0...1.5.0) (2026-07-22)


### Added

* add remote Streamable HTTP transport with bearer auth and Docker/GHCR publishing ([b8f3e0e](https://github.com/kieksme/mcp-contabo/commit/b8f3e0e3ed4ecb4246f426ccdd476da76ed53adc))

## [1.4.0](https://github.com/kieksme/mcp-contabo/compare/1.3.0...1.4.0) (2026-07-17)


### Added

* **mcp:** add images, DNS, networking, VIPs, and tags tools ([#17](https://github.com/kieksme/mcp-contabo/issues/17)) ([eaeb177](https://github.com/kieksme/mcp-contabo/commit/eaeb1779d39323b1fafc607e2aaf60d4d030c4e2))


### Changed

* **deps:** bump typescript, vitest, tsx, and @types/node ([#15](https://github.com/kieksme/mcp-contabo/issues/15)) ([555f250](https://github.com/kieksme/mcp-contabo/commit/555f2501951f8fc0adc76cb13c57290e9a03d3b2))

## [1.3.0](https://github.com/kieksme/mcp-contabo/compare/1.2.1...1.3.0) (2026-05-19)


### Added

* **auth.ts, client.ts:** enforce allowed Contabo URLs with assertAllowedContaboUrl ([8085ef6](https://github.com/kieksme/mcp-contabo/commit/8085ef6a2990a4b9b476a6b544cf9971282b0342))
* **config:** introduce environment variable management for Contabo ([8085ef6](https://github.com/kieksme/mcp-contabo/commit/8085ef6a2990a4b9b476a6b544cf9971282b0342))


### Changed

* **config.test.ts:** add tests for custom URL handling and CONTABO_ALLOW_CUSTOM_HOSTS environment variable ([8085ef6](https://github.com/kieksme/mcp-contabo/commit/8085ef6a2990a4b9b476a6b544cf9971282b0342))
* **config:** add tests for URL validation and environment variable handling ([8085ef6](https://github.com/kieksme/mcp-contabo/commit/8085ef6a2990a4b9b476a6b544cf9971282b0342))
* **CONTRIBUTING.md:** add section on Socket.dev supply chain alerts ([8085ef6](https://github.com/kieksme/mcp-contabo/commit/8085ef6a2990a4b9b476a6b544cf9971282b0342))
* **package.json:** include SECURITY.md in package files ([8085ef6](https://github.com/kieksme/mcp-contabo/commit/8085ef6a2990a4b9b476a6b544cf9971282b0342))
* **README.md:** include security and Socket.dev alert information ([8085ef6](https://github.com/kieksme/mcp-contabo/commit/8085ef6a2990a4b9b476a6b544cf9971282b0342))
* **README.md:** remove unnecessary newline for improved formatting ([0cbbc14](https://github.com/kieksme/mcp-contabo/commit/0cbbc147980f5297a68bec4bcf9e6b63d778763b))
* **README.md:** update Socket Badge link to use new domain for improved accuracy ([0a0c95a](https://github.com/kieksme/mcp-contabo/commit/0a0c95a69971ce66b32a845d7ede85d899c86ecc))
* **SECURITY.md:** create security policy document detailing expected capabilities, environment variables, network endpoints, secret handling, and reporting vulnerabilities ([8085ef6](https://github.com/kieksme/mcp-contabo/commit/8085ef6a2990a4b9b476a6b544cf9971282b0342))
* **socket.yml:** configure PR alerts for package manifest changes ([8085ef6](https://github.com/kieksme/mcp-contabo/commit/8085ef6a2990a4b9b476a6b544cf9971282b0342))

## [1.2.1](https://github.com/kieksme/mcp-contabo/compare/1.2.0...1.2.1) (2026-05-19)


### Changed

* **dependencies:** update package versions and improve README formatting ([73e315e](https://github.com/kieksme/mcp-contabo/commit/73e315e74c95387ff63da50058cf5a0656af7b0b))
* **README.md:** add Socket Badge to README for enhanced visibility of package status ([f115c06](https://github.com/kieksme/mcp-contabo/commit/f115c06c871a16964f887c0891da4c1aecea7d19))

## [1.2.0](https://github.com/kieksme/mcp-contabo/compare/1.1.2...1.2.0) (2026-05-18)


### Added

* **annotations:** introduce new annotation utilities for tool configuration ([7d611f1](https://github.com/kieksme/mcp-contabo/commit/7d611f1f4fc3bc0982878a5b0a361d36857b6428))
* **domains.ts, instances.ts:** replace annotation hints with explicit annotations for better clarity and consistency ([7d611f1](https://github.com/kieksme/mcp-contabo/commit/7d611f1f4fc3bc0982878a5b0a361d36857b6428))
* **index.ts:** dynamically load package version using loadPackageVersion function ([7d611f1](https://github.com/kieksme/mcp-contabo/commit/7d611f1f4fc3bc0982878a5b0a361d36857b6428))
* **tool-errors:** add tool error formatting and schema ([7d611f1](https://github.com/kieksme/mcp-contabo/commit/7d611f1f4fc3bc0982878a5b0a361d36857b6428))
* **tool-registry:** integrate output schema and error formatting ([7d611f1](https://github.com/kieksme/mcp-contabo/commit/7d611f1f4fc3bc0982878a5b0a361d36857b6428))
* **utils:** add output schema for Contabo API responses ([7d611f1](https://github.com/kieksme/mcp-contabo/commit/7d611f1f4fc3bc0982878a5b0a361d36857b6428))
* **version.ts:** add utility to load package version from package.json ([7d611f1](https://github.com/kieksme/mcp-contabo/commit/7d611f1f4fc3bc0982878a5b0a361d36857b6428))


### Fixed

* **errors.ts:** create ContaboApiError class for better error handling ([7d611f1](https://github.com/kieksme/mcp-contabo/commit/7d611f1f4fc3bc0982878a5b0a361d36857b6428))
* **pagination:** clarify items per page description ([7d611f1](https://github.com/kieksme/mcp-contabo/commit/7d611f1f4fc3bc0982878a5b0a361d36857b6428))
* **response:** enhance sensitive data redaction logic ([7d611f1](https://github.com/kieksme/mcp-contabo/commit/7d611f1f4fc3bc0982878a5b0a361d36857b6428))


### Changed

* add npm version badge to README files ([b6c67c8](https://github.com/kieksme/mcp-contabo/commit/b6c67c868849e6eb133843d22d065b717132494b))
* **ci.yml:** add MCP build smoke test to verify version and tool registration ([7d611f1](https://github.com/kieksme/mcp-contabo/commit/7d611f1f4fc3bc0982878a5b0a361d36857b6428))
* **client.ts:** replace contaboErrorMessage with buildContaboApiError for error handling ([7d611f1](https://github.com/kieksme/mcp-contabo/commit/7d611f1f4fc3bc0982878a5b0a361d36857b6428))
* **evaluations:** update evaluation questions and answers for MCP tools ([7d611f1](https://github.com/kieksme/mcp-contabo/commit/7d611f1f4fc3bc0982878a5b0a361d36857b6428))
* **instances-list.test.ts:** add test for listing instances with pagination to ensure correct API call and response handling ([7d611f1](https://github.com/kieksme/mcp-contabo/commit/7d611f1f4fc3bc0982878a5b0a361d36857b6428))
* **instances-list.test.ts:** update query parameter types to strings for consistency with API expectations ([adeb177](https://github.com/kieksme/mcp-contabo/commit/adeb177eb569c75674f30a741ddeb4f521f9d102))
* **README.md:** add evaluations section for agent testing scenarios ([7d611f1](https://github.com/kieksme/mcp-contabo/commit/7d611f1f4fc3bc0982878a5b0a361d36857b6428))
* **README.md:** expand tool annotations and error payloads sections ([7d611f1](https://github.com/kieksme/mcp-contabo/commit/7d611f1f4fc3bc0982878a5b0a361d36857b6428))
* **response:** add test for redacting S3 credentials ([7d611f1](https://github.com/kieksme/mcp-contabo/commit/7d611f1f4fc3bc0982878a5b0a361d36857b6428))
* **tool-errors:** add tests for tool error formatting ([7d611f1](https://github.com/kieksme/mcp-contabo/commit/7d611f1f4fc3bc0982878a5b0a361d36857b6428))
* **tools.test.ts:** add test to verify MCP annotations on tools ([7d611f1](https://github.com/kieksme/mcp-contabo/commit/7d611f1f4fc3bc0982878a5b0a361d36857b6428))
* **tools.test.ts:** enhance tool annotation checks to ensure presence of at least one MCP hint for better test coverage ([adeb177](https://github.com/kieksme/mcp-contabo/commit/adeb177eb569c75674f30a741ddeb4f521f9d102))
* **version:** add test for package version loading ([7d611f1](https://github.com/kieksme/mcp-contabo/commit/7d611f1f4fc3bc0982878a5b0a361d36857b6428))

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
