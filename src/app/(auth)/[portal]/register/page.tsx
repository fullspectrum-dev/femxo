import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { AuthPortalLoading } from "@/features/auth/components/AuthPortalLoading";
import { AUTH_PORTALS, getAuthPortal } from "@/features/auth/utils/auth-portals";

export function generateStaticParams() {
  return AUTH_PORTALS.filter(
    (portal) => portal.accountType !== "super_admin"
  ).map(({ slug }) => ({ portal: slug }));
}

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create a FEMXO account for your account type.",
  robots: { index: false, follow: false },
};

export default async function PortalRegisterPage({
  params,
}: {
  params: Promise<{ portal: string }>;
}) {
  return (
    <Suspense fallback={<AuthPortalLoading />}>
      <PortalRegisterContent params={params} />
    </Suspense>
  );
}

async function PortalRegisterContent({
  params,
}: {
  params: Promise<{ portal: string }>;
}) {
  const { portal: slug } = await params;
  const portal = getAuthPortal(slug);
  if (!portal || portal.accountType === "super_admin") notFound();

  return <RegisterForm accountType={portal.accountType} />;
}
