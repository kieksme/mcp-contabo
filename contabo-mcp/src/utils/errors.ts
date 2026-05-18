export class ContaboApiError extends Error {
  readonly name = "ContaboApiError";

  constructor(
    public readonly status: number,
    public readonly requestId: string,
    message: string,
    public readonly hint = "Use audit list tools (e.g. contabo_instances_audits_list) with the x-request-id for more detail.",
  ) {
    super(message);
  }
}

export async function contaboErrorMessage(
  response: Response,
  requestId: string,
): Promise<string> {
  const error = await buildContaboApiError(response, requestId);
  return error.message;
}

export async function buildContaboApiError(
  response: Response,
  requestId: string,
): Promise<ContaboApiError> {
  let body: unknown;
  const text = await response.text();
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  const parts = [
    `Contabo API error ${response.status} ${response.statusText}`,
    `x-request-id: ${requestId}`,
  ];

  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    if (record.message) parts.push(`message: ${String(record.message)}`);
    if (record.statusCode) parts.push(`statusCode: ${String(record.statusCode)}`);
    if (record.data) parts.push(`data: ${JSON.stringify(record.data)}`);
  } else if (text) {
    parts.push(text.slice(0, 500));
  }

  parts.push(
    "Tip: use audit list tools (e.g. contabo_instances_audits_list) with the x-request-id for more detail.",
  );

  return new ContaboApiError(
    response.status,
    requestId,
    parts.join("\n"),
  );
}
