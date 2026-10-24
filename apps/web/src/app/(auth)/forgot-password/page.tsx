import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Phone } from "lucide-react";
import { AuthShell } from "@/features/auth";
import { CONTACT } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "How to get back into your Femxo account.",
  robots: { index: false, follow: false },
};

// The backend has no self-service reset on purpose: accounts are created by
// an admin or dealer, and they reset passwords (POST /users/:id/password-reset).
const STEPS = [
  {
    title: "Contact your admin or dealer",
    description: "The person who created your account can reset it. Not sure who that is? Call Femxo.",
  },
  {
    title: "They set a temporary password",
    description: "They'll share it with you directly. Your old sessions are signed out.",
  },
  {
    title: "Sign in and choose your own",
    description: "Femxo asks you for a new password straight away, before anything else.",
  },
] as const;

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account help"
      title="Forgot your password?"
      description="For your security, passwords are reset by your admin - not by email or SMS."
    >
      <ol className="relative space-y-3 pl-10">
        <span aria-hidden="true" className="dots-y is-live absolute bottom-8 left-[15px] top-8 w-0.5" />
        {STEPS.map((step, i) => (
          <li key={step.title} className="card-raised relative rounded-2xl p-4">
            <span className="absolute -left-10 top-4 flex size-8 items-center justify-center rounded-full bg-gold-400 font-display text-sm font-bold text-ink">
              {i + 1}
            </span>
            <p className="font-display text-base font-bold text-foreground">{step.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <a href={CONTACT.phoneHref} className="btn-gold">
          <Phone size={17} aria-hidden="true" /> Call Femxo
        </a>
        <Link href="/login" className="btn-outline">
          <ArrowLeft size={17} aria-hidden="true" /> Back to sign in
        </Link>
      </div>
    </AuthShell>
  );
}
