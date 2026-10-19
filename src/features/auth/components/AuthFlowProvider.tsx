"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { ActiveAuthChallenge } from "../types/auth";
import type { AuthPortalType } from "../types/auth";

interface AuthFlowContextValue {
  challenge: ActiveAuthChallenge | null;
  resetGrant: string | null;
  signedInAccountType: AuthPortalType | null;
  beginChallenge: (challenge: ActiveAuthChallenge) => void;
  replaceChallenge: (challenge: ActiveAuthChallenge) => void;
  setResetGrant: (grant: string | null) => void;
  completeSignIn: (accountType: AuthPortalType) => void;
  clearAuthFlow: () => void;
}

const AuthFlowContext = createContext<AuthFlowContextValue | null>(null);

export function AuthFlowProvider({ children }: { children: ReactNode }) {
  const [challenge, setChallenge] = useState<ActiveAuthChallenge | null>(null);
  const [resetGrant, setResetGrant] = useState<string | null>(null);
  const [signedInAccountType, setSignedInAccountType] =
    useState<AuthPortalType | null>(null);

  const value = useMemo<AuthFlowContextValue>(
    () => ({
      challenge,
      resetGrant,
      signedInAccountType,
      beginChallenge: setChallenge,
      replaceChallenge: setChallenge,
      setResetGrant,
      completeSignIn: (accountType) => {
        setChallenge(null);
        setResetGrant(null);
        setSignedInAccountType(accountType);
      },
      clearAuthFlow: () => {
        setChallenge(null);
        setResetGrant(null);
        setSignedInAccountType(null);
      },
    }),
    [challenge, resetGrant, signedInAccountType]
  );

  return (
    <AuthFlowContext.Provider value={value}>
      {children}
    </AuthFlowContext.Provider>
  );
}

export function useAuthFlow() {
  const context = useContext(AuthFlowContext);
  if (!context) {
    throw new Error("useAuthFlow must be used within AuthFlowProvider.");
  }
  return context;
}
