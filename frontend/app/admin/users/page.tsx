import type { Metadata } from "next";
import { Suspense } from "react";

import {
  AdminUsersClient,
  AdminUsersSkeleton,
} from "@/components/admin/admin-users-client";

export const metadata: Metadata = { title: "Users | Admin" };

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<AdminUsersSkeleton />}>
      <AdminUsersClient />
    </Suspense>
  );
}
