/** Which API the storefront talks to: the in-browser mock, or the real backend. */
export type ApiMode = "mock" | "http";

/**
 * Mock until the backend is connected. Anything other than the two modes
 * throws, so a typo in the build env can never quietly ship mock data.
 */
export function resolveApiMode(value: string | undefined): ApiMode {
  if (value === undefined || value === "") return "mock";
  if (value === "mock" || value === "http") return value;
  throw new Error(`NEXT_PUBLIC_API_MODE must be "mock" or "http", got "${value}".`);
}

// The one place the mode is read. Next inlines NEXT_PUBLIC_* at build time.
export const apiMode: ApiMode = resolveApiMode(process.env.NEXT_PUBLIC_API_MODE);
