import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, ShieldCheck, UserRound } from "lucide-react";
import { AuthScreen } from "./AuthScreen";
import { AUTH_PORTALS } from "../utils/auth-portals";

interface AuthPortalSelectionProps {
  mode: "login" | "register" | "recovery";
}

export function AuthPortalSelection({ mode }: AuthPortalSelectionProps) {
  const isLogin = mode === "login";
  const isRegister = mode === "register";
  const portals = AUTH_PORTALS.filter(
    (portal) =>
      (!isRegister || portal.accountType !== "retail_partner") &&
      (!isLogin || portal.accountType !== "retail_partner")
  );

  return (
    <AuthScreen
      eyebrow={
        isLogin
          ? "Choose your sign-in"
          : isRegister
            ? "Choose your account"
            : "Choose account recovery"
      }
      title={
        isLogin
          ? "Where do you sign in?"
          : isRegister
            ? "Create the right FEMXO account"
            : "Which account needs recovery?"
      }
      description={
        isLogin
          ? "Select the account type you use. Customer and business access are kept separate."
          : isRegister
            ? "Choose the account type that matches you. Super Admin accounts are issued separately."
            : "Choose the account type linked to the account you want to recover."
      }
      asideTitle="The right FEMXO access, from the start."
      asideDescription="Choose your own secure sign-in path. Each account type has a separate experience."
      showAccountContexts={false}
    >
      <nav
        className="auth-portal-list"
        aria-label={
          isLogin
            ? "Sign-in portals"
            : isRegister
              ? "Registration portals"
              : "Account recovery portals"
        }
      >
        {portals.map((portal) => {
          const isCustomer = portal.accountType === "customer";
          const isAdmin = portal.accountType === "super_admin";
          const href = isLogin
            ? `/${portal.slug}/login`
            : isRegister
              ? isAdmin
                ? `/${portal.slug}/login`
                : `/${portal.slug}/register`
              : `/${portal.slug}/forgot-password`;

          return (
            <Link
              className={`auth-portal-card${isAdmin ? " is-admin" : ""}`}
              href={href}
              key={portal.slug}
            >
              <span className="auth-portal-icon" aria-hidden="true">
                {isAdmin ? (
                  <ShieldCheck size={20} />
                ) : isCustomer ? (
                  <UserRound size={20} />
                ) : (
                  <BriefcaseBusiness size={20} />
                )}
              </span>
              <span className="auth-portal-copy">
                <strong>{isRegister && isAdmin ? "Admin" : portal.label}</strong>
                <span>
                  {isAdmin
                    ? "Provisioned access · invitation required"
                    : isLogin
                      ? `${portal.label} sign-in`
                      : isRegister
                        ? `Create a ${portal.label.toLowerCase()} account`
                        : `Recover a ${portal.label.toLowerCase()} account`}
                </span>
              </span>
              <ArrowRight className="auth-portal-arrow" size={18} aria-hidden="true" />
            </Link>
          );
        })}
      </nav>
      {isLogin && (
        <p className="auth-portal-hint">
          Dealer and Sub-dealer accounts each have their own sign-in page.
        </p>
      )}
      {isLogin && (
        <p className="auth-inline-row">
          <span className="auth-muted-copy">Need an account?</span>
          <Link className="auth-link" href="/register">
            Create one
          </Link>
        </p>
      )}
    </AuthScreen>
  );
}
