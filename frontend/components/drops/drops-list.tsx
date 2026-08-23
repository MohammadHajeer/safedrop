"use client";

import {
  SearchIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  EyeIcon,
  PlusIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";

import { useDrops } from "@/hooks/use-drops";
import type { Drop, DropStatus, GetDropsParams } from "@/lib/api/drops";
import { formatDateTime, relativeDate } from "@/lib/drop-utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DropStatusBadge } from "./drop-status-badge";

const statuses: DropStatus[] = ["active", "expired", "consumed", "revoked"];

function urlFor(params: GetDropsParams) {
  const query = new URLSearchParams();
  if (params.page && params.page > 1) query.set("page", String(params.page));
  if (params.search) query.set("search", params.search);
  if (params.status && params.status !== "active")
    query.set("status", params.status);
  const value = query.toString();
  return `/dashboard/drops${value ? `?${value}` : ""}`;
}

function DropMobileCard({ drop }: { drop: Drop }) {
  return (
    <Link
      href={`/dashboard/drops/${drop.id}`}
      className="block rounded-2xl border bg-card p-4 transition-colors hover:bg-muted/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate font-semibold">{drop.title}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Created {relativeDate(drop.created_at)}
          </p>
        </div>
        <DropStatusBadge status={drop.status} />
      </div>
      <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted-foreground">
        {drop.content}
      </p>
      <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <EyeIcon className="size-3.5" /> {drop.view_count} of {drop.max_views}{" "}
          views
        </span>
        <span>Expires {relativeDate(drop.expires_at)}</span>
      </div>
    </Link>
  );
}

export function DropsList({
  params,
}: {
  params: Required<Pick<GetDropsParams, "page" | "page_size" | "status">> &
    Pick<GetDropsParams, "search">;
}) {
  const router = useRouter();
  const query = useDrops(params);
  const data = query.data;
  const totalPages = Math.max(
    1,
    Math.ceil((data?.total ?? 0) / params.page_size),
  );

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const search = String(values.get("search") ?? "").trim();
    router.push(urlFor({ ...params, page: 1, search: search || undefined }));
  }

  function changeStatus(value: DropStatus | null) {
    if (value) router.push(urlFor({ ...params, page: 1, status: value }));
  }

  return (
    <div className="space-y-6" aria-busy={query.isFetching}>
      <form
        onSubmit={submitSearch}
        className="flex flex-col gap-3 rounded-2xl border bg-card p-3 sm:flex-row sm:items-center"
      >
        <div className="relative min-w-0 flex-1">
          <Label htmlFor="drop-search" className="sr-only">
            Search Drops
          </Label>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="drop-search"
            name="search"
            defaultValue={params.search}
            placeholder="Search titles and messages…"
            className="h-10 pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Label id="status-filter-label" className="sr-only">
            Filter by status
          </Label>
          <Select value={params.status} onValueChange={changeStatus}>
            <SelectTrigger
              aria-labelledby="status-filter-label"
              className="h-10 min-w-32 flex-1 px-3 sm:flex-none"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" variant="outline" className="h-10 px-4">
            Search
          </Button>
        </div>
      </form>

      {query.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Drops could not be loaded</AlertTitle>
          <AlertDescription>
            Check your connection and try again.
          </AlertDescription>
        </Alert>
      ) : null}

      {query.isPending ? (
        <div className="space-y-3" aria-label="Loading Drops">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : data?.items.length ? (
        <>
          <div className="space-y-3 md:hidden">
            {data.items.map((drop) => (
              <DropMobileCard key={drop.id} drop={drop} />
            ))}
          </div>
          <div className="hidden overflow-hidden rounded-2xl border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/35">
                  <TableHead className="pl-5">Drop</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="w-24 text-right pr-5">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((drop) => (
                  <TableRow key={drop.id}>
                    <TableCell className="max-w-80 py-4 pl-5">
                      <p className="truncate font-medium">{drop.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Created {formatDateTime(drop.created_at)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <DropStatusBadge status={drop.status} />
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {drop.view_count} / {drop.max_views}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {relativeDate(drop.expires_at)}
                      </span>
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <ButtonLink
                        href={`/dashboard/drops/${drop.id}`}
                        variant="ghost"
                      >
                        Manage
                      </ButtonLink>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <section className="rounded-3xl border bg-card px-6 py-12 text-center sm:py-16">
          <Image
            src="/illustrations/empty-state.webp"
            alt="An empty SafeDrop inbox"
            width={380}
            height={253}
            className="mx-auto h-auto w-full max-w-[280px]"
          />
          <h2 className="mt-4 text-2xl font-semibold tracking-tight">
            No {params.status} Drops found
          </h2>
          <p className="mx-auto mt-2 max-w-md leading-7 text-muted-foreground">
            {params.search
              ? "Try another search, or clear the search to see everything in this status."
              : "Create a Drop and it will appear here while you stay in control of its lifetime."}
          </p>
          <ButtonLink
            href="/dashboard/drops/new"
            className="mt-6 h-11 rounded-full px-5"
          >
            <PlusIcon /> Create Drop
          </ButtonLink>
        </section>
      )}

      {data && data.total > 0 ? (
        <div className="flex flex-col items-center justify-between gap-3 border-t pt-5 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Page {data.page} of {totalPages} · {data.total}{" "}
            {data.total === 1 ? "Drop" : "Drops"}
          </p>
          <div className="flex items-center gap-2">
            <ButtonLink
              href={urlFor({ ...params, page: Math.max(1, params.page - 1) })}
              variant="outline"
              aria-disabled={params.page <= 1}
              className={
                params.page <= 1 ? "pointer-events-none opacity-50" : ""
              }
            >
              <ArrowLeftIcon /> Previous
            </ButtonLink>
            <ButtonLink
              href={urlFor({
                ...params,
                page: Math.min(totalPages, params.page + 1),
              })}
              variant="outline"
              aria-disabled={params.page >= totalPages}
              className={
                params.page >= totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            >
              Next <ArrowRightIcon data-icon="inline-end" />
            </ButtonLink>
          </div>
        </div>
      ) : null}
      {query.isFetching && !query.isPending ? (
        <p role="status" className="sr-only">
          Refreshing Drops…
        </p>
      ) : null}
    </div>
  );
}
