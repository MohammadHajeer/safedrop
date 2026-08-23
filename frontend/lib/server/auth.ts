import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth-cookies";
import type { User } from "@/lib/auth-types";

import { backendFetch, withBearerToken } from "./backend";

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return null;
  }

  const response = await backendFetch(
    "/users/me",
    withBearerToken(accessToken),
  );

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`FastAPI /users/me failed with status ${response.status}`);
  }

  return response.json() as Promise<User>;
});

export async function requireCurrentUser(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdminUser(): Promise<User> {
  const user = await requireCurrentUser();

  if (user.type !== "admin") {
    redirect("/dashboard");
  }

  return user;
}
