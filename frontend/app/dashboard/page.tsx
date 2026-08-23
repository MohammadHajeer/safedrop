import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  CirclePlusIcon,
  Clock3Icon,
  EyeIcon,
  PackageOpenIcon,
  ShieldCheckIcon,
} from "lucide-react";

import { StorageUsageChart } from "@/components/dashboard/storage-usage-chart";
import { DropStatusBadge } from "@/components/drops/drop-status-badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerDrops, getServerStorageUsage } from "@/lib/server/data";
import { requireCurrentUser } from "@/lib/server/auth";
import { relativeDate } from "@/lib/drop-utils";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireCurrentUser();
  const [active, expired, consumed, revoked, storage] = await Promise.all([
    getServerDrops({ status: "active", page_size: 5 }),
    getServerDrops({ status: "expired", page_size: 5 }),
    getServerDrops({ status: "consumed", page_size: 5 }),
    getServerDrops({ status: "revoked", page_size: 5 }),
    getServerStorageUsage(),
  ]);
  const recent = [...active.items, ...expired.items, ...consumed.items, ...revoked.items]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);
  const total = active.total + expired.total + consumed.total + revoked.total;

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">Overview</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
            Welcome back, {user.first_name}.
          </h1>
          <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
            Keep an eye on what is active, then share something new when you are ready.
          </p>
        </div>
        <ButtonLink href="/dashboard/drops/new" size="lg" className="h-11 rounded-full px-5">
          <CirclePlusIcon /> Create Drop
        </ButtonLink>
      </header>

      <section aria-label="Drop statistics" className="grid gap-4 lg:grid-cols-[0.72fr_0.72fr_1.56fr]">
        <Card className="gap-5 p-1 shadow-none ring-border">
          <CardContent className="p-5 sm:p-6">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <ShieldCheckIcon className="size-5" />
            </span>
            <p className="mt-7 text-3xl font-semibold tracking-tight tabular-nums">{active.total}</p>
            <p className="mt-1 text-sm font-medium">Active Drops</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Available to recipients right now.</p>
          </CardContent>
        </Card>
        <Card className="gap-5 p-1 shadow-none ring-border">
          <CardContent className="p-5 sm:p-6">
            <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-foreground">
              <PackageOpenIcon className="size-5" />
            </span>
            <p className="mt-7 text-3xl font-semibold tracking-tight tabular-nums">{total}</p>
            <p className="mt-1 text-sm font-medium">All Drops</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Across every current status.</p>
          </CardContent>
        </Card>
        <Card className="gap-4 p-1 shadow-none ring-border">
          <CardHeader className="px-5 pt-5 sm:px-6 sm:pt-6">
            <CardTitle className="text-base">Active storage</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
            <StorageUsageChart usage={storage} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.55fr_0.8fr]">
        <Card className="gap-0 overflow-hidden p-0 shadow-none ring-border">
          <CardHeader className="flex-row items-center justify-between gap-4 border-b px-5 py-4 sm:px-6">
            <div>
              <CardTitle className="text-lg">Recent Drops</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Latest activity across your account.</p>
            </div>
            <ButtonLink href="/dashboard/drops" variant="ghost" className="shrink-0">
              View all <ArrowRightIcon data-icon="inline-end" />
            </ButtonLink>
          </CardHeader>
          <CardContent className="p-0">
            {recent.length ? (
              <ul className="divide-y">
                {recent.map((drop) => (
                  <li key={drop.id}>
                    <Link
                      href={`/dashboard/drops/${drop.id}`}
                      className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-6"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                        <PackageOpenIcon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{drop.title}</p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock3Icon className="size-3.5" /> Created {relativeDate(drop.created_at)}
                        </p>
                      </div>
                      <div className="hidden items-center gap-3 sm:flex">
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <EyeIcon className="size-3.5" /> {drop.view_count}/{drop.max_views}
                        </span>
                        <DropStatusBadge status={drop.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-10 text-center">
                <Image
                  src="/illustrations/all-caught-up.webp"
                  alt="Everything is calm and caught up"
                  width={300}
                  height={200}
                  className="mx-auto h-auto w-full max-w-[210px]"
                />
                <h2 className="mt-3 text-lg font-semibold">No Drops yet</h2>
                <p className="mt-1 text-sm text-muted-foreground">Your recent Drops will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-primary/20 bg-primary-soft/35 p-6 shadow-none ring-primary/10 sm:p-7">
          <div className="relative z-10">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <CirclePlusIcon className="size-5" />
            </span>
            <h2 className="mt-6 text-2xl font-semibold tracking-[-0.025em]">Share with an expiration date.</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              Add a message, up to five files, and a view limit in one calm flow.
            </p>
            <ButtonLink href="/dashboard/drops/new" className="mt-7 h-11 rounded-full px-5">
              Create a Drop <ArrowRightIcon data-icon="inline-end" />
            </ButtonLink>
          </div>
        </Card>
      </section>
    </div>
  );
}
