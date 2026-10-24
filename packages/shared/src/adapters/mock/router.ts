import type { HttpMethod } from "../../api/adapter";
import type { Clock } from "../../lib/clock";
import type { Rng } from "../../lib/rng";

/** Query values as a server sees them: strings, or arrays for repeated keys. */
export type MockQuery = Record<string, string | string[] | undefined>;

export interface MockContext<S> {
  params: Record<string, string>;
  query: MockQuery;
  body: unknown;
  /** Writes get a draft that only sticks if the handler succeeds. */
  state: S;
  clock: Clock;
  rng: Rng;
  accessToken?: string;
  idempotencyKey?: string;
}

export interface MockResult {
  status: number;
  body?: unknown;
  headers?: Record<string, string>;
}

export type MockHandler<S> = (context: MockContext<S>) => MockResult | Promise<MockResult>;

interface Route<S> {
  method: HttpMethod;
  segments: string[];
  handler: MockHandler<S>;
}

/** REST-shaped routes ("/catalog/products/:slug"), matched like the backend's. */
export function createRouter<S>() {
  const routes: Route<S>[] = [];
  const add = (method: HttpMethod) => (pattern: string, handler: MockHandler<S>) => {
    routes.push({ method, segments: pattern.split("/").filter(Boolean), handler });
    return router;
  };

  const router = {
    get: add("GET"),
    post: add("POST"),
    patch: add("PATCH"),
    delete: add("DELETE"),
    match(method: HttpMethod, path: string) {
      const parts = path.split("?")[0]!.split("/").filter(Boolean);
      for (const route of routes) {
        if (route.method !== method || route.segments.length !== parts.length) continue;
        const params: Record<string, string> = {};
        const matched = route.segments.every((segment, index) => {
          if (segment.startsWith(":")) {
            params[segment.slice(1)] = decodeURIComponent(parts[index]!);
            return true;
          }
          return segment === parts[index];
        });
        if (matched) return { handler: route.handler, params };
      }
      return null;
    },
  };
  return router;
}

export type MockRouter<S> = ReturnType<typeof createRouter<S>>;
