"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  getMe,
  login,
  logout as logoutRequest,
  register,
  type LoginInput,
  type RegisterInput,
  type User,
} from "@/lib/api/auth";

import { refreshAccessToken, setAccessToken } from "@/lib/api/client";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  register: (input: RegisterInput) => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) {
      return;
    }

    initialized.current = true;

    async function restoreSession() {
      const token = await refreshAccessToken();

      if (!token) {
        setUser(null);
        setStatus("unauthenticated");
        return;
      }

      try {
        const currentUser = await getMe();

        setUser(currentUser);
        setStatus("authenticated");
      } catch {
        setAccessToken(null);
        setUser(null);
        setStatus("unauthenticated");
      }
    }

    void restoreSession();
  }, []);

  async function handleRegister(input: RegisterInput) {
    const data = await register(input);

    setUser(data.user);
    setStatus("authenticated");
  }

  async function handleLogin(input: LoginInput) {
    const data = await login(input);

    setUser(data.user);
    setStatus("authenticated");
  }

  async function handleLogout() {
    await logoutRequest();

    setUser(null);
    setStatus("unauthenticated");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        register: handleRegister,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
