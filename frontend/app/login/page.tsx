import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { AuthLayout } from "@/components/public/auth-layout";
import { PublicShell } from "@/components/public/public-shell";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to manage your SafeDrop shares.",
};

export default function LoginPage() {
  return (
    <PublicShell>
      <AuthLayout
        eyebrow="Welcome back"
        title="Sign in to SafeDrop"
        description="Pick up where you left off and manage your temporary shares."
      >
        <Suspense fallback={<Skeleton className="h-68 w-full rounded-2xl" />}>
          <LoginForm />
        </Suspense>

        <div className="mt-7 border-t pt-6">
          <p className="text-center text-sm text-muted-foreground">
            New to SafeDrop?{" "}
            <Link
              href="/register"
              className="font-medium text-primary underline-offset-4 transition-colors hover:underline"
            >
              Create an account
            </Link>
          </p>

          <p className="mt-3 text-center text-sm text-muted-foreground">
            Only sharing once?{" "}
            <Link
              href="/create"
              className="font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              Continue as guest
            </Link>
          </p>
        </div>
      </AuthLayout>
    </PublicShell>
  );
}
