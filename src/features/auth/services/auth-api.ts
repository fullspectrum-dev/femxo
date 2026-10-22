import { createAuthClient, fetchTransport, type Transport } from "./auth-client";
import { isAuthDemoMode } from "./demo-mode";

// The demo backend is loaded only when demo mode is on, and production
// builds alias it to a stub (next.config.ts), so it never ships by accident.
const demoTransport: Transport = async (request) => {
  const { demoTransport: transport } = await import("@/features/auth/services/demo-backend");
  return transport(request);
};

/** The app's one auth client: it holds the in-memory access token. */
export const authApi = createAuthClient(isAuthDemoMode ? demoTransport : fetchTransport);
