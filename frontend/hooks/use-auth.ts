"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getMe } from "@/lib/api/auth";
import { updateProfile, type UpdateProfileInput } from "@/lib/api/profile";
import type { User } from "@/lib/auth-types";

export const authKeys = {
  all: ["auth"] as const,
  me: ["auth", "me"] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: getMe,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input),
    onSuccess: (user: User) => {
      queryClient.setQueryData(authKeys.me, user);
    },
  });
}
