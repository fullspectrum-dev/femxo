"use client";

import Link from "next/link";
import { AuthShell } from "@/features/auth";

export default function AuthError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <AuthShell
      eyebrow="Account security"
      title="This step didn't load"
      description="None of your account details were shown. Try again, or go back to sign in."
    >
      <div className="grid gap-3 sm:grid-cols-2" role="alert">
        <button className="btn-gold" type="button" onClick={reset}>
          Try again
        </button>
        <Link className="btn-outline" href="/login">
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  );
}
