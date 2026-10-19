"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { isAuthDemoMode } from "../services/demo-mode";
import type { AuthPortalType } from "../types/auth";

const accountLabels: Record<AuthPortalType, string> = {
  super_admin: "Super Admin",
  dealer: "Dealer",
  sub_dealer: "Sub-dealer",
  retail_partner: "Retail Partner",
  customer: "Customer",
};

interface AuthScreenProps {
  eyebrow: string;
  title: string;
  description: string;
  asideTitle?: string;
  asideDescription?: string;
  accountType?: AuthPortalType;
  showAccountContexts?: boolean;
  children: ReactNode;
}

export function AuthScreen({
  eyebrow,
  title,
  description,
  asideTitle = "Business, moving as one.",
  asideDescription = "A secure workspace for the people and partners behind your distribution network.",
  accountType,
  showAccountContexts = true,
  children,
}: AuthScreenProps) {
  const reduceMotion = useReducedMotion();

  return (
    <main className="auth-page">
      <section className="auth-layout" aria-label="FEMXO account access">
        <aside className="auth-aside">
          <Link href="/" className="auth-wordmark" aria-label="Femxo Consultancy Services home">
            <Image
              src="/images/femxo-consultancy-logo.png"
              alt="Femxo Consultancy Services"
              width={737}
              height={339}
              priority
              className="auth-wordmark-image"
            />
          </Link>

          <div className="auth-aside-content">
            <div className="auth-art" aria-hidden="true">
              <div className="auth-art-orbit auth-art-orbit-one" />
              <div className="auth-art-orbit auth-art-orbit-two" />
              <div className="auth-art-sphere">
                <ShieldCheck size={46} strokeWidth={1.5} />
              </div>
              <div className="auth-art-tile">
                <Sparkles size={18} />
              </div>
              <div className="auth-art-spark auth-art-spark-one" />
              <div className="auth-art-spark auth-art-spark-two" />
            </div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <p className="auth-aside-kicker">FEMXO ERP · ONE CONNECTED PLATFORM</p>
              <h2 className="auth-aside-title">{asideTitle}</h2>
              <p className="auth-aside-description">{asideDescription}</p>
            </motion.div>

            {showAccountContexts && (
              <div className="auth-role-list" aria-label="Account access">
                {accountType ? (
                  <span className="auth-role-chip">
                    {accountLabels[accountType]}
                    {accountType === "super_admin" && (
                      <span className="auth-role-note">Invited access</span>
                    )}
                  </span>
                ) : (
                  Object.values(accountLabels).map((role) => (
                    <span key={role} className="auth-role-chip">
                      {role}
                    </span>
                  ))
                )}
              </div>
            )}
          </div>

          <p className="auth-aside-footer">
            <ShieldCheck size={15} aria-hidden="true" />
            A simpler way to access your FEMXO workspace.
          </p>
          <div className="auth-decor auth-decor-one" aria-hidden="true" />
          <div className="auth-decor auth-decor-two" aria-hidden="true" />
        </aside>

        <div className="auth-main">
          <div className="auth-theme-toggle">
            <ThemeToggle />
          </div>
          <motion.section
            className="auth-card"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            aria-labelledby="auth-title"
          >
            <div className="auth-card-heading">
              <p className="auth-eyebrow">{eyebrow}</p>
              <h1 id="auth-title" className="auth-title">{title}</h1>
              <p className="auth-description">{description}</p>
            </div>
            {isAuthDemoMode && (
              <p className="auth-demo-banner" role="note" aria-label="Demo mode notice">
                <strong>DEMO MODE</strong>
                <span>
                  Public test data only. No real account or secure session is
                  created; never enter real or sensitive information.
                </span>
              </p>
            )}
            {children}
            <p className="auth-card-security">
              <ShieldCheck size={15} aria-hidden="true" />
              <span>FEMXO account access</span>
              <span className="auth-security-dot" aria-hidden="true" />
              <span>{accountType ? accountLabels[accountType] : "Secure account access"}</span>
            </p>
          </motion.section>
          <Link className="auth-home-link" href="/">
            Back to FEMXO <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
