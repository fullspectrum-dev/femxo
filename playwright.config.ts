import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "auth.spec.ts",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3001",
    trace: "retain-on-failure",
    permissions: ["clipboard-read", "clipboard-write"],
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm run dev --hostname 127.0.0.1",
    url: "http://127.0.0.1:3001",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXT_DIST_DIR: ".next-e2e",
      NEXT_PUBLIC_AUTH_DEMO_MODE: "false",
    },
  },
});
