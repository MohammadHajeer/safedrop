import type {
  LoginInput,
  RegisterInput,
  SafeAuthResponse,
  User,
} from "@/lib/auth-types";

import { bffFetch } from "./bff";
import { ApiError } from "./errors";

export type { LoginInput, RegisterInput, User } from "@/lib/auth-types";

export function register(input: RegisterInput): Promise<SafeAuthResponse> {
  return bffFetch<SafeAuthResponse>("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export function login(input: LoginInput): Promise<SafeAuthResponse> {
  return bffFetch<SafeAuthResponse>("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export async function getMe(): Promise<User | null> {
  try {
    return await bffFetch<User>("/api/auth/me");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }

    throw error;
  }
}

export async function logout(): Promise<void> {
  await bffFetch<unknown>("/api/auth/logout", {
    method: "POST",
  });
}
