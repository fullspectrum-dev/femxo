import { describe, expect, it } from "vitest";
import { resolveApiMode } from "./mode";

describe("resolveApiMode", () => {
  it("defaults to mock until the backend is connected", () => {
    expect(resolveApiMode(undefined)).toBe("mock");
    expect(resolveApiMode("")).toBe("mock");
  });

  it("accepts the two modes", () => {
    expect(resolveApiMode("mock")).toBe("mock");
    expect(resolveApiMode("http")).toBe("http");
  });

  it("fails loudly on anything else, so a typo never ships mock data", () => {
    expect(() => resolveApiMode("htp")).toThrow(/NEXT_PUBLIC_API_MODE/);
  });
});
