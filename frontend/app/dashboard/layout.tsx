import type { ReactNode } from "react";
import { AuthenticatedShell } from "@/components/app/authenticated-shell";
import { requireCurrentUser } from "@/lib/server/auth";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireCurrentUser();

  return (
    <AuthenticatedShell user={user}>{children}</AuthenticatedShell>
  );
}
