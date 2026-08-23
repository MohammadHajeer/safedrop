import type {
  LoginInput,
  RegisterInput,
  SafeAuthResponse,
  User,
} from "@/lib/auth-types";

import { bffFetch } from "./bff";

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

export async function getMe(): Promise<User> {
  return bffFetch<User>("/api/auth/me");
}

export async function logout(): Promise<void> {
  await bffFetch<unknown>("/api/auth/logout", {
    method: "POST",
  });
}
