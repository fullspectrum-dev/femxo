import type { z } from "zod";
import { ApiErrorBody } from "../contracts/common";
import { idempotencyKey } from "../lib/ids";
import { logger } from "../lib/logger";
import { isWrite, type ApiAdapter, type ApiRequest } from "./adapter";
import { ApiError } from "./errors";

/**
 * Sends a request and returns its body parsed with `schema`. Every write
 * carries an idempotency key, so a retried request can't act twice. A
 * success body that breaks the contract is an error, never data: contract
 * drift between the mock and the backend shows up immediately.
 */
export async function request<T extends z.ZodType>(adapter: ApiAdapter, req: ApiRequest, schema: T): Promise<z.infer<T>>;
export async function request(adapter: ApiAdapter, req: ApiRequest): Promise<undefined>;
export async function request(adapter: ApiAdapter, req: ApiRequest, schema?: z.ZodType): Promise<unknown> {
  const sent = isWrite(req.method) ? { ...req, idempotencyKey: req.idempotencyKey ?? idempotencyKey() } : req;
  const response = await adapter.send(sent);

  if (response.status >= 200 && response.status < 300) {
    if (!schema) return undefined;
    const parsed = schema.safeParse(response.body);
    if (parsed.success) return parsed.data;
    logger.error(`Contract violation: ${req.method} ${req.path}`, parsed.error.issues);
    throw new ApiError(response.status, "INTERNAL", `The response to ${req.method} ${req.path} doesn't match the API contract.`);
  }

  const retryAfter = Number(response.headers?.["retry-after"]);
  const envelope = ApiErrorBody.safeParse(response.body);
  if (envelope.success) {
    const { code, message, details } = envelope.data.error;
    throw new ApiError(response.status, code, message, details, Number.isFinite(retryAfter) ? retryAfter : undefined);
  }
  throw new ApiError(response.status, "INTERNAL", `Request failed with status ${response.status}.`);
}
