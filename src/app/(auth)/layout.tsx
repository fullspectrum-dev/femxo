import type { ReactNode } from "react";
import { AuthSessionProvider } from "@/features/auth";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthSessionProvider>{children}</AuthSessionProvider>;
}
