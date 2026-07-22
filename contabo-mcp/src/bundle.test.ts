import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const bundlePath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../dist/index.js",
);

describe("published bundle", () => {
  it("does not ship ajv compile or dynamic code generation", () => {
    const bundle = readFileSync(bundlePath, "utf8");
    expect(bundle).not.toMatch(/ajv\/dist\/compile/);
    expect(bundle).not.toMatch(/node_modules\/ajv/);
    expect(bundle).not.toMatch(/\beval\s*\(/);
  });
});
