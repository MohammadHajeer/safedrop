import { apiFetch, setAccessToken } from "./client";

export type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  type: "client" | "admin";
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
};

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>("/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  setAccessToken(data.access_token);

  return data;
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const body = new URLSearchParams();

  body.set("username", input.email);
  body.set("password", input.password);

  const data = await apiFetch<AuthResponse>("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  setAccessToken(data.access_token);

  return data;
}

export async function getMe(): Promise<User> {
  return apiFetch<User>("/users/me", {
    auth: true,
  });
}

export async function logout(): Promise<void> {
  await apiFetch<unknown>("/logout", {
    method: "POST",
  });

  setAccessToken(null);
}
