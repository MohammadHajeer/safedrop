"use client";

import Link from "next/link";
import {
  ActivityIcon,
  ArrowRightIcon,
  DatabaseIcon,
  PackageCheckIcon,
  PackageOpenIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react";

import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PlatformStorageChart } from "@/components/admin/platform-storage-chart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminStats, useAdminStorage } from "@/hooks/use-admin";

function OverviewSkeleton() {
  return (
    <div className="space-y-8" aria-label="Loading admin overview">
      <div className="space-y-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-10 w-full max-w-lg" />
        <Skeleton className="h-5 w-full max-w-2xl" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-52 rounded-2xl" />
        <Skeleton className="h-52 rounded-2xl" />
        <Skeleton className="h-52 rounded-2xl" />
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.8fr]">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}

export function AdminOverviewClient() {
  const stats = useAdminStats();
  const storage = useAdminStorage();

  if (!stats.data || !storage.data) {
    if (stats.isError || storage.isError) {
      return (
        <Alert variant="destructive">
          <AlertTitle>Admin overview could not be loaded</AlertTitle>
          <AlertDescription>
            The platform data is unavailable. Check the API connection and try
            again.
          </AlertDescription>
        </Alert>
      );
    }
    return <OverviewSkeleton />;
  }

  return (
    <div
      className="space-y-8"
      aria-busy={stats.isFetching || storage.isFetching}
    >
      <AdminPageHeader
        eyebrow="Administration"
        title="Platform overview"
        description="A concise view of SafeDrop accounts, Drops, and the physical storage currently reserved across the platform."
        icon={ShieldCheckIcon}
        action={
          <ButtonLink href="/admin/users" className="h-11 rounded-full px-5">
            <UsersIcon /> Manage users
          </ButtonLink>
        }
      />

      <section
        aria-label="Platform metrics"
        className="grid gap-4 md:grid-cols-3"
      >
        <AdminMetricCard
          label="Active accounts"
          value={stats.data.total_users}
          description="Non-deleted accounts currently able to use SafeDrop."
          icon={UsersIcon}
        />
        <AdminMetricCard
          label="Active Drops"
          value={stats.data.active_drops}
          description="Drops that recipients can access right now."
          icon={PackageCheckIcon}
        />
        <AdminMetricCard
          label="All Drops"
          value={stats.data.total_drops}
          description="Authenticated and guest Drops across every status."
          icon={PackageOpenIcon}
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.35fr_0.8fr]">
        <Card className="gap-4 p-1 shadow-none ring-border">
          <CardHeader className="px-5 pt-5 sm:px-6 sm:pt-6">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <DatabaseIcon className="size-4" aria-hidden="true" />
              </span>
              <div>
                <CardTitle className="text-lg">Platform storage</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Physical object accounting until cleanup.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
            <PlatformStorageChart usage={storage.data} />
          </CardContent>
        </Card>

        <Card className="gap-0 overflow-hidden p-0 shadow-none ring-border">
          <CardHeader className="border-b px-5 py-5 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ActivityIcon
                className="size-4 text-primary"
                aria-hidden="true"
              />
              Administration
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Focused tools for the current platform state.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <Link
              href="/admin/users"
              className="group flex items-center gap-4 border-b px-5 py-5 transition-colors hover:bg-muted/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-6"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <UsersIcon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">Users</span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  Search, create, edit, and deactivate accounts.
                </span>
              </span>
              <ArrowRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/admin/stats"
              className="group flex items-center gap-4 px-5 py-5 transition-colors hover:bg-muted/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-6"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground">
                <ActivityIcon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">Statistics</span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  Compare Drop state, source, and storage.
                </span>
              </span>
              <ArrowRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
