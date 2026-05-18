import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export function loadPackageVersion(): string {
  const packagePath = join(
    dirname(fileURLToPath(import.meta.url)),
    "..",
    "package.json",
  );
  const pkg = JSON.parse(readFileSync(packagePath, "utf8")) as {
    version: string;
  };
  return pkg.version;
}
