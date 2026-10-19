"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  AuthField,
  AuthScreen,
  PasswordInput,
  authApi,
  getAuthPortal,
  getAuthPortalSlug,
  loginOtpSchema,
  loginPasswordSchema,
  useAuthFlow,
} from "@/features/auth";
import type {
  AuthPortalType,
  LoginOtpFormValues,
  LoginPasswordFormValues,
} from "@/features/auth";
import { isAuthDemoMode } from "../services/demo-mode";

type LoginMode = "otp" | "password";

export function LoginForm({ accountType }: { accountType: AuthPortalType }) {
  const portal = getAuthPortal(getAuthPortalSlug(accountType) ?? "customer");
  const router = useRouter();
  const { beginChallenge, completeSignIn } = useAuthFlow();
  const [mode, setMode] = useState<LoginMode>(
    isAuthDemoMode ? "password" : "otp"
  );
  const [serverError, setServerError] = useState("");
  const [demoCredentials, setDemoCredentials] = useState<{
    email: string;
    password: string;
  }>();
  const otpForm = useForm<LoginOtpFormValues>({
    resolver: zodResolver(loginOtpSchema),
    mode: "onTouched",
    defaultValues: { mobile: "" },
  });
  const passwordForm = useForm<LoginPasswordFormValues>({
    resolver: zodResolver(loginPasswordSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });
  const { setValue: setPasswordValue } = passwordForm;
  useEffect(() => {
    if (!isAuthDemoMode) return;
    let isMounted = true;
    void import("@/features/auth/services/demo-auth").then(({ DEMO_CREDENTIALS }) => {
      const credentials = DEMO_CREDENTIALS[accountType];
      if (!isMounted || !credentials) return;
      setDemoCredentials(credentials);
      setPasswordValue("email", credentials.email);
      setPasswordValue("password", credentials.password);
    });
    return () => {
      isMounted = false;
    };
  }, [accountType, setPasswordValue]);

  async function requestOtp(values: LoginOtpFormValues) {
    setServerError("");
    try {
      const challenge = await authApi.requestLoginOtp(values.mobile, accountType);
      beginChallenge({
        ...challenge,
        identifier: values.mobile,
        purpose: "login",
        accountType,
      });
      router.push("/verify-otp");
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "We couldn't send a sign-in code. Please try again."
      );
    }
  }

  async function loginWithPassword(values: LoginPasswordFormValues) {
    setServerError("");
    try {
      await authApi.loginWithPassword({
        email: values.email.trim().toLowerCase(),
        password: values.password,
        accountType,
      });
      completeSignIn(accountType);
      router.push(`/${portal?.slug ?? "customer"}/coming-soon`);
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "We couldn't sign you in. Please try again."
      );
    }
  }

  return (
    <AuthScreen
      eyebrow="Welcome back"
      title={portal?.loginTitle ?? "Sign in to FEMXO"}
      description={portal?.loginDescription ?? "Sign in to your FEMXO account."}
      asideTitle={portal?.asideTitle}
      asideDescription={portal?.asideDescription}
      accountType={accountType}
    >
      <div className="auth-form">
        {demoCredentials && (
          <aside className="auth-demo-credentials" aria-label="Demo credentials">
            <strong>{portal?.label} demo credentials are prefilled</strong>
            <span>Email: <code>{demoCredentials.email}</code></span>
            <span>Password: <code>{demoCredentials.password}</code></span>
            <span>Demo verification code: <code>123456</code></span>
          </aside>
        )}
        <div className="auth-tabs" role="tablist" aria-label="Sign-in method">
          <button
            className="auth-tab"
            id="login-otp-tab"
            type="button"
            role="tab"
            aria-selected={mode === "otp"}
            aria-controls="login-panel"
            onClick={() => {
              setMode("otp");
              setServerError("");
            }}
          >
            Mobile code
          </button>
          <button
            className="auth-tab"
            id="login-password-tab"
            type="button"
            role="tab"
            aria-selected={mode === "password"}
            aria-controls="login-panel"
            onClick={() => {
              setMode("password");
              setServerError("");
            }}
          >
            Email &amp; password
          </button>
        </div>

        <div id="login-panel" role="tabpanel" aria-labelledby={mode === "otp" ? "login-otp-tab" : "login-password-tab"}>
          {serverError && (
            <p className="auth-form-error" role="alert">
              {serverError}
            </p>
          )}
          {mode === "otp" ? (
            <form
              className="auth-form"
              noValidate
              onSubmit={otpForm.handleSubmit(requestOtp)}
            >
              <AuthField
                id="login-mobile"
                label="Mobile number"
                type="tel"
                inputMode="numeric"
                placeholder="10-digit mobile number"
                autoComplete="tel-national"
                prefix="+91"
                leading={<Phone size={17} />}
                registration={otpForm.register("mobile")}
                error={otpForm.formState.errors.mobile?.message}
              />
              <button
                className="auth-button"
                type="submit"
                disabled={otpForm.formState.isSubmitting}
              >
                {otpForm.formState.isSubmitting
                  ? "Sending secure code…"
                  : "Continue with mobile"}
                {!otpForm.formState.isSubmitting && (
                  <ArrowRight size={17} aria-hidden="true" />
                )}
              </button>
            </form>
          ) : (
            <form
              className="auth-form"
              noValidate
              onSubmit={passwordForm.handleSubmit(loginWithPassword)}
            >
              <AuthField
                id="login-email"
                label="Email address"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                leading={<Mail size={17} />}
                registration={passwordForm.register("email")}
                error={passwordForm.formState.errors.email?.message}
              />
              <PasswordInput
                id="login-password"
                label="Password"
                autoComplete="current-password"
                registration={passwordForm.register("password")}
                error={passwordForm.formState.errors.password?.message}
              />
              <div className="auth-form-meta">
                <span className="auth-muted-copy">Keep your sign-in private.</span>
                <Link className="auth-link" href={`/${portal?.slug ?? "customer"}/forgot-password`}>
                  Forgot password?
                </Link>
              </div>
              <button
                className="auth-button"
                type="submit"
                disabled={passwordForm.formState.isSubmitting}
              >
                {passwordForm.formState.isSubmitting
                  ? "Signing you in…"
                  : "Sign in"}
                {!passwordForm.formState.isSubmitting && (
                  <ArrowRight size={17} aria-hidden="true" />
                )}
              </button>
            </form>
          )}
        </div>

        {mode === "otp" && (
          <div className="auth-inline-row">
            <span className="auth-muted-copy">Need account access?</span>
            <Link className="auth-link" href={`/${portal?.slug ?? "customer"}/forgot-password`}>
              Recover your account
            </Link>
          </div>
        )}
        {accountType === "super_admin" ? (
          <p className="auth-muted-copy auth-invitation-note">
            Super Admin accounts are provisioned by FEMXO. Public account
            creation is unavailable for this role.
          </p>
        ) : (
          <>
            <div className="auth-divider">or</div>
            <div className="auth-inline-row">
              <span className="auth-muted-copy">New to FEMXO?</span>
              <Link className="auth-link" href={`/${portal?.slug ?? "customer"}/register`}>
                Create an account
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthScreen>
  );
}
