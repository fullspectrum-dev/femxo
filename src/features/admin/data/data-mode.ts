/**
 * The admin panel runs on built-in sample data until femxo-backend's admin
 * APIs exist. While it does, every screen says so ("Prototype data"), so
 * sample figures never pass for live ones. Build with
 * NEXT_PUBLIC_ADMIN_DATA_MODE=live once the API client replaces mock-api.ts.
 */
export const isAdminPrototype = process.env.NEXT_PUBLIC_ADMIN_DATA_MODE !== "live";
