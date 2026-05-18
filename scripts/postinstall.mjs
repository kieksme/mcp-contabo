import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const distEntry = join(root, "contabo-mcp", "dist", "index.js");

if (existsSync(distEntry)) {
  process.exit(0);
}

function run(command) {
  execSync(command, { cwd: root, stdio: "inherit" });
}

try {
  run("corepack enable");
  run("corepack prepare pnpm@10.33.3 --activate");
} catch {
  // Corepack may already be enabled or unavailable; pnpm might still be on PATH.
}

try {
  run("pnpm --dir contabo-mcp install --frozen-lockfile");
  run("pnpm --dir contabo-mcp build");
} catch (error) {
  console.error(
    "\ncontabo-mcp: Failed to build. Install pnpm (Node 20+ includes Corepack) or clone the repo and run:\n  cd contabo-mcp && pnpm install && pnpm build\n",
  );
  throw error;
}
