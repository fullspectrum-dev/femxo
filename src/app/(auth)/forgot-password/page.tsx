import type { Metadata } from "next";
import { AuthPortalSelection } from "@/features/auth/components/AuthPortalSelection";

export const metadata: Metadata = {
  title: "Choose account recovery",
  description: "Choose the FEMXO account type you need to recover.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return <AuthPortalSelection mode="recovery" />;
}
