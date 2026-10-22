"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { cn } from "@/lib/utils";
import {
  PASSWORD_MAX_LENGTH,
  changePasswordSchema,
  passwordMinLength,
  type ChangePasswordFormValues,
} from "../schemas/auth-schemas";
import { AuthApiError } from "../services/auth-client";
import { authApi } from "../services/auth-api";
import type { AuthUser } from "../types/auth";
import { getPasswordStrength } from "../utils/password-strength";
import { FormAlert, SubmitButton, deadlineIn, formatWait, useCountdown } from "./AuthFormParts";
import { useAuthSession } from "./AuthSessionProvider";
import { PasswordInput } from "./PasswordInput";
import { RequireSession } from "./RequireSession";

const STRENGTH_COLOURS = ["bg-red-500", "bg-red-500", "bg-amber-500", "bg-lime-500", "bg-emerald-500"];

export function ChangePasswordForm({ user }: { user: AuthUser }) {
  const router = useRouter();
  const { reloadUser } = useAuthSession();
  const [serverError, setServerError] = useState("");
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const waitSeconds = useCountdown(lockedUntil);
  const minLength = passwordMinLength(user.isSuperAdmin);
  const schema = useMemo(() => changePasswordSchema(user.isSuperAdmin), [user.isSuperAdmin]);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });
  const newPassword = useWatch({ control: form.control, name: "newPassword" });
  const strength = getPasswordStrength(newPassword);

  async function onSubmit(values: ChangePasswordFormValues) {
    setServerError("");
    try {
      await authApi.changePassword(values.currentPassword, values.newPassword);
      await reloadUser();
      router.replace("/account?passwordChanged=1");
    } catch (error) {
      if (!(error instanceof AuthApiError)) {
        setServerError("We couldn't change your password. Please try again.");
        return;
      }
      // Field-level problems go next to the field they're about.
      if (error.code === "WRONG_PASSWORD") {
        form.setError("currentPassword", { message: error.message }, { shouldFocus: true });
      } else if (error.code === "WEAK_PASSWORD" || error.code === "PASSWORD_UNCHANGED") {
        form.setError("newPassword", { message: error.message }, { shouldFocus: true });
      } else if (error.code === "UNAUTHENTICATED") {
        await reloadUser().catch(() => undefined);
      } else {
        if (error.code === "TOO_MANY_ATTEMPTS") {
          setLockedUntil(deadlineIn(error.retryAfterSeconds));
        }
        setServerError(error.message);
      }
    }
  }

  return (
    <form className="space-y-5" noValidate onSubmit={form.handleSubmit(onSubmit)}>
      {user.mustChangePassword && (
        <div className="flex gap-3 rounded-2xl border border-gold-400/50 bg-gold-400/10 p-4 text-sm leading-relaxed text-foreground">
          <ShieldAlert size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-gold" />
          <p>
            <span className="font-semibold">Your admin set a temporary password.</span> Choose your own to
            continue - the one you were given is your current password.
          </p>
        </div>
      )}

      {serverError && (
        <FormAlert>
          {serverError}
          {waitSeconds > 0 && <span className="mt-1 block font-semibold">Try again in {formatWait(waitSeconds)}.</span>}
        </FormAlert>
      )}

      <PasswordInput
        id="current-password"
        label={user.mustChangePassword ? "Temporary password" : "Current password"}
        autoComplete="current-password"
        registration={form.register("currentPassword")}
        error={form.formState.errors.currentPassword?.message}
      />

      <div>
        <PasswordInput
          id="new-password"
          label="New password"
          autoComplete="new-password"
          placeholder={`At least ${minLength} characters`}
          registration={form.register("newPassword")}
          error={form.formState.errors.newPassword?.message}
          hint={`${minLength}-${PASSWORD_MAX_LENGTH} characters${user.isSuperAdmin ? " (Super Admin accounts need longer passwords)" : ""}. A short phrase is easy to remember and hard to guess.`}
        />
        {newPassword && (
          <div className="mt-3" aria-live="polite">
            <div className="flex gap-1.5" aria-hidden="true">
              {[1, 2, 3, 4].map((step) => (
                <span
                  key={step}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    strength.score >= step ? STRENGTH_COLOURS[strength.score] : "bg-secondary"
                  )}
                />
              ))}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Strength: <span className="font-semibold text-foreground">{newPassword.length < minLength ? "Too short" : strength.label}</span>
            </p>
          </div>
        )}
      </div>

      <PasswordInput
        id="confirm-password"
        label="Confirm new password"
        autoComplete="new-password"
        placeholder="Type it again"
        registration={form.register("confirmPassword")}
        error={form.formState.errors.confirmPassword?.message}
      />

      <SubmitButton pending={form.formState.isSubmitting} pendingLabel="Saving…" disabled={waitSeconds > 0}>
        Change password
      </SubmitButton>

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        Changing your password signs you out on your other devices.
        {!user.mustChangePassword && (
          <>
            {" "}
            <Link href="/account" className="font-semibold text-highlight hover:underline">
              Cancel
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

/** The change-password page body: needs a session, even one with a temporary password. */
export function ChangePasswordView() {
  return <RequireSession allowPendingPasswordChange>{(user) => <ChangePasswordForm user={user} />}</RequireSession>;
}
