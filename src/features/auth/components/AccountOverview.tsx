"use client";

import {
  BarChart3,
  Check,
  ClipboardList,
  KeyRound,
  Loader2,
  LogOut,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Container } from "@/components/shared/Container";
import { Logo } from "@/components/shared/Logo";
import { CONTACT } from "@/lib/constants";
import { primaryRole, type RoleModule } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { authApi } from "../services/auth-api";
import type { AccessSummary, AuthUser, TerritoryTrail } from "../types/auth";
import { groupPermissions, territoryTypeLabel } from "../utils/permissions";
import { FormAlert } from "./AuthFormParts";
import { useAuthSession } from "./AuthSessionProvider";
import { RequireSession } from "./RequireSession";

/** Breadcrumbs for at most this many assigned territories; the rest are listed by ID. */
const MAX_TRAILS = 6;

// For a role the site doesn't recognise (admins can name roles freely).
const GENERIC_WORKSPACE = {
  workspace: "Femxo Workspace",
  tagline: "Your tools, shaped by your role and your area.",
  modules: [
    { icon: ShoppingCart, title: "Orders", description: "Place and track orders" },
    { icon: ClipboardList, title: "Products", description: "Prices and stock at a glance" },
    { icon: Users, title: "Your network", description: "The people you work with" },
    { icon: BarChart3, title: "Reports", description: "How your area is doing" },
  ] as readonly RoleModule[],
};

const LAUNCH_PHASES = ["Prepare", "Pilot", "Learn and improve", "Expand"] as const;

type Territory = { id: string; trail: TerritoryTrail | null };

const placeName = ({ id, trail }: Territory) =>
  trail ? [...trail.ancestors, trail.territory].map((place) => place.name).join(" › ") : id;

/**
 * What a signed-in user sees today: their role's workspace, announced as
 * coming soon, plus what their role and territory already grant.
 */
