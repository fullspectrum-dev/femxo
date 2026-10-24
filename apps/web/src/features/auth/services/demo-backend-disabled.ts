import type { Transport } from "./auth-client";
import type { DemoAccount } from "./demo-backend";

// Swapped in for demo-backend.ts in production builds (see next.config.ts),
// so the demo accounts and passwords never ship to real users.

export const DEMO_ACCOUNTS: DemoAccount[] = [];

export const demoTransport: Transport = () => {
  throw new Error("Demo authentication is not enabled for this production build.");
};
