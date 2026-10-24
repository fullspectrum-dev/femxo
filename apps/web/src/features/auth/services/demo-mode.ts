/**
 * Demo mode: sign-in runs in the browser on dummy data, with no backend.
 *
 * It is on everywhere (local and production) until the backend is connected.
 * To connect it, build with NEXT_PUBLIC_AUTH_DEMO_MODE=false and set
 * FEMXO_API_ORIGIN (see next.config.ts and the README).
 */
export const isAuthDemoMode = process.env.NEXT_PUBLIC_AUTH_DEMO_MODE !== "false";
