import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { createHttpAdapter } from "../adapters/http/http-adapter";
import { ApiError } from "./errors";
import { request } from "./request";
import type { ApiAdapter, ApiRequest } from "./adapter";

const Thing = z.object({ id: z.string(), qty: z.number().int() });

function adapterReturning(status: number, body: unknown, headers: Record<string, string> = {}) {
  const send = vi.fn(async (_request: ApiRequest) => ({ status, body, headers }));
  return { send } satisfies ApiAdapter;
}

describe("request()", () => {
  it("returns the body parsed with the response schema", async () => {
    const adapter = adapterReturning(200, { id: "t1", qty: 2, extra: "dropped" });
    await expect(request(adapter, { method: "GET", path: "/things/t1" }, Thing)).resolves.toEqual({ id: "t1", qty: 2 });
  });

  it("treats a response that breaks the contract as an error, not data", async () => {
    const adapter = adapterReturning(200, { id: "t1", qty: "two" });
    const error = await request(adapter, { method: "GET", path: "/things/t1" }, Thing).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ code: "INTERNAL", status: 200 });
    expect((error as ApiError).message).toMatch(/contract/i);
  });

  it("turns the error envelope into a typed ApiError with details and Retry-After", async () => {
    const adapter = adapterReturning(429, { error: { code: "RATE_LIMITED", message: "Try later", details: { attemptsLeft: 0 } } }, { "retry-after": "900" });
    const error = await request(adapter, { method: "POST", path: "/auth/otp/verify", body: {} }, Thing).catch((e: unknown) => e);
    expect(error).toMatchObject({ status: 429, code: "RATE_LIMITED", details: { attemptsLeft: 0 }, retryAfterSeconds: 900 });
  });

  it("still fails cleanly when an error body isn't the envelope", async () => {
    const adapter = adapterReturning(502, "<html>Bad gateway</html>");
    await expect(request(adapter, { method: "GET", path: "/x" }, Thing)).rejects.toMatchObject({ status: 502, code: "INTERNAL" });
  });

  it("gives every write an idempotency key, and keeps one the caller chose", async () => {
    const adapter = adapterReturning(200, { id: "t1", qty: 1 });
    await request(adapter, { method: "POST", path: "/cart/items", body: { qty: 1 } }, Thing);
    await request(adapter, { method: "PATCH", path: "/cart/items/1", body: { qty: 2 }, idempotencyKey: "fixed-key" }, Thing);
    await request(adapter, { method: "GET", path: "/cart" }, Thing);
    const [first, second, third] = adapter.send.mock.calls.map(([sent]) => sent);
    expect(first!.idempotencyKey).toMatch(/^[0-9a-f-]{36}$/);
    expect(second!.idempotencyKey).toBe("fixed-key");
    expect(third!.idempotencyKey).toBeUndefined();
  });

  it("returns undefined for an empty success when no schema is given", async () => {
    const adapter = adapterReturning(204, null);
    await expect(request(adapter, { method: "DELETE", path: "/wishlist/p1" })).resolves.toBeUndefined();
  });
});

describe("HttpAdapter", () => {
  function fakeFetch(response: Response) {
    return vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => response);
  }

  it("sends JSON with cookies, the idempotency key, the access token and the CSRF token", async () => {
    const fetch = fakeFetch(new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } }));
    const adapter = createHttpAdapter({ baseUrl: "https://api.femxo.test", fetch, csrfToken: () => "csrf-1" });
    const response = await adapter.send({
      method: "POST",
      path: "/cart/items",
      query: { brand: ["a", "b"], prime: true, skip: undefined },
      body: { variantId: "v1", quantity: 2 },
      idempotencyKey: "key-1",
      accessToken: "token-1",
    });
    const [url, init] = fetch.mock.calls[0]!;
    expect(String(url)).toBe("https://api.femxo.test/cart/items?brand=a&brand=b&prime=true");
    expect(init).toMatchObject({ method: "POST", credentials: "include", body: JSON.stringify({ variantId: "v1", quantity: 2 }) });
    expect(new Headers(init!.headers).get("Idempotency-Key")).toBe("key-1");
    expect(new Headers(init!.headers).get("Authorization")).toBe("Bearer token-1");
    expect(new Headers(init!.headers).get("X-CSRF-Token")).toBe("csrf-1");
    expect(new Headers(init!.headers).get("Content-Type")).toBe("application/json");
    expect(response).toEqual({ status: 200, body: { ok: true }, headers: { "content-type": "application/json" } });
  });

  it("reads a non-JSON body as null instead of crashing", async () => {
    const fetch = fakeFetch(new Response("<html/>", { status: 502, headers: { "content-type": "text/html" } }));
    const response = await createHttpAdapter({ baseUrl: "https://api.femxo.test", fetch }).send({ method: "GET", path: "/x" });
    expect(response).toMatchObject({ status: 502, body: null });
  });

  it("times out with an ApiError instead of hanging", async () => {
    const fetch = vi.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_, reject) => init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError"))))
    );
    const adapter = createHttpAdapter({ baseUrl: "https://api.femxo.test", fetch, timeoutMs: 20 });
    await expect(adapter.send({ method: "GET", path: "/slow" })).rejects.toMatchObject({ code: "INTERNAL", status: 0 });
  });
});
