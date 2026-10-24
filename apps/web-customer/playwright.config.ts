import { defineConfig, devices } from "@playwright/test";

// The storefront on its mock API (NEXT_PUBLIC_API_MODE=mock, the default).
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  // A dev server compiles each page on its first visit.
  expect: { timeout: 15_000 },
  use: {
    baseURL: "http://127.0.0.1:3022",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "phone", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } } },
    { name: "tablet", use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
  ],
  webServer: {
    command: "pnpm exec next dev --hostname 127.0.0.1 --port 3022",
    url: "http://127.0.0.1:3022",
    // Always a fresh server: a warm leftover one hides cold-start problems.
    reuseExistingServer: false,
    timeout: 120_000,
    env: { NEXT_DIST_DIR: ".next-e2e", NEXT_PUBLIC_API_MODE: "mock" },
  },
});
