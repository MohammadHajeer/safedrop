import type { Metadata } from "next";

import { AdminStatsClient } from "@/components/admin/admin-stats-client";

export const metadata: Metadata = { title: "Statistics | Admin" };

export default function AdminStatsPage() {
  return <AdminStatsClient />;
}
