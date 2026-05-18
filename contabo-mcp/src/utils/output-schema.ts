import { z } from "zod";

/** Default loose schema for Contabo API JSON responses. */
export const defaultOutputSchema = {
  data: z.unknown().optional().describe("Response data array or object"),
  _links: z.unknown().optional().describe("Pagination links when present"),
  _pagination: z.unknown().optional().describe("Pagination metadata when present"),
  _requestId: z
    .string()
    .optional()
    .describe("x-request-id for this API call"),
  _meta: z.unknown().optional(),
} as const;
