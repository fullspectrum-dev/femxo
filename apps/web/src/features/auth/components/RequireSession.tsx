"use client";

import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";
import type { AuthUser } from "../types/auth";
import { FormAlert } from "./AuthFormParts";
import { useAuthSession } from "./AuthSessionProvider";

/**
 * Renders `children` for a signed-in user. Signed-out visitors go to /login
 * (and come back here after), and a user with a temporary password goes to
 * /change-password first, as the backend refuses everything else until then.
 */
export function RequireSession({
  children,
  allowPendingPasswordChange = false,
  pendingClassName,
}: {
  children: (user: AuthUser) => ReactNode;
  allowPendingPasswordChange?: boolean;
  /** Wraps the checking/error states, e.g. to centre them on a full page. */
  pendingClassName?: string;
}) {
  const { status, user, reloadUser } = useAuthSession();
  const router = useRouter();
  const pathname = usePathname();
  const mustChange = Boolean(user?.mustChangePassword) && !allowPendingPasswordChange;

  useEffect(() => {
    if (status === "signed-out") router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    else if (status === "signed-in" && mustChange) router.replace("/change-password");
  }, [status, mustChange, pathname, router]);

  if (status === "unavailable") {
    return (
      <div className={pendingClassName}>
        <div className="w-full max-w-md space-y-4">
          <FormAlert>We couldn&rsquo;t check your session. Femxo may be unreachable right now.</FormAlert>
          <button type="button" className="btn-outline w-full" onClick={() => void reloadUser().catch(() => undefined)}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (status !== "signed-in" || !user || mustChange) {
    return (
      <div className={pendingClassName}>
        <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
          <Loader2 size={16} aria-hidden="true" className="animate-spin" />
          Checking your session…
        </p>
      </div>
    );
  }

  return <>{children(user)}</>;
}
