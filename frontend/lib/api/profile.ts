import type { User } from "@/lib/auth-types";

import { bffFetch } from "./bff";

export type UpdateProfileInput = {
  first_name: string;
  last_name: string;
};

export function updateProfile(input: UpdateProfileInput): Promise<User> {
  return bffFetch<User>("/api/users/me", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}
