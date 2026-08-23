import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";
import { AuthLayout } from "@/components/public/auth-layout";
import { PublicShell } from "@/components/public/public-shell";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextPath =
    next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  return (
    <PublicShell>
      <AuthLayout
        eyebrow="Welcome back"
        title="Sign in to SafeDrop"
        description="Continue to your Drops with your secure SafeDrop account."
      >
        <LoginForm nextPath={nextPath} />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to SafeDrop?{" "}
          <Link className="font-medium text-primary hover:underline" href="/register">
            Create an account
          </Link>
        </p>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Just sharing once?{" "}
          <Link className="font-medium text-foreground hover:underline" href="/create">
            Create a guest Drop
          </Link>
        </p>
      </AuthLayout>
    </PublicShell>
  );
}
