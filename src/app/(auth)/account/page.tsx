import type { Metadata } from "next";
import { AccountView } from "@/features/auth";

export const metadata: Metadata = {
  title: "Your workspace",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <AccountView />;
}
