"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { login } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";

export function LoginForm({ nextPath = "/dashboard" }: { nextPath?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);

    try {
      await login({
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      });
      router.replace(nextPath);
      router.refresh();
    } catch (caught) {
      setError(getApiErrorMessage(caught));
      setPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block">Email<input className="mt-1 block w-full rounded border p-2" name="email" type="email" autoComplete="email" required /></label>
      <label className="block">Password<input className="mt-1 block w-full rounded border p-2" name="password" type="password" autoComplete="current-password" required /></label>
      {error ? <p role="alert">{error}</p> : null}
      <button className="rounded border px-4 py-2" disabled={pending}>{pending ? "Logging in…" : "Log in"}</button>
    </form>
  );
}
