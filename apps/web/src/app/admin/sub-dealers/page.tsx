import type { Metadata } from "next";
import { ModulePage } from "@/features/admin/modules/ModulePage";

// Rendered after the in-browser session check; see ../layout.tsx.
export const instant = false;

export const metadata: Metadata = { title: "Sub-Dealers" };

export default function SubDealersPage() {
  return <ModulePage moduleKey="sub-dealers" />;
}
