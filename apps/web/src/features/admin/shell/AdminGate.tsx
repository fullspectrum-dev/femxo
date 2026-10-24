"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { AccessDenied, Card, ToastProvider } from "@/components/admin-ui";
import { RequireSession } from "@/features/auth";
import { AdminShell } from "./AdminShell";

/**
 * Signed-out visitors go to /login and come back here. This preview of the
 * panel is the Super Admin's view; other roles see "Access denied" until
 * permission-based menus are wired to /access/me.
 */
export function AdminGate({ children }: { children: ReactNode }) {
  return (
    <RequireSession pendingClassName="grid min-h-dvh place-items-center p-6">
      {(user) =>
        user.isSuperAdmin ? (
          <ToastProvider>
            <AdminShell user={user}>{children}</AdminShell>
          </ToastProvider>
        ) : (
          <div className="grid min-h-dvh place-items-center p-4">
            <Card className="w-full max-w-md">
              <AccessDenied
                message="This preview of the admin panel is for the Super Admin account."
                action={
                  <Link href="/account" className="fx-btn fx-btn--secondary">
                    Back to your account
                  </Link>
                }
              />
            </Card>
          </div>
        )
      }
    </RequireSession>
  );
}
