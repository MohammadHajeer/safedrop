import "server-only";

import { cookies } from "next/headers";

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth-cookies";
import type { Drop, GetDropsParams, PaginatedDrops } from "@/lib/api/drops";
import type { DropFile } from "@/lib/api/drops";
import type { StorageUsage } from "@/lib/api/stats";

import { backendFetch, withBearerToken } from "./backend";

/** Direct FastAPI access for authenticated Server Components and helpers. */
export async function authenticatedServerFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    throw new Error("Authentication required");
  }

  const response = await backendFetch(
    path,
    withBearerToken(accessToken, options),
  );

  if (!response.ok) {
    throw new Error(`FastAPI request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function getServerDrops(params: GetDropsParams = {}): Promise<PaginatedDrops> {
  const searchParams = new URLSearchParams();
  if (params.page !== undefined) searchParams.set("page", String(params.page));
  if (params.page_size !== undefined) searchParams.set("page_size", String(params.page_size));
  if (params.search) searchParams.set("search", params.search);
  if (params.status) searchParams.set("status", params.status);
  const query = searchParams.toString();
  return authenticatedServerFetch<PaginatedDrops>(`/drops${query ? `?${query}` : ""}`);
}

export function getServerDrop(dropId: string): Promise<Drop> {
  return authenticatedServerFetch<Drop>(`/drops/${encodeURIComponent(dropId)}`);
}

export function getServerDropFiles(dropId: string): Promise<DropFile[]> {
  return authenticatedServerFetch<DropFile[]>(`/drops/${encodeURIComponent(dropId)}/files`);
}

export function getServerStorageUsage(): Promise<StorageUsage> {
  return authenticatedServerFetch<StorageUsage>("/stats/me/storage");
}
