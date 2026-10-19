"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  AuthScreen,
  PasswordInput,
  authApi,
  resetPasswordSchema,
  useAuthFlow,
  getAuthPortalSlug,
} from "@/features/auth";
import type { AuthPortalType, ResetPasswordFormValues } from "@/features/auth";
import { getPasswordStrength } from "../utils/password-strength";
import { isAuthDemoMode } from "../services/demo-mode";

export function ResetPasswordForm() {
  const router = useRouter();
  const { challenge, resetGrant, setResetGrant, clearAuthFlow } = useAuthFlow();
  const accountType: AuthPortalType = challenge?.accountType ?? "customer";
  const portalSlug = getAuthPortalSlug(accountType) ?? "customer";
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
    defaultValues: { password: "", confirmPassword: "" },
  });
  const password = useWatch({ control, name: "password" }) || "";
  const strength = getPasswordStrength(password);

  async function onSubmit(values: ResetPasswordFormValues) {
    setServerError("");
    if (!resetGrant) {
      setServerError("Your recovery session has expired. Request a new recovery code.");
      return;
    }
    try {
      await authApi.resetPassword({
        resetGrant,
        password: values.password,
      });
      setResetGrant(null);
      setSuccess(true);
      clearAuthFlow();
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "We couldn't update your password. Please try again."
      );
    }
  }

  return (
    <AuthScreen
      eyebrow="New password"
      title={success ? "Password updated" : "Choose a new password"}
      description={
        success
          ? isAuthDemoMode
            ? "Your demo password was updated in memory for this session only."
            : "Your password has been updated. Sign in using your new password."
          : "Choose a strong password you haven’t used for this account before."
      }
      asideTitle="Protect what you’ve built."
      asideDescription="A strong password helps keep your business and partner information private."
      accountType={accountType}
    >
      {success ? (
        <div className="auth-form" role="status">
          <div className="auth-form-success">
            <CheckCircle2 size={18} aria-hidden="true" /> Your password is
            updated.
          </div>
          <button
            className="auth-button"
            type="button"
            onClick={() => router.push(`/${portalSlug}/login`)}
          >
            Sign in with new password <ArrowRight size={17} aria-hidden="true" />
          </button>
        </div>
      ) : resetGrant ? (
        <form className="auth-form" noValidate onSubmit={handleSubmit(onSubmit)}>
          {serverError && (
            <p className="auth-form-error" role="alert">
              {serverError}
            </p>
          )}
          <PasswordInput
            id="new-password"
            label="New password"
            autoComplete="new-password"
            placeholder="Create a new password"
            leading={<LockKeyhole size={17} />}
            registration={register("password")}
            error={errors.password?.message}
          />
          <div
            className="auth-password-strength"
            aria-label={`Password strength: ${strength.label}`}
          >
            {Array.from({ length: 4 }, (_, index) => (
              <span
                key={index}
                className={`auth-strength-segment ${index < strength.score ? "is-active" : ""}`}
              />
            ))}
          </div>
          <p className="auth-strength-label" aria-live="polite">
            {strength.label}. Use 8+ characters, upper and lowercase letters,
            and a number.
          </p>
          <PasswordInput
            id="confirm-new-password"
            label="Confirm new password"
            autoComplete="new-password"
            placeholder="Re-enter your new password"
            registration={register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />
          <button className="auth-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating password…" : "Reset password & sign in"}
            {!isSubmitting && <ArrowRight size={17} aria-hidden="true" />}
          </button>
        </form>
      ) : (
        <div className="auth-form">
          <p className="auth-form-error" role="alert">
            Your recovery session isn&apos;t available in this tab. Start account
            recovery again to continue securely.
          </p>
          <Link className="auth-button" href={`/${portalSlug}/forgot-password`}>
            Start account recovery <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      )}
    </AuthScreen>
  );
}
