import type { Metadata } from "next";
import { AuthShell, ChangePasswordView } from "@/features/auth";

export const metadata: Metadata = {
  title: "Change password",
  robots: { index: false, follow: false },
};

export default function ChangePasswordPage() {
  return (
    <AuthShell
      eyebrow="Account security"
      title="Choose a new password"
      description="Use a password you don't use anywhere else."
    >
      <ChangePasswordView />
    </AuthShell>
  );
}
