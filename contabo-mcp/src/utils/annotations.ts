import type { ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";

/** Read-only list/get/stats/audit tools. */
export const readOnly: ToolAnnotations = { readOnlyHint: true };

/** Read-only tools that query live external account state. */
export const readOnlyOpenWorld: ToolAnnotations = {
  readOnlyHint: true,
  openWorldHint: true,
};

/** Creates or updates without tearing down resources (e.g. start instance). */
export const writeNonDestructive: ToolAnnotations = { destructiveHint: false };

/** Purchases, registrations, or billing-impacting changes. */
export const writeBilling: ToolAnnotations = {
  destructiveHint: true,
  openWorldHint: true,
};

/** Writes credentials or other sensitive configuration. */
export const writeSensitive: ToolAnnotations = { destructiveHint: true };

/** Stops, deletes, reinstalls, or other irreversible instance changes. */
export const destructive: ToolAnnotations = { destructiveHint: true };

/** DELETE operations that are safe to retry with the same id. */
export const destructiveIdempotent: ToolAnnotations = {
  destructiveHint: true,
  idempotentHint: true,
};

/** Power actions that disrupt running workloads (restart, rescue, shutdown). */
export const powerAction: ToolAnnotations = { destructiveHint: true };
