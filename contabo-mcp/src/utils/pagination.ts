import { z } from "zod";

export const paginationFields = {
  page: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe("Page number (1-based)"),
  size: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe(
      "Items per page (API default if omitted; use 25 for smaller responses)",
    ),
  orderBy: z
    .string()
    .optional()
    .describe("Sort field (API-specific, e.g. displayName)"),
  order: z
    .enum(["asc", "desc"])
    .optional()
    .describe("Sort direction"),
};

export const traceIdField = {
  xTraceId: z
    .string()
    .optional()
    .describe("Optional x-trace-id header for request correlation"),
};

export function paginationQuery(
  args: Record<string, unknown>,
): Record<string, string> {
  const query: Record<string, string> = {};
  if (args.page != null) query.page = String(args.page);
  if (args.size != null) query.size = String(args.size);
  if (args.orderBy != null) query.orderBy = String(args.orderBy);
  if (args.order != null) query.order = String(args.order);
  return query;
}

export function mergeQuery(
  base: Record<string, unknown>,
  extra?: Record<string, unknown>,
): Record<string, string> {
  const query = paginationQuery(base);
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value != null && value !== "") {
        query[key] = String(value);
      }
    }
  }
  return query;
}
