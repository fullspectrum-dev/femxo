"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Mail, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { z } from "zod";
import { primaryRole } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { loginSchema } from "../schemas/auth-schemas";
import { AuthApiError } from "../services/auth-client";
import type { DemoAccount } from "../services/demo-backend";
import { isAuthDemoMode } from "../services/demo-mode";
import { AuthField } from "./AuthField";
import { FormAlert, SubmitButton, deadlineIn, formatWait, useCountdown } from "./AuthFormParts";
import { safeNextPath, useAuthSession } from "./AuthSessionProvider";
import { PasswordInput } from "./PasswordInput";

type LoginInput = z.input<typeof loginSchema>;
type LoginOutput = z.output<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, user, signIn } = useAuthSession();
  const [serverError, setServerError] = useState("");
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([]);
  const waitSeconds = useCountdown(lockedUntil);
  const nextParam = searchParams.get("next");

  const form = useForm<LoginInput, unknown, LoginOutput>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });
  const selectedEmail = useWatch({ control: form.control, name: "email" });

  // Someone already signed in doesn't need this page. Without a `next`, the
  // Super Admin goes to the admin panel; other roles to their workspace page.
  // `next=/account` counts as no preference: it's the generic landing page
  // RequireSession sends people back to, not a page they picked.
  useEffect(() => {
    if (status !== "signed-in" || !user) return;
    const home = user.isSuperAdmin ? "/admin/dashboard" : "/account";
    const requested = nextParam === "/account" ? null : nextParam;
    router.replace(user.mustChangePassword ? "/change-password" : safeNextPath(requested, home));
  }, [status, user, nextParam, router]);

  useEffect(() => {
    if (!isAuthDemoMode) return;
    let active = true;
    void import("@/features/auth/services/demo-backend").then(({ DEMO_ACCOUNTS }) => {
      if (active) setDemoAccounts(DEMO_ACCOUNTS);
    });
    return () => {
      active = false;
    };
  }, []);

  async function onSubmit(values: LoginOutput) {
    setServerError("");
    try {
      // The effect above sends the user on once the session updates.
      await signIn(values.email, values.password);
    } catch (error) {
      if (error instanceof AuthApiError && error.code === "TOO_MANY_ATTEMPTS") {
        setLockedUntil(deadlineIn(error.retryAfterSeconds));
      }
      setServerError(error instanceof Error ? error.message : "We couldn't sign you in. Please try again.");
    }
  }

  const isLocked = waitSeconds > 0;

  return (
    <div className="space-y-6">
      {demoAccounts.length > 0 && (
        <div aria-label="Demo accounts" role="group">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Try a demo account
          </p>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((account) => {
              const Icon = primaryRole(account.label === "Super Admin", [account.label])?.icon ?? KeyRound;
              const isSelected = selectedEmail === account.email;
              return (
                <button
                  key={account.email}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    form.setValue("email", account.email, { shouldValidate: true });
                    form.setValue("password", account.password, { shouldValidate: true });
                    setServerError("");
                  }}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-colors",
                    isSelected
                      ? "border-gold-400 bg-gold-400/15"
                      : "border-border bg-card hover:border-primary/60 hover:bg-secondary/60"
                  )}
                >
                  <Icon size={16} aria-hidden="true" className="shrink-0 text-highlight" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">{account.label}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{account.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <form className="space-y-5" noValidate onSubmit={form.handleSubmit(onSubmit)}>
        {serverError && (
          <FormAlert>
            {serverError}
            {isLocked && <span className="mt-1 block font-semibold">Try again in {formatWait(waitSeconds)}.</span>}
          </FormAlert>
        )}

        <AuthField
          id="login-email"
          label="Email address"
          type="email"
          inputMode="email"
          placeholder="you@business.com"
          autoComplete="username"
          leading={<Mail size={17} />}
          registration={form.register("email")}
          error={form.formState.errors.email?.message}
        />
        <div>
          <PasswordInput
            id="login-password"
            label="Password"
            autoComplete="current-password"
            registration={form.register("password")}
            error={form.formState.errors.password?.message}
          />
          <div className="mt-2 text-right">
            <Link href="/forgot-password" className="text-sm font-semibold text-highlight hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        <SubmitButton pending={form.formState.isSubmitting} pendingLabel="Signing you in…" disabled={isLocked}>
          Sign in
        </SubmitButton>
      </form>

      <div className="flex gap-3 rounded-2xl border border-border bg-secondary/40 p-4">
        <UserPlus size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-highlight" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">New to Femxo?</span> Accounts are created by your
          admin or dealer - there&rsquo;s no public sign-up.{" "}
          <Link href="/#contact" className="font-semibold text-highlight hover:underline">
            Become a partner
          </Link>
        </p>
      </div>
    </div>
  );
}
