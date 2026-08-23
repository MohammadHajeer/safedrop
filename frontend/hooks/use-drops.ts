"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createDropWithFiles,
  getDrop,
  getDrops,
  revokeDrop,
  updateDrop,
  type CreateDropWithFilesInput,
  type Drop,
  type GetDropsParams,
  type PaginatedDrops,
  type UpdateDropInput,
} from "@/lib/api/drops";

export const dropKeys = {
  all: ["drops"] as const,

  list: (params: GetDropsParams) => ["drops", "list", params] as const,

  detail: (dropId: string) => ["drops", "detail", dropId] as const,
};

export function useDrops(params: GetDropsParams = {}, initialData?: PaginatedDrops) {
  return useQuery({
    queryKey: dropKeys.list(params),
    queryFn: () => getDrops(params),
    initialData,
  });
}

export function useDrop(dropId: string, initialData?: Drop) {
  return useQuery({
    queryKey: dropKeys.detail(dropId),
    queryFn: () => getDrop(dropId),
    enabled: Boolean(dropId),
    initialData,
  });
}

export function useCreateDrop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDropWithFilesInput) => createDropWithFiles(input),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: dropKeys.all,
      });
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

    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: dropKeys.all,
        }),

        queryClient.invalidateQueries({
          queryKey: dropKeys.detail(variables.dropId),
        }),
      ]);
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
          ? { ...current, status: "revoked", revoked_at: new Date().toISOString() }
          : current,
      );
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: dropKeys.all,
        }),

        queryClient.invalidateQueries({
          queryKey: dropKeys.detail(dropId),
        }),
      ]);
    },
  });
}
