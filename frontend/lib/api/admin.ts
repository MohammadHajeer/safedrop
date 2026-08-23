import type { User } from "@/lib/auth-types";

import { bffFetch } from "./bff";
import type { StorageUsage } from "./stats";

export type AdminUser = User & {
  created_at: string;
  updated_at: string;
};

export type AdminUserParams = {
  page: number;
  page_size: number;
  search?: string;
  user_type?: "client" | "admin";
};

export type AdminUserList = {
  items: AdminUser[];
  total: number;
  page: number;
  page_size: number;
};

export type AdminUserCreateInput = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  type: "client" | "admin";
};

export type AdminUserUpdateInput = Omit<AdminUserCreateInput, "password">;

export type AdminStats = {
  total_users: number;
  total_drops: number;
  active_drops: number;
  expired_drops: number;
  consumed_drops: number;
  revoked_drops: number;
  guest_drops: number;
  authenticated_drops: number;
};

function userSearchParams(params: AdminUserParams) {
  const search = new URLSearchParams({
    page: String(params.page),
    page_size: String(params.page_size),
  });
  if (params.search) search.set("search", params.search);
  if (params.user_type) search.set("user_type", params.user_type);
  return search.toString();
}

export function getAdminUsers(params: AdminUserParams): Promise<AdminUserList> {
  return bffFetch<AdminUserList>(
    `/api/admin/users?${userSearchParams(params)}`,
  );
}

export function createAdminUser(
  input: AdminUserCreateInput,
): Promise<AdminUser> {
  return bffFetch<AdminUser>("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function updateAdminUser(
  userId: string,
  input: AdminUserUpdateInput,
): Promise<AdminUser> {
  return bffFetch<AdminUser>(`/api/admin/users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function deleteAdminUser(userId: string): Promise<void> {
  return bffFetch<void>(`/api/admin/users/${userId}`, { method: "DELETE" });
}

export function getAdminStats(): Promise<AdminStats> {
  return bffFetch<AdminStats>("/api/admin/stats");
}

export function getAdminStorage(): Promise<StorageUsage> {
  return bffFetch<StorageUsage>("/api/admin/stats/storage");
}
