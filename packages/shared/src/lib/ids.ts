/** "ord-3f9c2a1b7e40": an opaque, prefixed id for records the mock creates. */
export function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

/** A fresh key for one write attempt; resending the same attempt reuses it. */
export function idempotencyKey() {
  return crypto.randomUUID();
}
