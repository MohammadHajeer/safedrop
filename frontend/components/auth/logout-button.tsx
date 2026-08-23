"use client";

import { LogOutIcon, LoaderCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { logout } from "@/lib/api/auth";
import { cn } from "@/lib/utils";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    try {
      await logout();
    } finally {
      queryClient.clear();
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      className={cn("justify-start text-muted-foreground", className)}
      onClick={handleLogout}
      disabled={pending}
    >
      {pending ? <LoaderCircleIcon className="animate-spin" /> : <LogOutIcon />}
      {pending ? "Logging out…" : "Log out"}
    </Button>
  );
}
