export const AUTH_ACCOUNT_TYPES = [
  "dealer",
  "sub_dealer",
  "retail_partner",
  "customer",
] as const;

export type AuthAccountType = (typeof AUTH_ACCOUNT_TYPES)[number];
export type AuthPortalType = AuthAccountType | "super_admin";

export type AuthPurpose = "login" | "registration" | "password_reset";

export interface AuthChallenge {
  challengeId: string;
  expiresInSeconds: number;
  resendAfterSeconds: number;
  maskedDestination: string;
  demo?: boolean;
}

export interface ActiveAuthChallenge extends AuthChallenge {
  identifier: string;
  purpose: AuthPurpose;
  accountType: AuthPortalType;
}

export interface AuthRequestOptions {
  signal?: AbortSignal;
}
