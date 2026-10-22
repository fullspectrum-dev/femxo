import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell, LoginForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Femxo account.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to Femxo"
      description="One sign-in for admins, dealers, field staff and partners."
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
