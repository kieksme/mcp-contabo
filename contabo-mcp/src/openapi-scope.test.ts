import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const specPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../openapi/contabo.openapi.json",
);

const REQUIRED_PATHS = [
  "/v1/compute/instances",
  "/v1/compute/instances/{instanceId}",
  "/v1/compute/instances/{instanceId}/actions/start",
  "/v1/compute/instances/{instanceId}/snapshots",
  "/v1/compute/instances/{instanceId}/snapshots/{snapshotId}/rollback",
  "/v1/object-storages",
  "/v1/object-storages/{objectStorageId}/resize",
  "/v1/secrets",
  "/v1/secrets/{secretId}",
  "/v1/domains",
  "/v1/domains/{domain}",
  "/v1/registries-domains/{domain}/check-availability",
  "/v1/domains/handles",
];

describe("vendored OpenAPI spec", () => {
  const spec = JSON.parse(readFileSync(specPath, "utf8")) as {
    paths: Record<string, unknown>;
  };

  it("includes all MCP-scoped API paths", () => {
    for (const path of REQUIRED_PATHS) {
      expect(spec.paths, `missing path ${path}`).toHaveProperty(path);
    }
  });

  it("covers domain APIs (not present in outdated JSR snapshot)", () => {
    const domainPaths = Object.keys(spec.paths).filter((p) =>
      p.includes("/domains"),
    );
    expect(domainPaths.length).toBeGreaterThanOrEqual(5);
  });
});
