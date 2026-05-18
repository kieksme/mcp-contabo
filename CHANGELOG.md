# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.0.0]: https://github.com/kieksme/mcp-contabo/releases/tag/1.0.0
