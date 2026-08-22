"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createDropWithFiles,
  getDrop,
  getDrops,
  revokeDrop,
  updateDrop,
  type CreateDropWithFilesInput,
  type GetDropsParams,
  type UpdateDropInput,
} from "@/lib/api/drops";

export const dropKeys = {
  all: ["drops"] as const,

  list: (params: GetDropsParams) => ["drops", "list", params] as const,

  detail: (dropId: string) => ["drops", "detail", dropId] as const,
};

export function useDrops(params: GetDropsParams = {}) {
  return useQuery({
    queryKey: dropKeys.list(params),
    queryFn: () => getDrops(params),
  });
}

export function useDrop(dropId: string) {
  return useQuery({
    queryKey: dropKeys.detail(dropId),
    queryFn: () => getDrop(dropId),
    enabled: Boolean(dropId),
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
