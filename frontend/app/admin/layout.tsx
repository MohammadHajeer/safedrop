import type { ReactNode } from "react";

import { AuthenticatedShell } from "@/components/app/authenticated-shell";
import { requireAdminUser } from "@/lib/server/auth";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdminUser();

  return <AuthenticatedShell>{children}</AuthenticatedShell>;
}
