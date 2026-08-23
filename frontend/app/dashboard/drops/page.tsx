import type { Metadata } from "next";
import { PlusIcon } from "lucide-react";

import { DropsList } from "@/components/drops/drops-list";
import { ButtonLink } from "@/components/ui/button-link";
import type { DropStatus } from "@/lib/api/drops";
import { getServerDrops } from "@/lib/server/data";

export const metadata: Metadata = { title: "My Drops" };

const statuses: DropStatus[] = ["active", "expired", "consumed", "revoked"];

export default async function DropsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  const query = await searchParams;
  const parsedPage = Number.parseInt(query.page ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const status = statuses.includes(query.status as DropStatus) ? query.status as DropStatus : "active";
  const search = query.search?.trim().slice(0, 100) || undefined;
  const params = { page, page_size: 10, status, search };
  const initialData = await getServerDrops(params);

  return (
    <div className="space-y-7">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">Manage</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">My Drops</h1>
          <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
            Search, review, update, or revoke the temporary shares you own.
          </p>
        </div>
        <ButtonLink href="/dashboard/drops/new" size="lg" className="h-11 rounded-full px-5">
          <PlusIcon /> Create Drop
        </ButtonLink>
      </header>
      <DropsList params={params} initialData={initialData} />
    </div>
  );
}
