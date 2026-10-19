import type { Metadata } from "next";
import { OtpVerificationForm } from "@/features/auth/components/OtpVerificationForm";

export const metadata: Metadata = {
  title: "Verify your account",
  description: "Verify a FEMXO account with a time-limited code.",
  robots: { index: false, follow: false },
};

export default function VerifyOtpPage() {
  return <OtpVerificationForm />;
}
