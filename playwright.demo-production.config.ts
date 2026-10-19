import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "auth-demo.spec.ts",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3005",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium-production-demo",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command:
      "pnpm run build && pnpm run start --hostname 127.0.0.1 --port 3005",
    url: "http://127.0.0.1:3005",
    reuseExistingServer: false,
    timeout: 240_000,
    env: {
      NEXT_DIST_DIR: ".next-demo-production",
      NEXT_PUBLIC_AUTH_DEMO_MODE: "true",
    },
  },
});
