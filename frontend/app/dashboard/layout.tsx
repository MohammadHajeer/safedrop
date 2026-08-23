import type { ReactNode } from "react";
import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { requireCurrentUser } from "@/lib/server/auth";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireCurrentUser();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-8">
      <nav className="flex flex-wrap items-center gap-4 underline">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/dashboard/drops">My Drops</Link>
        <Link href="/dashboard/drops/new">Create Drop</Link>
        <Link href="/profile">Profile</Link>
        <Link href="/admin">Admin</Link>
        <LogoutButton />
      </nav>
      {children}
    </div>
  );
}
