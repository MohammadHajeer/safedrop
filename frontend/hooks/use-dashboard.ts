"use client";

import { useQueries } from "@tanstack/react-query";

import { useCurrentUser } from "@/hooks/use-auth";
import { dropListQueryOptions } from "@/hooks/use-drops";
import { useStorageUsage } from "@/hooks/use-storage";
import type { DropStatus } from "@/lib/api/drops";

const statuses: DropStatus[] = ["active", "expired", "consumed", "revoked"];

export function useDashboardData() {
  const user = useCurrentUser();
  const storage = useStorageUsage();
  const dropQueries = useQueries({
    queries: statuses.map((status) =>
      dropListQueryOptions({ status, page: 1, page_size: 5 }),
    ),
  });

  const [active, expired, consumed, revoked] = dropQueries;
  const isPending =
    user.isPending ||
    storage.isPending ||
    dropQueries.some((query) => query.isPending);
  const isError =
    user.isError ||
    storage.isError ||
    dropQueries.some((query) => query.isError);

  return {
    user,
    storage,
    active,
    expired,
    consumed,
    revoked,
    isPending,
    isError,
  };
}
