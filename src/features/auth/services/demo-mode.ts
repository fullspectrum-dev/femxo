const isProduction = process.env.NODE_ENV === "production";
const isDemoModeExplicitlyEnabled =
  process.env.NEXT_PUBLIC_AUTH_DEMO_MODE === "true";
const isDemoModeExplicitlyDisabled =
  process.env.NEXT_PUBLIC_AUTH_DEMO_MODE === "false";

export const isAuthDemoMode =
  !isDemoModeExplicitlyDisabled &&
  (!isProduction || isDemoModeExplicitlyEnabled);
