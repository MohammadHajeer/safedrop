import { bffFetch } from "./bff";

export type StorageUsage = {
  used_bytes: number;
  limit_bytes: number;
  remaining_bytes: number;
  percentage: number;
};

export function getStorageUsage(): Promise<StorageUsage> {
  return bffFetch<StorageUsage>("/api/stats/me/storage");
}
