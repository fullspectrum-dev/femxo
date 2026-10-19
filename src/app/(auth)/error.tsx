"use client";

import Link from "next/link";

export default function AuthError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="auth-page">
      <section className="auth-card" role="alert">
        <p className="auth-eyebrow">FEMXO account security</p>
        <h1 className="auth-title">This step didn’t load</h1>
        <p className="auth-description">
          Your account details haven’t been shown here. Try again or return to
          sign in.
        </p>
        <div className="auth-inline-row" style={{ marginTop: "1.5rem" }}>
          <button className="auth-button" type="button" onClick={reset}>
            Try again
          </button>
          <Link className="auth-link" href="/login">
            Return to sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
