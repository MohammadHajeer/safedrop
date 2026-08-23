import { format, formatDistanceToNowStrict } from "date-fns";

import type { DropStatus } from "@/lib/api/drops";

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
}

export function formatDateTime(value: string): string {
  return format(new Date(value), "MMM d, yyyy · h:mm a");
}

export function relativeDate(value: string): string {
  return formatDistanceToNowStrict(new Date(value), { addSuffix: true });
}

export const statusLabels: Record<DropStatus, string> = {
  active: "Active",
  expired: "Expired",
  consumed: "Consumed",
  revoked: "Revoked",
};
