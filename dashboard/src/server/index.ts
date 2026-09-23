import { loadDashboardConfig } from "./config.js";
import { createDashboardMcpClient } from "./mcp/client.js";
import { createApp } from "./app.js";

async function main(): Promise<void> {
  const config = loadDashboardConfig();
  const mcpClient = await createDashboardMcpClient();
  const app = await createApp(config, mcpClient);

  app.listen(config.port, () => {
    console.log(`contabo-dashboard listening on port ${config.port}`);
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
