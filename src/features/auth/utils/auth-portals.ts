import type { AuthPortalType } from "../types/auth";

export interface AuthPortal {
  slug: string;
  accountType: AuthPortalType;
  label: string;
  accessLabel: string;
  loginTitle: string;
  loginDescription: string;
  asideTitle: string;
  asideDescription: string;
}

export const AUTH_PORTALS: AuthPortal[] = [
  {
    slug: "customer",
    accountType: "customer",
    label: "Customer",
    accessLabel: "Customer account",
    loginTitle: "Customer sign in",
    loginDescription: "Sign in to your FEMXO customer account.",
    asideTitle: "Your FEMXO services, all in one place.",
    asideDescription: "A simple, secure sign-in for customers.",
  },
  {
    slug: "dealer",
    accountType: "dealer",
    label: "Dealer",
    accessLabel: "Dealer workspace",
    loginTitle: "Dealer sign in",
    loginDescription: "Sign in to your FEMXO dealer workspace.",
    asideTitle: "Your dealer workspace, ready when you are.",
    asideDescription: "Access the tools and updates for your dealer account.",
  },
  {
    slug: "sub-dealer",
    accountType: "sub_dealer",
    label: "Sub-dealer",
    accessLabel: "Sub-dealer workspace",
    loginTitle: "Sub-dealer sign in",
    loginDescription: "Sign in to your FEMXO sub-dealer workspace.",
    asideTitle: "Your sub-dealer workspace, ready when you are.",
    asideDescription: "Access the tools and updates for your sub-dealer account.",
  },
  {
    slug: "retail-partner",
    accountType: "retail_partner",
    label: "Retail Partner",
    accessLabel: "Retail Partner workspace",
    loginTitle: "Retail Partner sign in",
    loginDescription: "Sign in to your FEMXO retail partner workspace.",
    asideTitle: "Your partner workspace, ready when you are.",
    asideDescription: "Access the tools and updates for your retail partner account.",
  },
  {
    slug: "super-admin",
    accountType: "super_admin",
    label: "Super Admin",
    accessLabel: "Super Admin access",
    loginTitle: "Super Admin sign in",
    loginDescription: "Use your provisioned Super Admin account to continue.",
    asideTitle: "Privileged access, handled with care.",
    asideDescription:
      "Super Admin access is provisioned by FEMXO or through an authorized invitation. It cannot be created through public registration.",
  },
];

export function getAuthPortal(slug: string) {
  return AUTH_PORTALS.find((portal) => portal.slug === slug);
}

export function getAuthPortalSlug(accountType: AuthPortalType) {
  return AUTH_PORTALS.find((portal) => portal.accountType === accountType)?.slug;
}
