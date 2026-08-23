import "server-only";

import { cookies } from "next/headers";

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth-cookies";

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
