import { MAX_PAGE_SIZE } from "../../contracts/common";
import { MockHttpError } from "./errors";
import type { MockQuery } from "./router";

/*
 * Cursor pagination as the backend does it: opaque cursors, a default page
 * of 24, never more than 100 items (Cross-Phase rule). Cursors are base64 so
 * callers can't treat them as page numbers.
 */

const encode = (offset: number) => btoa(`o:${offset}`);

function decode(cursor: string) {
  try {
    const match = /^o:(\d+)$/.exec(atob(cursor));
    if (match) return Number(match[1]);
  } catch {
    // Not base64: fall through to the error.
  }
  throw new MockHttpError(422, "VALIDATION_FAILED", "Invalid cursor.", { fields: { cursor: "Invalid cursor" } });
}

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/** The page of `items` the query asks for, as `{ items, nextCursor }`. */
export function paginate<T>(items: readonly T[], query: MockQuery, defaultLimit = 24) {
  const rawLimit = single(query.limit);
  const limit = rawLimit === undefined ? defaultLimit : Number(rawLimit);
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PAGE_SIZE) {
    throw new MockHttpError(422, "VALIDATION_FAILED", `limit must be 1–${MAX_PAGE_SIZE}.`, { fields: { limit: `Must be 1–${MAX_PAGE_SIZE}` } });
  }
  const cursor = single(query.cursor);
  const offset = cursor ? decode(cursor) : 0;
  const next = offset + limit;
  return { items: items.slice(offset, next), nextCursor: next < items.length ? encode(next) : null };
}
