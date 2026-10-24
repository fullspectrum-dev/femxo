import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: ["auth-demo.spec.ts", "admin-demo.spec.ts"],
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  // A dev server compiles each page on its first visit, so the first
  // navigation to a route can take longer than the 5 s default.
  expect: { timeout: 15_000 },
  use: {
    baseURL: "http://127.0.0.1:3012",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium-demo",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm exec next dev --hostname 127.0.0.1 --port 3012",
    url: "http://127.0.0.1:3012",
    // Its own port, so a `pnpm dev` on 3001 (demo mode, other env) is never reused.
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXT_DIST_DIR: ".next-demo",
      NEXT_PUBLIC_AUTH_DEMO_MODE: "true",
    },
  },
});
