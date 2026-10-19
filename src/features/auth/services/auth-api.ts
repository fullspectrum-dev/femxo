import { z } from "zod";
import type {
  AuthAccountType,
  AuthChallenge,
  AuthPurpose,
  AuthPortalType,
  AuthRequestOptions,
} from "../types/auth";
import { reportAuthFailure } from "./auth-monitoring";
import { isAuthDemoMode } from "./demo-mode";

const challengeSchema = z.object({
  challengeId: z.string().min(1),
  expiresInSeconds: z.number().int().positive(),
  resendAfterSeconds: z.number().int().nonnegative(),
  maskedDestination: z.string().min(1),
});

const verificationSchema = z.object({
  verified: z.literal(true),
  resetGrant: z.string().min(1).optional(),
});

const successSchema = z.object({ authenticated: z.literal(true) });
const passwordResetSuccessSchema = z.object({ updated: z.literal(true) });

export class AuthApiError extends Error {
  readonly status: number | undefined;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
  }
}

const baseUrl = (process.env.NEXT_PUBLIC_AUTH_API_BASE_URL || "/api/auth").replace(
  /\/$/,
  ""
);
const REQUEST_TIMEOUT_MS = 12_000;

function safeMessageForStatus(status: number): string {
  if (status === 400 || status === 422) {
    return "Some details need attention. Check the form and try again.";
  }
  if (status === 401 || status === 403) {
    return "Those details could not be verified. Check them and try again.";
  }
  if (status === 429) {
    return "Too many attempts. Please wait a little before trying again.";
  }
  if (status >= 500) {
    return "Authentication is temporarily unavailable. Please try again later.";
  }
  return "We couldn't complete that request. Please try again.";
}

async function postJson<T>(
  endpoint: string,
  payload: unknown,
  responseSchema: z.ZodType<T>,
  options: AuthRequestOptions = {}
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const abortFromCaller = () => controller.abort(options.signal?.reason);
  options.signal?.addEventListener("abort", abortFromCaller, { once: true });

  try {
    let response: Response;
    try {
      response = await fetch(`${baseUrl}/${endpoint}`, {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch {
      if (controller.signal.aborted) {
        reportAuthFailure({
          endpoint,
          kind: options.signal?.aborted ? "network" : "timeout",
        });
        throw new AuthApiError(
          options.signal?.aborted
            ? "Request cancelled."
            : "The request timed out. Please try again."
        );
      }
      reportAuthFailure({ endpoint, kind: "network" });
      throw new AuthApiError(
        "We couldn't connect to FEMXO authentication. Please try again."
      );
    }

    if (!response.ok) {
      reportAuthFailure({
        endpoint,
        status: response.status,
        kind: "http",
      });
      throw new AuthApiError(safeMessageForStatus(response.status), response.status);
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      reportAuthFailure({
        endpoint,
        status: response.status,
        kind: "invalid_response",
      });
      throw new AuthApiError(
        "The authentication service returned an unexpected response."
      );
    }

    const parsed = responseSchema.safeParse(data);
    if (!parsed.success) {
      reportAuthFailure({
        endpoint,
        status: response.status,
        kind: "invalid_response",
      });
      throw new AuthApiError(
        "The authentication service returned an unexpected response."
      );
    }
    return parsed.data;
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener("abort", abortFromCaller);
  }
}

export interface RegisterPayload {
  fullName: string;
  mobile: string;
  email: string;
  password: string;
  accountType: AuthAccountType;
  termsAccepted: true;
}

export const authApi = {
  async register(payload: RegisterPayload, options?: AuthRequestOptions) {
    if (isAuthDemoMode) {
      const { demoAuth } = await import(
        "@/features/auth/services/demo-auth"
      );
      return demoAuth.register(payload);
    }
    return postJson<AuthChallenge>(
      "register",
      payload,
      challengeSchema,
      options
    );
  },

  async requestLoginOtp(
    mobile: string,
    accountType: AuthPortalType,
    options?: AuthRequestOptions
  ) {
    if (isAuthDemoMode) {
      const { demoAuth } = await import(
        "@/features/auth/services/demo-auth"
      );
      return demoAuth.requestLoginOtp(mobile, accountType);
    }
    return postJson<AuthChallenge>(
      "login/otp",
      { mobile, accountType },
      challengeSchema,
      options
    );
  },

  async loginWithPassword(
    payload: { email: string; password: string; accountType: AuthPortalType },
    options?: AuthRequestOptions
  ) {
    if (isAuthDemoMode) {
      const { demoAuth } = await import(
        "@/features/auth/services/demo-auth"
      );
      return demoAuth.loginWithPassword(payload);
    }
    return postJson("login/password", payload, successSchema, options);
  },

  async verifyOtp(
    payload: {
      challengeId: string;
      code: string;
      purpose: AuthPurpose;
      accountType: AuthPortalType;
    },
    options?: AuthRequestOptions
  ) {
    if (isAuthDemoMode) {
      const { demoAuth } = await import(
        "@/features/auth/services/demo-auth"
      );
      return demoAuth.verifyOtp(payload);
    }
    return postJson(
      "otp/verify",
      payload,
      verificationSchema,
      options
    );
  },

  async resendOtp(
    payload: {
      challengeId: string;
      purpose: AuthPurpose;
      accountType: AuthPortalType;
    },
    options?: AuthRequestOptions
  ) {
    if (isAuthDemoMode) {
      const { demoAuth } = await import(
        "@/features/auth/services/demo-auth"
      );
      return demoAuth.resendOtp(payload);
    }
    return postJson(
      "otp/resend",
      payload,
      challengeSchema,
      options
    );
  },

  async requestPasswordRecovery(
    identifier: string,
    accountType: AuthPortalType,
    options?: AuthRequestOptions
  ) {
    if (isAuthDemoMode) {
      const { demoAuth } = await import(
        "@/features/auth/services/demo-auth"
      );
      return demoAuth.requestPasswordRecovery(identifier, accountType);
    }
    return postJson<AuthChallenge>(
      "password/recovery",
      { identifier, accountType },
      challengeSchema,
      options
    );
  },

  async resetPassword(
    payload: { resetGrant: string; password: string },
    options?: AuthRequestOptions
  ) {
    if (isAuthDemoMode) {
      const { demoAuth } = await import(
        "@/features/auth/services/demo-auth"
      );
      return demoAuth.resetPassword(payload);
    }
    return postJson(
      "password/reset",
      payload,
      passwordResetSuccessSchema,
      options
    );
  },
};
