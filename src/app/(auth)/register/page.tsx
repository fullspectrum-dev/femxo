import type { Metadata } from "next";
import { AuthPortalSelection } from "@/features/auth/components/AuthPortalSelection";

export const metadata: Metadata = {
  title: "Choose your account",
  description: "Choose the account type you want to create.",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return <AuthPortalSelection mode="register" />;
}