export function AccountOverview({ user }: { user: AuthUser }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signOut } = useAuthSession();
  const [access, setAccess] = useState<AccessSummary | null>(null);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [error, setError] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const summary = await authApi.access();
        if (!active) return;
        setAccess(summary);
        // Names come from the territory tree; sales territories need
        // territory.view to look up, so those are shown by type only.
        const resolved = await Promise.all(
          summary.territoryIds.map(async (id, index) => ({
            id,
            trail:
              index < MAX_TRAILS && !id.startsWith("sales:")
                ? await authApi.territory(id).catch(() => null)
                : null,
          }))
        );
        if (active) setTerritories(resolved);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "We couldn't load your access.");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function handleSignOut() {
    setIsSigningOut(true);
    await signOut();
    router.replace("/login");
  }

  const role = access ? primaryRole(access.isSuperAdmin, access.roles) : null;
  const experience = role ?? GENERIC_WORKSPACE;
  const RoleIcon = role?.icon ?? Sparkles;
  const firstName = user.name.split(/\s+/)[0] || user.name;
  const shownTerritories = territories.length
    ? territories
    : (access?.territoryIds ?? []).map((id) => ({ id, trail: null }));
  const areaLabel = access?.isSuperAdmin
    ? "Every state"
    : shownTerritories[0]
      ? (shownTerritories[0].trail?.territory.name ?? territoryTypeLabel(shownTerritories[0].id))
      : role?.scope === "Self"
        ? "Your own account"
        : null;

  return (
    <div className="min-h-svh">
      {/* Top bar */}
      <header className="border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <Container className="flex h-16 items-center justify-between gap-3">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              aria-label="Sign out"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
            >
              {isSigningOut ? <Loader2 size={16} aria-hidden="true" className="animate-spin" /> : <LogOut size={16} aria-hidden="true" />}
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </Container>
      </header>

      <Container className="space-y-6 py-6 sm:py-10">
        {searchParams.get("passwordChanged") && (
          <FormAlert tone="success">Password changed. You&rsquo;ve been signed out on your other devices.</FormAlert>
        )}
        {error && <FormAlert>{error}</FormAlert>}

        {/* Hero: the role's workspace, announced */}
        <section
          aria-labelledby="workspace-heading"
          className="ink band-ink relative overflow-hidden rounded-[2rem] px-6 py-10 ring-1 ring-white/10 sm:px-10 lg:py-14"
        >
          <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-50" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="min-w-0">
              <p className="eyebrow">
                Coming soon{role ? ` · ${role.name} workspace` : ""}
              </p>
              {access ? (
                <h1 id="workspace-heading" className="mt-4 font-display text-[clamp(2.1rem,6vw,3.75rem)] font-bold leading-[1.02] tracking-tight text-foreground">
                  Namaste {firstName}, your <span className="text-gold">{experience.workspace}</span> is almost here.
                </h1>
              ) : (
                <div className="mt-4 space-y-3" aria-hidden="true">
                  <div className="skeleton-sheen h-12 w-4/5 rounded-xl" />
                  <div className="skeleton-sheen h-12 w-3/5 rounded-xl" />
                </div>
              )}
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {experience.tagline} We&rsquo;re building it now - your account is ready for the day it opens.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {role && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-400 px-3 py-1.5 text-xs font-bold text-ink">
                    <RoleIcon size={14} aria-hidden="true" /> {role.name}
                  </span>
                )}
                {areaLabel && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 bg-secondary/70 px-3 py-1.5 text-xs font-semibold text-foreground">
                    <MapPin size={14} aria-hidden="true" className="text-highlight" /> {areaLabel}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 bg-secondary/70 px-3 py-1.5 text-xs font-semibold text-foreground">
                  <ShieldCheck size={14} aria-hidden="true" className="text-highlight" /> {user.email}
                </span>
              </div>
            </div>

            {/* Orbit: the role at the centre, its tools circling */}
            <div className="relative mx-auto aspect-square w-full max-w-[17rem] sm:max-w-[20rem]" aria-hidden="true">
              {/* Rings stay still; only the carrier inside turns. */}
              <div className="orbit absolute inset-[4%]" />
              <div className="orbit-carrier animate-orbit inset-[4%]">
                {experience.modules.map(({ icon: Icon, title }, i) => {
                  // Four tools spaced evenly around the ring.
                  const angle = ((i * 90 + 45) * Math.PI) / 180;
                  return (
                    <span
                      key={title}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${50 + 50 * Math.cos(angle)}%`, top: `${50 + 50 * Math.sin(angle)}%` }}
                    >
                      <span className="animate-orbit-counter flex size-12 items-center justify-center rounded-2xl border border-white/15 bg-brand-800/90 text-gold-300 shadow-lg">
                        <Icon size={20} />
                      </span>
                    </span>
                  );
                })}
              </div>
              <div className="orbit absolute inset-[26%]" />
              <div className="absolute inset-[32%] flex items-center justify-center rounded-full bg-gradient-to-b from-brand-500 to-brand-800 text-white shadow-[0_0_70px_12px_rgba(164,83,194,0.45)]">
                <span className="animate-ping-soft absolute inset-0 rounded-full bg-brand-400/30" />
                <RoleIcon size={40} strokeWidth={1.6} className="relative" />
              </div>
            </div>
          </div>

          {/* Launch phases, from the roadmap */}
          <ol className="relative mt-10 grid grid-cols-4 gap-2 border-t border-foreground/10 pt-6 text-center sm:gap-4">
            <span aria-hidden="true" className="dots-x is-live absolute left-[12.5%] right-[12.5%] top-[34px] h-0.5" />
            {LAUNCH_PHASES.map((phase, i) => (
              <li key={phase} className="relative flex flex-col items-center gap-2">
                <span
                  className={cn(
                    "relative flex size-5 items-center justify-center rounded-full",
                    i === 0 ? "bg-gold-400" : "border border-foreground/25 bg-background"
                  )}
                >
                  {i === 0 && <span className="animate-ping-soft absolute inset-0 rounded-full bg-gold-400" />}
                </span>
                <span className={cn("text-[11px] font-semibold sm:text-xs", i === 0 ? "text-gold" : "text-muted-foreground")}>
                  {phase}
                  {i === 0 && <span className="block font-normal text-muted-foreground">We are here</span>}
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* What the workspace will hold */}
        <section aria-labelledby="modules-heading">
          <h2 id="modules-heading" className="font-display text-xl font-bold text-foreground sm:text-2xl">
            What your {experience.workspace} will do
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {experience.modules.map(({ icon: Icon, title, description }, i) => (
              <li key={title} className="card-raised relative overflow-hidden rounded-3xl p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <span className="icon-tile">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-highlight">
                    Soon
                  </span>
                </div>
                <h3 className="mt-3 font-display text-sm font-bold leading-snug text-foreground sm:mt-4 sm:text-base">{title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">{description}</p>
                {/* A sketch of the screen to come */}
                <div className="mt-5 hidden space-y-2 sm:block" aria-hidden="true">
                  <div className="skeleton-sheen h-2.5 w-full rounded-full" style={{ animationDelay: `${i * 150}ms` }} />
                  <div className="skeleton-sheen h-2.5 w-3/4 rounded-full" style={{ animationDelay: `${i * 150 + 80}ms` }} />
                  <div className="flex gap-2 pt-1">
                    <div className="skeleton-sheen h-8 flex-1 rounded-lg" style={{ animationDelay: `${i * 150 + 160}ms` }} />
                    <div className="skeleton-sheen h-8 w-10 rounded-lg" style={{ animationDelay: `${i * 150 + 240}ms` }} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* What the account already grants */}
        <section aria-labelledby="access-heading" className="grid gap-4 lg:grid-cols-[1fr_1fr_0.8fr]">
          <h2 id="access-heading" className="sr-only">
            Your access today
          </h2>
          <div className="card-raised rounded-3xl p-5 sm:p-6">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
              <ShieldCheck size={18} aria-hidden="true" className="text-highlight" /> What you can do
            </h3>
            {!access ? (
              !error && <Loading />
            ) : access.isSuperAdmin ? (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Everything. Super Admins hold every permission, including creating roles and assigning territories.
              </p>
            ) : (
              <ul className="mt-3 space-y-1.5">
                {(role?.can ?? []).map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-foreground">
                    <Check size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-gold" />
                    {item}
                  </li>
                ))}
                {groupPermissions(access.permissions).flatMap((group) =>
                  group.permissions.map((permission) => (
                    <li key={permission.name} className="flex gap-2 text-sm text-foreground">
                      <Check size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-gold" />
                      {permission.description}
                    </li>
                  ))
                )}
                {!role && access.permissions.length === 0 && (
                  <li className="text-sm leading-relaxed text-muted-foreground">
                    No permissions yet - ask your admin to assign you a role.
                  </li>
                )}
              </ul>
            )}
          </div>

          <div className="card-raised rounded-3xl p-5 sm:p-6">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
              <MapPin size={18} aria-hidden="true" className="text-highlight" /> Where
            </h3>
            {!access ? (
              !error && <Loading />
            ) : access.isSuperAdmin ? (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Every state and every record.</p>
            ) : shownTerritories.length === 0 ? (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {role?.scope === "Self"
                  ? "Your own orders and account."
                  : role?.id === "warehouse"
                    ? "Your warehouse, once it's set up in Femxo."
                    : "No territory assigned yet. Your admin assigns territories."}
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {shownTerritories.map((territory) => (
                  <li key={territory.id} className="rounded-xl border border-border bg-secondary/40 px-3.5 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {territoryTypeLabel(territory.id)}
                    </p>
                    <p className="text-sm font-semibold text-foreground">{placeName(territory)}</p>
                  </li>
                ))}
                <li className="text-xs text-muted-foreground">…and everything inside.</li>
              </ul>
            )}
          </div>

          <div className="card-raised flex flex-col gap-3 rounded-3xl p-5 sm:p-6">
            <h3 className="font-display text-lg font-bold text-foreground">Account</h3>
            <p className="text-sm text-muted-foreground">
              {user.name}
              <br />
              {user.email}
            </p>
            <div className="mt-auto grid gap-2">
              <Link href="/change-password" className="btn-outline h-11">
                <KeyRound size={16} aria-hidden="true" /> Change password
              </Link>
              <a href={CONTACT.phoneHref} className="btn-outline h-11">
                <Phone size={16} aria-hidden="true" /> Talk to Femxo
              </a>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}

function Loading() {
  return (
    <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground" role="status">
      <Loader2 size={15} aria-hidden="true" className="animate-spin" /> Loading…
    </p>
  );
}

/** The account page body: needs a session with a permanent password. */
export function AccountView() {
  return (
    <RequireSession pendingClassName="flex min-h-svh items-center justify-center px-4">
      {(user) => (
        <Suspense>
          <AccountOverview user={user} />
        </Suspense>
      )}
    </RequireSession>
  );
}
