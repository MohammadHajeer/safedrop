import type { ReactNode } from "react";
import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { requireAdminUser } from "@/lib/server/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdminUser();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-8">
      <nav className="flex flex-wrap items-center gap-4 underline">
        <Link href="/admin">Admin</Link>
        <Link href="/admin/users">Users</Link>
        <Link href="/admin/stats">Stats</Link>
        <Link href="/dashboard">Dashboard</Link>
        <LogoutButton />
      </nav>
      {children}
    </div>
  );
}
