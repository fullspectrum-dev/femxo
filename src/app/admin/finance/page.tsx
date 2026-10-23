import type { Metadata } from "next";
import { ModulePage } from "@/features/admin/modules/ModulePage";

// Rendered after the in-browser session check; see ../layout.tsx.
export const instant = false;

export const metadata: Metadata = { title: "Finance & Wallet" };

export default function FinancePage() {
  return <ModulePage moduleKey="finance" />;
}
