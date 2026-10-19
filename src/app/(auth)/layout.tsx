import type { ReactNode } from "react";
import { AuthFlowProvider } from "@/features/auth";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthFlowProvider>{children}</AuthFlowProvider>;
}
