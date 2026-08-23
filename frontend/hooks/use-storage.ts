"use client";

import { useQuery } from "@tanstack/react-query";

import { getStorageUsage } from "@/lib/api/stats";

export const storageKeys = {
  all: ["storage"] as const,
  usage: ["storage", "usage"] as const,
};

export function useStorageUsage() {
  return useQuery({
    queryKey: storageKeys.usage,
    queryFn: getStorageUsage,
  });
}
