"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { authApi } from "../services/auth-api";
import type { AuthUser } from "../types/auth";

type SessionStatus = "checking" | "signed-out" | "signed-in" | "unavailable";

interface AuthSessionValue {
  status: SessionStatus;
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  /** Re-reads the user, e.g. after a password change clears mustChangePassword. */
  reloadUser: () => Promise<AuthUser | null>;
}

const AuthSessionContext = createContext<AuthSessionValue | null>(null);

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>("checking");
  const [user, setUser] = useState<AuthUser | null>(null);

  const apply = useCallback((next: AuthUser | null) => {
    setUser(next);
    setStatus(next ? "signed-in" : "signed-out");
    return next;
  }, []);

  // On a page load the access token is gone (it only lives in memory), so
  // swap the refresh cookie for a new one. The client shares one refresh
  // between callers, so Strict Mode's double effect is harmless.
  useEffect(() => {
    let active = true;
    authApi
      .restoreSession()
      .then((restored) => active && apply(restored))
      .catch(() => active && setStatus("unavailable"));
    return () => {
      active = false;
    };
  }, [apply]);

  const value = useMemo<AuthSessionValue>(
    () => ({
      status,
      user,
      signIn: async (email, password) => apply(await authApi.login(email, password))!,
      signOut: async () => {
        await authApi.logout().catch(() => undefined);
        apply(null);
      },
      reloadUser: async () => apply(await authApi.restoreSession()),
    }),
    [status, user, apply]
  );

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext);
  if (!context) throw new Error("useAuthSession must be used within AuthSessionProvider.");
  return context;
}

/** Where to go after sign-in: the `next` param if it's a local path, else the account page. */
export function safeNextPath(next: string | null | undefined, fallback = "/account") {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
}
