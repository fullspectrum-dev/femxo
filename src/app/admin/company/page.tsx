import type { Metadata } from "next";
import { CompanyOverview } from "@/features/admin/company/CompanyOverview";

// Rendered after the in-browser session check; see ../layout.tsx.
export const instant = false;

export const metadata: Metadata = { title: "Company Overview" };

export default function CompanyPage() {
  return <CompanyOverview />;
}
