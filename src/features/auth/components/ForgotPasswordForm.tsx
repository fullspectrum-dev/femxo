"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, AtSign, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  AuthField,
  AuthScreen,
  authApi,
  recoverySchema,
  useAuthFlow,
  getAuthPortal,
  getAuthPortalSlug,
} from "@/features/auth";
import type { AuthPortalType, RecoveryFormValues } from "@/features/auth";

export function ForgotPasswordForm({ accountType }: { accountType: AuthPortalType }) {
  const portal = getAuthPortal(getAuthPortalSlug(accountType) ?? "customer");
  const router = useRouter();
  const { beginChallenge } = useAuthFlow();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecoveryFormValues>({
    resolver: zodResolver(recoverySchema),
    mode: "onTouched",
    defaultValues: { identifier: "" },
  });

  async function onSubmit(values: RecoveryFormValues) {
    setServerError("");
    const identifier = values.identifier.trim();
    try {
      const challenge = await authApi.requestPasswordRecovery(identifier, accountType);
      beginChallenge({
        ...challenge,
        identifier,
        purpose: "password_reset",
        accountType,
      });
      router.push("/verify-otp");
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "If the details match an account, recovery instructions will be sent."
      );
    }
  }

  return (
    <AuthScreen
      eyebrow={`${portal?.label ?? "FEMXO"} account recovery`}
      title="Let’s get you back in"
      description="Enter the mobile number or email linked to your account. If it matches, we’ll send a secure recovery code."
      asideTitle="A safe path back to your workspace."
      accountType={accountType}
    >
      <form className="auth-form" noValidate onSubmit={handleSubmit(onSubmit)}>
        {serverError && (
          <p className="auth-form-error" role="alert">
            {serverError}
          </p>
        )}
        <AuthField
          id="recovery-identifier"
          label="Mobile number or email"
          placeholder="10-digit mobile or email"
          autoComplete="username"
          leading={<AtSign size={17} />}
          registration={register("identifier")}
          error={errors.identifier?.message}
          hint="We’ll show the same next step whether or not an account is found."
        />
        <button className="auth-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Checking securely…" : "Continue"}
          {!isSubmitting && <ArrowRight size={17} aria-hidden="true" />}
        </button>
        <div className="auth-inline-row">
          <Link className="auth-link" href={`/${portal?.slug ?? "customer"}/login`}>
            <ArrowLeft size={14} aria-hidden="true" /> Back to sign in
          </Link>
          <span className="auth-muted-copy">
            <Mail size={14} aria-hidden="true" /> Private recovery
          </span>
        </div>
      </form>
    </AuthScreen>
  );
}
