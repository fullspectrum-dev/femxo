import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { AuthPortalLoading } from "@/features/auth/components/AuthPortalLoading";
import { AUTH_PORTALS, getAuthPortal } from "@/features/auth/utils/auth-portals";

export function generateStaticParams() {
  return AUTH_PORTALS.map(({ slug }) => ({ portal: slug }));
}

export const metadata: Metadata = {
  title: "Account recovery",
  description: "Recover access to your FEMXO account.",
  robots: { index: false, follow: false },
};

export default async function PortalForgotPasswordPage({
  params,
}: {
  params: Promise<{ portal: string }>;
}) {
  return (
    <Suspense fallback={<AuthPortalLoading />}>
      <PortalForgotPasswordContent params={params} />
    </Suspense>
  );
}

async function PortalForgotPasswordContent({
  params,
}: {
  params: Promise<{ portal: string }>;
}) {
  const { portal: slug } = await params;
  const portal = getAuthPortal(slug);
  if (!portal) notFound();

  return <ForgotPasswordForm accountType={portal.accountType} />;
}
