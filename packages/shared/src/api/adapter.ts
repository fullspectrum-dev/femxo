/*
 * The one seam between the storefront and its data. Domain clients build an
 * ApiRequest; an adapter delivers it: HttpAdapter over the network,
 * MockAdapter to in-browser handlers serving the same paths. Swapping the
 * adapter is the only change needed to connect femxo-backend.
 */

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export type QueryValue = string | number | boolean | readonly string[] | null | undefined;

export interface ApiRequest {
  method: HttpMethod;
  /** Path on the API, e.g. "/catalog/products/edible-oil-1l". */
  path: string;
  query?: Record<string, QueryValue>;
  body?: unknown;
  /** Required on writes (request() adds one if the caller didn't). */
  idempotencyKey?: string;
  accessToken?: string;
  signal?: AbortSignal;
}

export interface ApiResponse {
  status: number;
  body: unknown;
  /** Lower-case header names. */
  headers?: Record<string, string>;
}

export interface ApiAdapter {
  send(request: ApiRequest): Promise<ApiResponse>;
}

export const isWrite = (method: HttpMethod) => method !== "GET";
