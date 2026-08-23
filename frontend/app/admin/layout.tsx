import type { ReactNode } from "react";

import { AuthenticatedShell } from "@/components/app/authenticated-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AuthenticatedShell>{children}</AuthenticatedShell>;
}
