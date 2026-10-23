import type { Metadata } from "next";
import { ModulePage } from "@/features/admin/modules/ModulePage";

// Rendered after the in-browser session check; see ../layout.tsx.
export const instant = false;

export const metadata: Metadata = { title: "Roles & Permissions" };

export default function RolesPage() {
  return <ModulePage moduleKey="roles" />;
}
