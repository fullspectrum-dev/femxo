import type { NextConfig } from "next";

const productionDemoModeEnabled =
  process.env.NEXT_PUBLIC_AUTH_DEMO_MODE === "true";

const nextConfig: NextConfig = {
  /* config options here */
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    qualities: [50, 75],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    resolveAlias:
      process.env.NODE_ENV === "production" && !productionDemoModeEnabled
        ? {
            "@/features/auth/services/demo-auth":
              "./src/features/auth/services/demo-auth-disabled.ts",
          }
        : {},
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;