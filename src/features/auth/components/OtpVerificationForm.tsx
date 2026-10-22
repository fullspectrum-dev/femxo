"use client";

import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ClipboardEvent, FormEvent, KeyboardEvent } from "react";
import { isAuthDemoMode } from "../services/demo-mode";
import type { AuthPortalType } from "../types/auth";
import {
  AuthScreen,
  authApi,
  getAuthPortalSlug,
  otpSchema,
  useAuthFlow,
} from "@/features/auth";

export function OtpVerificationForm() {
  const router = useRouter();
  const { challenge, replaceChallenge, setResetGrant, completeSignIn, clearAuthFlow } =
    useAuthFlow();
  // Registration success clears the flow, so keep the account type for the
  // follow-up sign-in link.
  const [verifiedAccountType, setVerifiedAccountType] =
    useState<AuthPortalType | null>(null);
  const accountType: AuthPortalType =
    verifiedAccountType ?? challenge?.accountType ?? "customer";
  const loginHref = `/${getAuthPortalSlug(accountType) ?? "customer"}/login`;
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const [digits, setDigits] = useState<string[]>(
    challenge?.demo ? Array.from("123456") : Array(6).fill("")
  );
  const [secondsLeft, setSecondsLeft] = useState(
    challenge?.resendAfterSeconds ?? 0
  );
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setTimeout(
      () => setSecondsLeft((remaining) => remaining - 1),
      1000
    );
    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  const updateDigit = useCallback((index: number, rawValue: string) => {
    const value = rawValue.replace(/\D/g, "").slice(-1);
    setDigits((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
    if (value && index < refs.current.length - 1) {
      refs.current[index + 1]?.focus();
    }
  }, []);

  function onPaste(event: ClipboardEvent<HTMLDivElement>) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    event.preventDefault();
    setDigits(Array.from({ length: 6 }, (_, index) => pasted[index] || ""));
    refs.current[Math.min(pasted.length, 5)]?.focus();
  }

  function onKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
    index: number
  ) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (event.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < 5) {
      refs.current[index + 1]?.focus();
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError("");
    setSuccessMessage("");
    if (!challenge) {
      setServerError("There’s no active verification request. Start again from sign in or account recovery.");
      return;
    }
    const code = digits.join("");
    const parsedCode = otpSchema.safeParse(code);
    if (!parsedCode.success) {
      setServerError("Enter all 6 digits.");
      refs.current[digits.findIndex((digit) => !digit)]?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await authApi.verifyOtp({
        challengeId: challenge.challengeId,
        code: parsedCode.data,
        purpose: challenge.purpose,
        accountType: challenge.accountType,
      });
      if (challenge.purpose === "password_reset") {
        if (!result.resetGrant) {
          throw new Error("The verified recovery request did not return a reset grant.");
        }
        setResetGrant(result.resetGrant);
        router.push("/reset-password");
        return;
      }
      if (challenge.purpose === "login") {
        const portalSlug =
          getAuthPortalSlug(challenge.accountType) ?? "customer";
        completeSignIn(challenge.accountType);
        router.push(`/${portalSlug}/coming-soon`);
        return;
      }
      setVerifiedAccountType(challenge.accountType);
      clearAuthFlow();
      setSuccessMessage(
        challenge.demo
          ? "Demo account created in memory for this session only. No backend account was created."
          : "Your mobile number is verified. Your account request is complete."
      );
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "We couldn't verify that code. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resendCode() {
    if (!challenge || secondsLeft > 0 || isResending) return;
    setServerError("");
    setSuccessMessage("");
    setIsResending(true);
    try {
      const resent = await authApi.resendOtp({
        challengeId: challenge.challengeId,
        purpose: challenge.purpose,
        accountType: challenge.accountType,
      });
      replaceChallenge({ ...challenge, ...resent });
      setSecondsLeft(resent.resendAfterSeconds);
      setDigits(Array(6).fill(""));
      refs.current[0]?.focus();
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "We couldn't resend the code. Please try again later."
      );
    } finally {
      setIsResending(false);
    }
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <AuthScreen
      eyebrow="Secure verification"
      title="Check your messages"
      description={
        challenge
          ? challenge.demo
            ? "Demo mode: use the test verification code 123456."
            : `Enter the 6-digit code sent to ${challenge.maskedDestination}.`
          : "Start a new sign-in or recovery request to receive a verification code."
      }
      asideTitle="One quick check keeps your account yours."
      accountType={accountType}
    >
      {isAuthDemoMode && !challenge && (
        <p className="auth-demo-note" role="status">
          Demo verification only. Start again from a demo portal; no real
          verification message is sent.
        </p>
      )}
      {successMessage ? (
        <div className="auth-form" role="status">
          <div className="auth-form-success">
            <CheckCircle2 size={18} aria-hidden="true" /> {successMessage}
          </div>
          <Link className="auth-button" href={loginHref}>
            Continue to sign in <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <form className="auth-form" noValidate onSubmit={verifyCode}>
          {serverError && (
            <p className="auth-form-error" role="alert">
              {serverError}
            </p>
          )}
          {challenge && (
            <>
              <div
                className="auth-otp-group"
                role="group"
                aria-label="6-digit verification code"
                onPaste={onPaste}
              >
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      refs.current[index] = element;
                    }}
                    className="auth-otp-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    aria-label={`Verification code digit ${index + 1}`}
                    value={digit}
                    onChange={(event) => updateDigit(index, event.target.value)}
                    onKeyDown={(event) => onKeyDown(event, index)}
                    disabled={isSubmitting}
                  />
                ))}
              </div>

              <div className="auth-inline-row">
                <span className="auth-muted-copy" aria-live="polite">
                  {secondsLeft > 0
                    ? `Resend available in ${minutes}:${String(seconds).padStart(2, "0")}`
                    : "You can request a new code."}
                </span>
                <button
                  className="auth-link"
                  type="button"
                  disabled={secondsLeft > 0 || isResending}
                  onClick={resendCode}
                >
                  {isResending ? "Sending…" : "Resend code"}
                </button>
              </div>
              <button className="auth-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Verifying…" : "Verify code"}
                {!isSubmitting && <ArrowRight size={17} aria-hidden="true" />}
              </button>
            </>
          )}
          <div className="auth-inline-row">
            <Link className="auth-link" href={loginHref}>
              <ArrowLeft size={14} aria-hidden="true" /> Back to sign in
            </Link>
            {challenge?.purpose === "password_reset" && (
              <Link className="auth-link" href="/forgot-password">
                Start again
              </Link>
            )}
          </div>
        </form>
      )}
    </AuthScreen>
  );
}
