import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPackageVersion } from "./version.js";

describe("loadPackageVersion", () => {
  it("matches package.json version", () => {
    const packagePath = join(
      dirname(fileURLToPath(import.meta.url)),
      "..",
      "package.json",
    );
    const pkg = JSON.parse(readFileSync(packagePath, "utf8")) as {
      version: string;
    };

    expect(loadPackageVersion()).toBe(pkg.version);
    expect(loadPackageVersion()).toMatch(/^\d+\.\d+\.\d+/);
  });
});
