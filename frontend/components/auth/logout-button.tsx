"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { logout } from "@/lib/api/auth";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    try {
      await logout();
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return <button className="rounded border px-3 py-1" onClick={handleLogout} disabled={pending}>{pending ? "Logging out…" : "Log out"}</button>;
}
