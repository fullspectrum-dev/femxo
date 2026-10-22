/*
 * Shapes returned by femxo-backend (modules/identity and modules/access).
 * Keep these in step with the backend; the client validates every response
 * against the schemas in services/auth-client.ts.
 */

/** PublicUser from modules/identity/src/user.repository.ts. */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  isSuperAdmin: boolean;
  status: "active" | "disabled";
  /** Set when an admin chose the password; the user must replace it first. */
  mustChangePassword: boolean;
  createdAt: string;
}

/** GET /access/me: what the user may do, and where. */
export interface AccessSummary {
  isSuperAdmin: boolean;
  permissions: string[];
  /** Names of the roles held, e.g. ["Dealer"]. Empty for Super Admins. */
  roles: string[];
  /** Assigned sales territories ("sales:<id>") and/or locations ("district:230"). */
  territoryIds: string[];
  /** The government locations those resolve to. */
  locationIds: string[];
}

/** GET /territories/:id: one location plus its ancestors, for breadcrumbs. */
export interface TerritoryTrail {
  territory: { id: string; type: string; name: string };
  ancestors: { id: string; type: string; name: string }[];
}

/** Error codes the backend sends as { error: { code, message } }. */
export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "ACCOUNT_DISABLED"
  | "TOO_MANY_ATTEMPTS"
  | "UNAUTHENTICATED"
  | "PASSWORD_CHANGE_REQUIRED"
  | "WRONG_PASSWORD"
  | "WEAK_PASSWORD"
  | "PASSWORD_UNCHANGED"
  | "VALIDATION_ERROR"
  | "FORBIDDEN"
  | "NETWORK"
  | "TIMEOUT"
  | "INVALID_RESPONSE"
  | "UNKNOWN";
