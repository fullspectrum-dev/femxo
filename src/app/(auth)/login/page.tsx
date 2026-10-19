import type { Metadata } from "next";
import { AuthPortalSelection } from "@/features/auth/components/AuthPortalSelection";

export const metadata: Metadata = {
  title: "Choose your sign-in",
  description: "Choose the right FEMXO sign-in for your account type.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <AuthPortalSelection mode="login" />;
}
