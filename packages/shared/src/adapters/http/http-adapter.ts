import type { ApiAdapter, ApiRequest, ApiResponse, QueryValue } from "../../api/adapter";
import { ApiError } from "../../api/errors";

export interface HttpAdapterOptions {
  /** Origin of femxo-backend, or "" to call same-origin paths that Next forwards. */
  baseUrl: string;
  fetch?: typeof globalThis.fetch;
  timeoutMs?: number;
  /** Double-submit CSRF token, once the backend issues one (ADR 0005 notes it for cross-site setups). */
  csrfToken?: () => string | null;
}

function buildUrl(baseUrl: string, path: string, query: Record<string, QueryValue> = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) for (const item of value) params.append(key, item);
    else params.append(key, String(value));
  }
  const search = params.toString();
  return `${baseUrl}${path}${search ? `?${search}` : ""}`;
}

/**
 * Talks to femxo-backend over fetch: JSON, cookies included (the refresh
 * token is an httpOnly cookie), Bearer access token, Idempotency-Key on
 * writes, and a timeout so a dead network never hangs the UI.
 */
export function createHttpAdapter({ baseUrl, fetch = globalThis.fetch, timeoutMs = 10_000, csrfToken }: HttpAdapterOptions): ApiAdapter {
  return {
    async send(req: ApiRequest): Promise<ApiResponse> {
      const headers = new Headers({ Accept: "application/json" });
      if (req.body !== undefined) headers.set("Content-Type", "application/json");
      if (req.idempotencyKey) headers.set("Idempotency-Key", req.idempotencyKey);
      if (req.accessToken) headers.set("Authorization", `Bearer ${req.accessToken}`);
      const csrf = csrfToken?.();
      if (csrf) headers.set("X-CSRF-Token", csrf);

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      req.signal?.addEventListener("abort", () => controller.abort());

      try {
        const response = await fetch(buildUrl(baseUrl, req.path, req.query), {
          method: req.method,
          headers,
          body: req.body === undefined ? undefined : JSON.stringify(req.body),
          credentials: "include",
          signal: controller.signal,
        });
        const isJson = response.headers.get("content-type")?.includes("application/json");
        const body: unknown = isJson ? await response.json().catch(() => null) : null;
        return { status: response.status, body, headers: Object.fromEntries(response.headers.entries()) };
      } catch {
        // Offline, DNS failure, CORS rejection or our own timeout.
        throw new ApiError(0, "INTERNAL", "Couldn't reach Femxo. Check your connection and try again.");
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
