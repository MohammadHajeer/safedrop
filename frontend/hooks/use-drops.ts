"use client";

import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createDropWithFiles,
  getDrop,
  getDropFiles,
  getDrops,
  getDropShareToken,
  revokeDrop,
  updateDrop,
  type CreateDropWithFilesInput,
  type Drop,
  type DropStatus,
  type GetDropsParams,
  type UpdateDropInput,
} from "@/lib/api/drops";
import { storageKeys } from "@/hooks/use-storage";

export type NormalizedDropListParams = {
  page: number;
  page_size: number;
  search: string;
  status: DropStatus;
};

export function normalizeDropListParams(
  params: GetDropsParams = {},
): NormalizedDropListParams {
  return {
    page: params.page ?? 1,
    page_size: params.page_size ?? 10,
    search: params.search?.trim() ?? "",
    status: params.status ?? "active",
  };
}

export const dropKeys = {
  all: ["drops"] as const,
  lists: ["drops", "list"] as const,
  list: (params: GetDropsParams = {}) =>
    ["drops", "list", normalizeDropListParams(params)] as const,
  details: ["drops", "detail"] as const,
  detail: (dropId: string) => ["drops", "detail", dropId] as const,
  files: (dropId: string) => ["drops", "files", dropId] as const,
  shareToken: (dropId: string) => ["drops", "share-token", dropId] as const,
};

export function dropListQueryOptions(params: GetDropsParams = {}) {
  const normalized = normalizeDropListParams(params);
  return queryOptions({
    queryKey: dropKeys.list(normalized),
    queryFn: () => getDrops(normalized),
  });
}

export function useDrops(params: GetDropsParams = {}) {
  return useQuery({
    ...dropListQueryOptions(params),
    placeholderData: keepPreviousData,
  });
}

export function useDrop(dropId: string) {
  return useQuery({
    queryKey: dropKeys.detail(dropId),
    queryFn: () => getDrop(dropId),
    enabled: Boolean(dropId),
  });
}

export function useDropFiles(dropId: string) {
  return useQuery({
    queryKey: dropKeys.files(dropId),
    queryFn: () => getDropFiles(dropId),
    enabled: Boolean(dropId),
  });
}

export function useDropShareToken(dropId: string) {
  return useQuery({
    queryKey: dropKeys.shareToken(dropId),
    queryFn: () => getDropShareToken(dropId),
    enabled: false,
  });
}

export function useCreateDrop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDropWithFilesInput) => createDropWithFiles(input),
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: dropKeys.lists }),
        queryClient.invalidateQueries({ queryKey: storageKeys.usage }),
      ]);
    },
  });
}

export function useUpdateDrop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dropId,
      input,
    }: {
      dropId: string;
      input: UpdateDropInput;
    }) => updateDrop(dropId, input),
    onSuccess: async (drop, variables) => {
      queryClient.setQueryData(dropKeys.detail(variables.dropId), drop);
      await queryClient.invalidateQueries({ queryKey: dropKeys.lists });
    },
  });
}

export function useRevokeDrop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dropId: string) => revokeDrop(dropId),
    onSuccess: async (_, dropId) => {
      queryClient.setQueryData<Drop>(dropKeys.detail(dropId), (current) =>
        current
          ? {
              ...current,
              status: "revoked",
              revoked_at: new Date().toISOString(),
            }
          : current,
      );
      queryClient.removeQueries({
        queryKey: dropKeys.shareToken(dropId),
        exact: true,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: dropKeys.lists }),
        queryClient.invalidateQueries({
          queryKey: dropKeys.detail(dropId),
          exact: true,
        }),
        queryClient.invalidateQueries({ queryKey: storageKeys.usage }),
      ]);
    },
  });
}
