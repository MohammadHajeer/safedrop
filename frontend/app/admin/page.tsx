import type { Metadata } from "next";

import { AdminOverviewClient } from "@/components/admin/admin-overview-client";

export const metadata: Metadata = { title: "Admin overview" };

export default function AdminPage() {
  return <AdminOverviewClient />;
}
