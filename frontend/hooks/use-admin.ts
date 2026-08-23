"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createAdminUser,
  deleteAdminUser,
  getAdminStats,
  getAdminStorage,
  getAdminUsers,
  updateAdminUser,
  type AdminUserCreateInput,
  type AdminUserParams,
  type AdminUserUpdateInput,
} from "@/lib/api/admin";

export const adminKeys = {
  all: ["admin"] as const,
  users: () => ["admin", "users"] as const,
  userList: (params: AdminUserParams) => ["admin", "users", params] as const,
  user: (userId: string) => ["admin", "user", userId] as const,
  stats: ["admin", "stats"] as const,
  storage: ["admin", "storage"] as const,
};

export function useAdminUsers(params: AdminUserParams) {
  return useQuery({
    queryKey: adminKeys.userList(params),
    queryFn: () => getAdminUsers(params),
    placeholderData: keepPreviousData,
  });
}

export function useAdminStats() {
  return useQuery({ queryKey: adminKeys.stats, queryFn: getAdminStats });
}

export function useAdminStorage() {
  return useQuery({ queryKey: adminKeys.storage, queryFn: getAdminStorage });
}

function useInvalidateAdminUserData() {
  const queryClient = useQueryClient();
  return (userId?: string) => {
    void queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    void queryClient.invalidateQueries({ queryKey: adminKeys.stats });
    if (userId) {
      void queryClient.invalidateQueries({ queryKey: adminKeys.user(userId) });
    }
  };
}

export function useCreateAdminUser() {
  const invalidate = useInvalidateAdminUserData();
  return useMutation({
    mutationFn: (input: AdminUserCreateInput) => createAdminUser(input),
    onSuccess: (user) => invalidate(user.id),
  });
}

export function useUpdateAdminUser() {
  const invalidate = useInvalidateAdminUserData();
  return useMutation({
    mutationFn: ({
      userId,
      input,
    }: {
      userId: string;
      input: AdminUserUpdateInput;
    }) => updateAdminUser(userId, input),
    onSuccess: (user) => invalidate(user.id),
  });
}

export function useDeleteAdminUser() {
  const invalidate = useInvalidateAdminUserData();
  return useMutation({
    mutationFn: (userId: string) => deleteAdminUser(userId),
    onSuccess: (_, userId) => invalidate(userId),
  });
}
