import type {
  AuthAccountType,
  AuthChallenge,
  AuthPortalType,
  AuthPurpose,
} from "../types/auth";
import type { RegisterPayload } from "./auth-api";

export const DEMO_OTP = "123456";

export interface DemoCredentials {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  accountType: AuthPortalType;
}

export const DEMO_CREDENTIALS: Partial<Record<AuthPortalType, DemoCredentials>> = {
  customer: {
    fullName: "Demo Customer",
    email: "customer@demo.femxo.test",
    mobile: "9876543211",
    password: "CustomerDemo123!",
    accountType: "customer",
  },
  dealer: {
    fullName: "Demo Dealer",
    email: "dealer@demo.femxo.test",
    mobile: "9876543212",
    password: "DealerDemo123!",
    accountType: "dealer",
  },
  sub_dealer: {
    fullName: "Demo Sub-dealer",
    email: "subdealer@demo.femxo.test",
    mobile: "9876543213",
    password: "SubDealerDemo123!",
    accountType: "sub_dealer",
  },
  super_admin: {
    fullName: "Demo Super Admin",
    email: "superadmin@demo.femxo.test",
    mobile: "9876543214",
    password: "SuperAdminDemo123!",
    accountType: "super_admin",
  },
};

interface DemoChallenge extends AuthChallenge {
  purpose: AuthPurpose;
  accountType: AuthPortalType;
  identifier: string;
}

const demoAccounts = new Map<string, DemoCredentials>();
const demoChallenges = new Map<string, DemoChallenge>();
const resetGrants = new Map<string, string>();
let challengeSequence = 0;

for (const credentials of Object.values(DEMO_CREDENTIALS)) {
  if (credentials) demoAccounts.set(credentials.email, { ...credentials });
}

function createChallenge(
  identifier: string,
  purpose: AuthPurpose,
  accountType: AuthPortalType
): DemoChallenge {
  challengeSequence += 1;
  const challenge: DemoChallenge = {
    challengeId: `demo-challenge-${challengeSequence}`,
    expiresInSeconds: 300,
    resendAfterSeconds: 0,
    maskedDestination: `Demo only · code ${DEMO_OTP}`,
    demo: true,
    purpose,
    accountType,
    identifier,
  };
  demoChallenges.set(challenge.challengeId, challenge);
  return challenge;
}

function findAccount(identifier: string, accountType: AuthPortalType) {
  const normalizedIdentifier = identifier.trim().toLowerCase();
  return [...demoAccounts.values()].find(
    (account) =>
      account.accountType === accountType &&
      (account.email.toLowerCase() === normalizedIdentifier ||
        account.mobile === normalizedIdentifier)
  );
}

export const demoAuth = {
  register(payload: RegisterPayload): AuthChallenge {
    const credentials: DemoCredentials = {
      fullName: payload.fullName,
      email: payload.email.toLowerCase(),
      mobile: payload.mobile,
      password: payload.password,
      accountType: payload.accountType,
    };
    demoAccounts.set(credentials.email, credentials);
    return createChallenge(
      credentials.mobile,
      "registration",
      credentials.accountType
    );
  },

  requestLoginOtp(mobile: string, accountType: AuthPortalType): AuthChallenge {
    if (!findAccount(mobile, accountType)) {
      throw new Error(
        "No demo account matches this mobile number and account type."
      );
    }
    return createChallenge(mobile, "login", accountType);
  },

  loginWithPassword(payload: {
    email: string;
    password: string;
    accountType: AuthPortalType;
  }) {
    const account = findAccount(payload.email, payload.accountType);
    if (!account || account.password !== payload.password) {
      throw new Error(
        "Those details do not match a local demo account for this portal."
      );
    }
    return { authenticated: true as const };
  },

  verifyOtp(payload: {
    challengeId: string;
    code: string;
    purpose: AuthPurpose;
    accountType: AuthPortalType;
  }) {
    const challenge = demoChallenges.get(payload.challengeId);
    if (
      !challenge ||
      challenge.purpose !== payload.purpose ||
      challenge.accountType !== payload.accountType ||
      payload.code !== DEMO_OTP
    ) {
      throw new Error(`Enter the demo verification code ${DEMO_OTP}.`);
    }

    if (challenge.purpose === "password_reset") {
      const account = findAccount(challenge.identifier, challenge.accountType);
      const resetGrant = `demo-reset-${challenge.challengeId}`;
      if (account) resetGrants.set(resetGrant, account.email);
      return { verified: true as const, resetGrant };
    }
    demoChallenges.delete(challenge.challengeId);
    return { verified: true as const };
  },

  resendOtp(payload: {
    challengeId: string;
    purpose: AuthPurpose;
    accountType: AuthPortalType;
  }): AuthChallenge {
    const challenge = demoChallenges.get(payload.challengeId);
    if (
      !challenge ||
      challenge.purpose !== payload.purpose ||
      challenge.accountType !== payload.accountType
    ) {
      throw new Error("This demo verification request is no longer active.");
    }
    demoChallenges.delete(challenge.challengeId);
    return createChallenge(
      challenge.identifier,
      challenge.purpose,
      challenge.accountType
    );
  },

  requestPasswordRecovery(
    identifier: string,
    accountType: AuthPortalType
  ): AuthChallenge {
    return createChallenge(identifier, "password_reset", accountType);
  },

  resetPassword(payload: { resetGrant: string; password: string }) {
    const email = resetGrants.get(payload.resetGrant);
    if (!email) {
      throw new Error("This local demo password-reset request has expired.");
    }
    const account = demoAccounts.get(email);
    if (account) demoAccounts.set(email, { ...account, password: payload.password });
    resetGrants.delete(payload.resetGrant);
    return { updated: true as const };
  },

  hasAccount(email: string, accountType: AuthAccountType) {
    return Boolean(findAccount(email, accountType));
  },
};
