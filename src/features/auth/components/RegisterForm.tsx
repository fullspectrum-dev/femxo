"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  AuthField,
  AuthScreen,
  PasswordInput,
  authApi,
  registerSchema,
  useAuthFlow,
} from "@/features/auth";
import type { RegisterFormValues } from "@/features/auth";
import type { AuthAccountType } from "@/features/auth";
import { getPasswordStrength } from "../utils/password-strength";
import { getAuthPortal, getAuthPortalSlug } from "../utils/auth-portals";

export function RegisterForm({ accountType }: { accountType: AuthAccountType }) {
  const portal = getAuthPortal(getAuthPortalSlug(accountType) ?? "customer");
  const router = useRouter();
  const { beginChallenge } = useAuthFlow();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      mobile: "",
      email: "",
      password: "",
      confirmPassword: "",
      accountType,
      termsAccepted: false,
    },
  });
  const password = useWatch({ control, name: "password" }) || "";
  const strength = getPasswordStrength(password);

  async function onSubmit(values: RegisterFormValues) {
    setServerError("");
    try {
      const challenge = await authApi.register({
        fullName: values.fullName.trim(),
        mobile: values.mobile,
        email: values.email.trim().toLowerCase(),
        password: values.password,
        accountType: values.accountType,
        termsAccepted: true,
      });
      beginChallenge({
        ...challenge,
        identifier: values.mobile,
        purpose: "registration",
        accountType,
      });
      router.push("/verify-otp");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We couldn't create your account. Please try again.";
      setServerError(message);
      if (
        error instanceof Error &&
        "status" in error &&
        error.status === 422
      ) {
        setError("email", { message: "This detail could not be accepted. Check it and try again." });
      }
    }
  }

  return (
    <AuthScreen
      eyebrow={`${portal?.label ?? "FEMXO"} account registration`}
      title={accountType === "customer" ? "Create your customer account" : `Create your ${portal?.label ?? "partner"} account`}
      description={`This form is only for ${portal?.label ?? "your"} accounts. Super Admin access is provisioned separately by FEMXO.`}
      asideTitle="A simpler way to grow together."
      accountType={accountType}
    >
      <form className="auth-form" noValidate onSubmit={handleSubmit(onSubmit)}>
        {serverError && (
          <p className="auth-form-error" role="alert">
            {serverError}
          </p>
        )}

        <div className="auth-form-grid">
          <AuthField
            id="fullName"
            label="Full name"
            placeholder="Your name"
            autoComplete="name"
            leading={<UserRound size={17} />}
            registration={register("fullName")}
            error={errors.fullName?.message}
          />
          <AuthField
            id="mobile"
            label="Mobile number"
            type="tel"
            inputMode="numeric"
            placeholder="10-digit mobile"
            autoComplete="tel-national"
            prefix="+91"
            registration={register("mobile")}
            error={errors.mobile?.message}
          />
          <AuthField
            id="email"
            label="Email address"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            leading={<Mail size={17} />}
            registration={register("email")}
            error={errors.email?.message}
          />
          <div className="auth-account-type" aria-label="Account type">
            <span>Account type</span>
            <strong>{portal?.label ?? "FEMXO account"}</strong>
          </div>
          <div>
            <PasswordInput
              id="password"
              label="Create password"
              autoComplete="new-password"
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
              Password strength: {strength.label}. Use 8+ characters, upper and
              lowercase letters, and a number.
            </p>
          </div>
          <PasswordInput
            id="confirmPassword"
            label="Confirm password"
            autoComplete="new-password"
            registration={register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />
        </div>

        <div>
          <label className="auth-checkbox-row" htmlFor="termsAccepted">
            <input
              id="termsAccepted"
              className="auth-checkbox"
              type="checkbox"
              {...register("termsAccepted")}
            />
            <span>
              I agree to FEMXO&apos;s terms of service and privacy policy.
            </span>
          </label>
          {errors.termsAccepted?.message && (
            <p className="auth-field-error" role="alert">
              {errors.termsAccepted.message}
            </p>
          )}
        </div>

        <button className="auth-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating your account…" : "Create account"}
          {!isSubmitting && <ArrowRight size={17} aria-hidden="true" />}
        </button>

        <div className="auth-inline-row">
          <span className="auth-muted-copy">Already have an account?</span>
          <Link className="auth-link" href={`/${portal?.slug ?? "customer"}/login`}>
            Sign in
          </Link>
        </div>
      </form>
    </AuthScreen>
  );
}
