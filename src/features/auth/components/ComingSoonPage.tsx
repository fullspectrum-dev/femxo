"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft, ArrowUpRight, BellRing, Clock3, ShieldCheck, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { isAuthDemoMode } from "../services/demo-mode";
import { AuthPortalLoading } from "./AuthPortalLoading";
import { getAuthPortalSlug } from "../utils/auth-portals";
import type { AuthPortal } from "../utils/auth-portals";
import { useAuthFlow } from "./AuthFlowProvider";

export function ComingSoonPage({ portal }: { portal: AuthPortal }) {
  const router = useRouter();
  const { signedInAccountType } = useAuthFlow();
  const isAuthorized = signedInAccountType === portal.accountType;
  const loginHref = `/${getAuthPortalSlug(portal.accountType) ?? "customer"}/login`;

  useEffect(() => {
    if (isAuthorized) return;
    router.replace(loginHref);
  }, [isAuthorized, loginHref, router]);

  if (!isAuthorized) return <AuthPortalLoading />;

  return (
    <main className="coming-soon-page">
      <div className="coming-soon-glow coming-soon-glow-one" aria-hidden="true" />
      <div className="coming-soon-glow coming-soon-glow-two" aria-hidden="true" />
      <header className="coming-soon-header">
        <Link href="/" className="coming-soon-brand" aria-label="Femxo Consultancy Services home">
          <Image
            src="/images/femxo-consultancy-logo.png"
            alt="Femxo Consultancy Services"
            width={737}
            height={339}
            priority
          />
        </Link>
        <div className="coming-soon-header-actions">
          <span className="coming-soon-account">
            <ShieldCheck size={15} aria-hidden="true" />
            {portal.label} portal
          </span>
          <ThemeToggle />
        </div>
      </header>

      <section className="coming-soon-content" aria-labelledby="coming-soon-title">
        <div className="coming-soon-copy">
          <p className="coming-soon-eyebrow">
            <span className="coming-soon-status-dot" aria-hidden="true" />
            {isAuthDemoMode ? "Demo access" : "Signed in"} · {portal.label}
          </p>
          <h1 id="coming-soon-title">
            Something thoughtful
            <span>is on its way.</span>
          </h1>
          <p className="coming-soon-description">
            Your dedicated FEMXO {portal.label.toLowerCase()} experience is
            getting ready. We’re building a simpler space for everything you
            need.
          </p>
          <div className="coming-soon-actions">
            <Link className="coming-soon-primary" href="/">
              Explore FEMXO <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
            <Link className="coming-soon-secondary" href={loginHref}>
              <ArrowLeft size={16} aria-hidden="true" />
              Back to {portal.label} sign in
            </Link>
          </div>
          <p className="coming-soon-security">
            <ShieldCheck size={15} aria-hidden="true" />
            {isAuthDemoMode
              ? `You’re viewing a demo of the ${portal.label} experience. No real account is signed in.`
              : `You’re signed in to the ${portal.label} experience.`}
          </p>
        </div>

        <div className="coming-soon-art" aria-label={`${portal.label} portal coming soon`}>
          <div className="coming-soon-orbit coming-soon-orbit-one" aria-hidden="true" />
          <div className="coming-soon-orbit coming-soon-orbit-two" aria-hidden="true" />
          <div className="coming-soon-art-card">
            <span className="coming-soon-art-spark" aria-hidden="true">
              <Sparkles size={22} />
            </span>
            <div className="coming-soon-art-icon">
              <Clock3 size={48} strokeWidth={1.4} aria-hidden="true" />
            </div>
            <span className="coming-soon-art-label">MADE FOR YOUR NEXT</span>
            <strong>{portal.label}</strong>
            <span className="coming-soon-art-progress">
              <span />
            </span>
            <span className="coming-soon-art-ready">
              <BellRing size={14} aria-hidden="true" />
              Coming soon
            </span>
          </div>
          <span className="coming-soon-float coming-soon-float-one" aria-hidden="true">
            ✦
          </span>
          <span className="coming-soon-float coming-soon-float-two" aria-hidden="true">
            <Sparkles size={18} />
          </span>
        </div>
      </section>

      <footer className="coming-soon-footer">
        <span>© {new Date().getFullYear()} FEMXO Consultancy Services</span>
        <span className="coming-soon-footer-note">A little more FEMXO, coming your way.</span>
      </footer>
    </main>
  );
}
