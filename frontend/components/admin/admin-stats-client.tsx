"use client";

import {
  BarChart3Icon,
  DatabaseIcon,
  PackageCheckIcon,
  PackageOpenIcon,
  UsersIcon,
} from "lucide-react";

import {
  DropSourceChart,
  DropStatusChart,
} from "@/components/admin/admin-charts";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PlatformStorageChart } from "@/components/admin/platform-storage-chart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminStats, useAdminStorage } from "@/hooks/use-admin";

function StatisticsSkeleton() {
  return (
    <div className="space-y-8" aria-label="Loading platform statistics">
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-full max-w-xl" />
        <Skeleton className="h-5 w-full max-w-2xl" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-48 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </div>
  );
}

export function AdminStatsClient() {
  const stats = useAdminStats();
  const storage = useAdminStorage();

  if (!stats.data || !storage.data) {
    if (stats.isError || storage.isError) {
      return (
        <Alert variant="destructive">
          <AlertTitle>Statistics are unavailable</AlertTitle>
          <AlertDescription>
            SafeDrop could not retrieve the aggregate platform statistics.
          </AlertDescription>
        </Alert>
      );
    }
    return <StatisticsSkeleton />;
  }

  return (
    <div
      className="space-y-8"
      aria-busy={stats.isFetching || storage.isFetching}
    >
      <AdminPageHeader
        eyebrow="Statistics"
        title="Platform statistics"
        description="Current aggregate counts from SafeDrop—no inferred trends or fabricated history."
        icon={BarChart3Icon}
      />

      <section
        aria-label="Summary metrics"
        className="grid gap-4 md:grid-cols-3"
      >
        <AdminMetricCard
          label="Active accounts"
          value={stats.data.total_users}
          description="Accounts without a soft-deletion timestamp."
          icon={UsersIcon}
        />
        <AdminMetricCard
          label="All Drops"
          value={stats.data.total_drops}
          description="Every authenticated and guest Drop created."
          icon={PackageOpenIcon}
        />
        <AdminMetricCard
          label="Currently active"
          value={stats.data.active_drops}
          description="Unexpired, unrevoked Drops with views remaining."
          icon={PackageCheckIcon}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="gap-3 p-1 shadow-none ring-border">
          <CardHeader className="px-5 pt-5 sm:px-6 sm:pt-6">
            <CardTitle className="text-lg">Drop status distribution</CardTitle>
            <p className="text-sm text-muted-foreground">
              Current aggregate counts using the same status rules as SafeDrop.
            </p>
          </CardHeader>
          <CardContent className="px-3 pb-4 sm:px-5 sm:pb-5">
            <DropStatusChart stats={stats.data} />
          </CardContent>
        </Card>

        <Card className="gap-3 p-1 shadow-none ring-border">
          <CardHeader className="px-5 pt-5 sm:px-6 sm:pt-6">
            <CardTitle className="text-lg">Drop origin</CardTitle>
            <p className="text-sm text-muted-foreground">
              Drops created by signed-in users compared with guests.
            </p>
          </CardHeader>
          <CardContent className="px-3 pb-4 sm:px-5 sm:pb-5">
            <DropSourceChart stats={stats.data} />
          </CardContent>
        </Card>
      </section>

      <Card className="gap-4 p-1 shadow-none ring-border">
        <CardHeader className="px-5 pt-5 sm:px-6 sm:pt-6">
          <CardTitle className="flex items-center gap-2 text-lg">
            <DatabaseIcon className="size-4 text-primary" aria-hidden="true" />
            Platform storage
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Real platform object usage against the configured application limit.
          </p>
        </CardHeader>
        <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
          <PlatformStorageChart usage={storage.data} />
        </CardContent>
      </Card>
    </div>
  );
}
