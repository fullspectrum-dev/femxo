import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AuthPortalLoading } from "@/features/auth/components/AuthPortalLoading";
import { ComingSoonPage } from "@/features/auth/components/ComingSoonPage";
import { AUTH_PORTALS, getAuthPortal } from "@/features/auth/utils/auth-portals";

export const metadata: Metadata = {
  title: "Coming soon",
  description: "Your FEMXO account portal is coming soon.",
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return AUTH_PORTALS.map(({ slug }) => ({ portal: slug }));
}

export default async function PortalComingSoonPage({
  params,
}: {
  params: Promise<{ portal: string }>;
}) {
  return (
    <Suspense fallback={<AuthPortalLoading />}>
      <PortalComingSoonContent params={params} />
    </Suspense>
  );
}

async function PortalComingSoonContent({
  params,
}: {
  params: Promise<{ portal: string }>;
}) {
  const { portal: slug } = await params;
  const portal = getAuthPortal(slug);
  if (!portal) notFound();
  return <ComingSoonPage portal={portal} />;
}
